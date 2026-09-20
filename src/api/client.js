/**
 * Authenticated fetch helper for the Vercel backend API.
 * Attaches the Supabase access token and talks to EXPO_PUBLIC_API_URL.
 */
import Constants from 'expo-constants';
import { supabase } from '../config/supabase';

/**
 * Resolves the backend base URL from Expo config / env.
 * @returns {string}
 */
export function getApiBaseUrl() {
  return (
    Constants.expoConfig?.extra?.apiUrl ||
    process.env.EXPO_PUBLIC_API_URL ||
    ''
  ).replace(/\/$/, '');
}

/**
 * Reads the current Supabase access token.
 * @returns {Promise<string|null>}
 */
async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * Calls a backend API path with the user JWT.
 * @param {string} path - e.g. /api/profile?action=complete
 * @param {object} options - fetch options (method, body, ...)
 * @returns {Promise<object>} Parsed JSON
 */
export async function apiRequest(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is not configured. Set it to your Vercel admin/API URL.',
    );
  }

  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.error || `API error (${response.status})`);
  }

  return json;
}
