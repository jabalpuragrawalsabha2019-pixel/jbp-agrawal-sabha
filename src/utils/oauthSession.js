/**
 * Google OAuth helpers for Expo + Supabase.
 * Builds a stable redirect URI, opens the auth browser, and creates a session from the callback URL.
 */
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import Constants from 'expo-constants';
import { supabase } from '../config/supabase';

WebBrowser.maybeCompleteAuthSession();

const NATIVE_REDIRECT = 'com.jbpagrawal.sabha://auth/callback';

/**
 * Returns the OAuth redirect URI for the current runtime.
 * Expo Go uses exp://…; standalone / dev clients use the native scheme.
 * @returns {string}
 */
export function getAuthRedirectUrl() {
  const isExpoGo = Constants.appOwnership === 'expo';

  if (!isExpoGo) {
    return makeRedirectUri({
      scheme: 'com.jbpagrawal.sabha',
      path: 'auth/callback',
      native: NATIVE_REDIRECT,
    });
  }

  // Expo Go cannot claim the custom scheme; use Expo's linking URL.
  return makeRedirectUri({
    scheme: 'com.jbpagrawal.sabha',
    path: 'auth/callback',
  });
}

/**
 * Parses tokens from an OAuth callback URL and sets the Supabase session.
 * @param {string} url - Deep-link / auth-session callback URL
 * @returns {Promise<object|null>} Session or null if no access token
 */
export async function createSessionFromUrl(url) {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const { access_token, refresh_token } = params;

  if (!access_token) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    throw error;
  }

  return data.session;
}

/**
 * Runs Google OAuth via in-app browser and returns the established session.
 * Also listens for Linking events because Android may return "dismiss" after a successful redirect.
 * @returns {Promise<{session: object|null, cancelled: boolean}>}
 */
export async function signInWithGoogleOAuth() {
  const redirectTo = getAuthRedirectUrl();
  console.log('OAuth redirect URL:', redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.url) {
    throw new Error('No OAuth URL returned from Supabase');
  }

  let linkedUrl = null;
  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (url) {
      linkedUrl = url;
    }
  });

  try {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
      showInRecents: true,
      preferEphemeralSession: false,
    });

    console.log('Browser auth result:', result.type);

    const callbackUrl =
      (result.type === 'success' && result.url) || linkedUrl || null;

    if (callbackUrl) {
      const session = await createSessionFromUrl(callbackUrl);
      return { session, cancelled: false };
    }

    // Late deep link after dismiss (common on Android)
    if (result.type === 'dismiss' || result.type === 'cancel') {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (linkedUrl) {
        const session = await createSessionFromUrl(linkedUrl);
        return { session, cancelled: false };
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        return { session, cancelled: false };
      }

      return { session: null, cancelled: true };
    }

    throw new Error('Sign in did not complete. Check Supabase redirect URLs.');
  } finally {
    subscription.remove();
  }
}
