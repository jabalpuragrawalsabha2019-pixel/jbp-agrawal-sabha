// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';
import { Linking } from 'react-native';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check active session
    checkUser();

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    const authSubscription = data?.subscription;

    // Handler for incoming URLs (deep links)
    const handleUrl = async ({ url }) => {
      try {
        console.log('Deep link received:', url);

        // If supabase client exposes getSessionFromUrl (v2 helper), use it
        if (supabase?.auth && typeof supabase.auth.getSessionFromUrl === 'function') {
          // Some versions expect the raw URL (the one containing access_token in fragment)
          const result = await supabase.auth.getSessionFromUrl({ url });
          console.log('supabase.auth.getSessionFromUrl result:', result);
        } else {
          // Fallback: try to parse tokens from the URL (fragment or query)
          console.log('Supabase helper not present; URL:', url);
          try {
            const parseParamsFromUrl = (u) => {
              // Prefer fragment (#) then query (?)
              const [, fragment] = u.split('#');
              const queryPart = fragment ?? (u.includes('?') ? u.split('?')[1] : '');
              const params = {};
              if (!queryPart) return params;
              queryPart.split('&').forEach(pair => {
                if (!pair) return;
                const [k, v] = pair.split('=');
                try {
                  params[decodeURIComponent(k)] = decodeURIComponent(v || '');
                } catch (e) {
                  params[k] = v || '';
                }
              });
              return params;
            };

            const params = parseParamsFromUrl(url);
            console.log('Parsed deep link params:', params);

            if (params.access_token) {
              // If we have tokens, set the session directly
              try {
                const { data, error } = await supabase.auth.setSession({
                  access_token: params.access_token,
                  refresh_token: params.refresh_token,
                });
                console.log('supabase.auth.setSession result:', { data, error });

                // Refresh local session state
                try {
                  const { data: sessionData } = await supabase.auth.getSession();
                  setSession(sessionData.session ?? sessionData);
                  setUser((sessionData.session ?? sessionData)?.user ?? null);
                } catch (e) {
                  console.error('Error fetching session after setSession:', e);
                }

                setLoading(false);
              } catch (e) {
                console.error('Error calling supabase.auth.setSession:', e);
              }
            } else {
              console.log('No access_token found in deep link params.');
            }
          } catch (err) {
            console.error('Error parsing deep link params:', err);
          }
        }
      } catch (err) {
        console.error('Error handling deep link:', err);
      }
    };

    // Subscribe to URL events
    // React Native >0.65 supports Linking.addEventListener returning a subscription
    let urlSubscription;
    if (typeof Linking.addEventListener === 'function') {
      // addEventListener may return a subscription object in newer RN versions
      try {
        urlSubscription = Linking.addEventListener('url', handleUrl);
      } catch (e) {
        // Fallback for different RN versions
        Linking.addEventListener('url', handleUrl);
      }
    } else if (Linking.addListener) {
      urlSubscription = Linking.addListener('url', handleUrl);
    }

    // Handle the initial URL if app opened by the redirect
    (async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          handleUrl({ url: initialUrl });
        }
      } catch (err) {
        console.error('getInitialURL error', err);
      }
    })();

    return () => {
      // remove listener (subscription may differ by RN version)
      try {
        urlSubscription?.remove?.();
      } catch (e) {
        // fallback for older RN:
        Linking.removeEventListener && Linking.removeEventListener('url', handleUrl);
      }

      // unsubscribe from Supabase auth changes
      try {
        authSubscription?.unsubscribe?.();
      } catch (e) {
        // best-effort unsubscribe fallback
        authSubscription && authSubscription.unsubscribe && authSubscription.unsubscribe();
      }
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};