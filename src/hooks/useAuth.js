// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from "react";
import { supabase, authHelpers, dbHelpers } from "../config/supabase";
import { checkMembership, completeProfile } from "../api/profileApi";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    getInitialSession();

    // Listen for auth changes. Do not block UI while loading profile from DB.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Load profile asynchronously; don't await here to avoid blocking the UI
          loadUserProfile(session.user.id).catch((err) => {
            console.error("Async loadUserProfile error:", err);
          });
        } else {
          setProfile(null);
        }

        // Unblock UI immediately; profile will update when loaded
        setLoading(false);
      },
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
        // Do not block startup on profile load; run it asynchronously
        loadUserProfile(session.user.id).catch((err) =>
          console.error("Initial loadUserProfile error:", err),
        );
      }
    } catch (error) {
      console.error("Error loading session:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      console.log("Loading profile for user:", userId);
      const { data, error } = await dbHelpers.getUserProfile(userId);

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned (user doesn't have profile yet)
        console.error("Error loading profile:", error);
      } else if (data) {
        console.log("Profile loaded:", data.full_name, data.phone);
        setProfile(data);
      } else {
        console.log("No profile found for user");
        setProfile(null);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setProfile(null);
    }
  };

  const signInWithGoogle = async (idToken) => {
    // This method is no longer used - OAuth handled in LoginScreen
    return { data: null, error: new Error("Use OAuth flow in LoginScreen") };
  };

  const signOut = async () => {
    try {
      console.log("=== SIGN OUT STARTED ===");

      // First, clear auth state
      setUser(null);
      setProfile(null);
      setSession(null);

      // Sign out from Supabase
      const { error } = await authHelpers.signOut();
      if (error) {
        console.error("Supabase sign out error:", error);
      }

      // CRITICAL: Clear all AsyncStorage auth data
      try {
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        console.log("Clearing AsyncStorage...");

        // Get all keys
        const keys = await AsyncStorage.getAllKeys();
        console.log("AsyncStorage keys:", keys);

        // Remove Supabase auth keys
        const authKeys = keys.filter(
          (key) =>
            key.includes("supabase.auth.token") ||
            key.includes("supabase-auth-token") ||
            key.includes("@supabase"),
        );

        if (authKeys.length > 0) {
          console.log("Removing auth keys:", authKeys);
          await AsyncStorage.multiRemove(authKeys);
        }

        console.log("AsyncStorage cleared successfully");
      } catch (storageError) {
        console.error("Error clearing AsyncStorage:", storageError);
      }

      console.log("=== SIGN OUT COMPLETED ===");
      return { error: null };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error("No user logged in");

      const { data, error } = await dbHelpers.upsertUserProfile(
        user.id,
        updates,
      );
      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error("Update profile error:", error);
      return { data: null, error };
    }
  };

  const checkPhoneVerification = async (phone) => {
    try {
      console.log("Starting phone verification for:", phone);
      const result = await checkMembership(phone);
      return {
        data: result.verified
          ? {
              verified: true,
              full_name: result.member?.full_name,
              city: result.member?.city,
              gotra: result.member?.gotra,
            }
          : null,
        error: null,
      };
    } catch (error) {
      console.error("Phone verification error:", error);
      // Fail closed for membership — do not treat network errors as verified
      return { data: null, error };
    }
  };

  const createUserProfile = async (profileData) => {
    try {
      if (!user) throw new Error("No user logged in");

      console.log("Creating profile via secure API for user:", user.id);

      const { data, verified } = await completeProfile({
        phone: profileData.phone,
        full_name: profileData.full_name,
        gender: profileData.gender || null,
        guardian_type: profileData.guardian_type || "father",
        guardian_name: profileData.guardian_name || null,
        city: profileData.city,
        address: profileData.address || null,
        pincode: profileData.pincode || null,
        occupation: profileData.occupation || null,
        photo_url: profileData.photo_url || null,
        email: user.email,
        google_id: user.user_metadata?.sub,
      });

      console.log("Profile created successfully:", data?.id, "verified:", verified);
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error("Create profile error:", error);
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
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default useAuth;
