// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase, authHelpers, dbHelpers } from '../config/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    getInitialSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const getInitialSession = async () => {
    try {
      const { session, error } = await authHelpers.getSession();
      if (error) throw error;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      console.log('Loading profile for user:', userId);
      const { data, error } = await dbHelpers.getUserProfile(userId);
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (user doesn't have profile yet)
        console.error('Error loading profile:', error);
      } else if (data) {
        console.log('Profile loaded:', data.full_name, data.phone);
        setProfile(data);
      } else {
        console.log('No profile found for user');
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    }
  };

  const signInWithGoogle = async (idToken) => {
    // This method is no longer used - OAuth handled in LoginScreen
    return { data: null, error: new Error('Use OAuth flow in LoginScreen') };
  };

  const signOut = async () => {
    try {
      console.log('=== SIGN OUT STARTED ===');
      
      // First, clear auth state
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Sign out from Supabase
      const { error } = await authHelpers.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
      }
      
      // CRITICAL: Clear all AsyncStorage auth data
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        console.log('Clearing AsyncStorage...');
        
        // Get all keys
        const keys = await AsyncStorage.getAllKeys();
        console.log('AsyncStorage keys:', keys);
        
        // Remove Supabase auth keys
        const authKeys = keys.filter(key => 
          key.includes('supabase.auth.token') || 
          key.includes('supabase-auth-token') ||
          key.includes('@supabase')
        );
        
        if (authKeys.length > 0) {
          console.log('Removing auth keys:', authKeys);
          await AsyncStorage.multiRemove(authKeys);
        }
        
        console.log('AsyncStorage cleared successfully');
      } catch (storageError) {
        console.error('Error clearing AsyncStorage:', storageError);
      }
      
      console.log('=== SIGN OUT COMPLETED ===');
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await dbHelpers.upsertUserProfile(user.id, updates);
      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  };

  const checkPhoneVerification = async (phone) => {
    try {
      console.log('Starting phone verification for:', phone);
      const { data, error } = await dbHelpers.checkApprovedMember(phone);
      
      // Even if there's an error, we allow signup as unverified
      if (error) {
        console.log('Phone check error (allowing unverified):', error);
        return { data: null, error: null };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Phone verification error:', error);
      // Always allow signup, just as unverified
      return { data: null, error: null };
    }
  };

  const createUserProfile = async (profileData) => {
    try {
      if (!user) throw new Error('No user logged in');

      console.log('Creating profile for user:', user.id);
      console.log('Profile data:', profileData);

      const profilePayload = {
        google_id: user.user_metadata?.sub,
        email: user.email,
        phone: profileData.phone,
        full_name: profileData.full_name,
        city: profileData.city,
        occupation: profileData.occupation || null,
        photo_url: profileData.photo_url || null,
        is_verified: profileData.is_verified || false,
      };

      console.log('Payload to send:', profilePayload);

      const { data, error } = await dbHelpers.upsertUserProfile(user.id, profilePayload);

      if (error) {
        console.error('Profile creation failed:', error);
        throw error;
      }

      console.log('Profile created successfully:', data);
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Create profile error:', error);
      return { data: null, error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const isVerified = profile?.is_verified || false;
  const isAdmin = profile?.is_admin || false;
  const needsPhoneVerification = user && !profile; // Has user but no profile

  const value = {
    user,
    profile,
    session,
    loading,
    isVerified,
    isAdmin,
    needsPhoneVerification,
    signInWithGoogle,
    signOut,
    updateProfile,
    checkPhoneVerification,
    createUserProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default useAuth;