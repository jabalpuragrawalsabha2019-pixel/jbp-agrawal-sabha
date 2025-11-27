// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig.extra.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig.extra.supabaseAnonKey;

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    debug: true,
  },
});

// Auth helper functions
export const authHelpers = {
  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get current session
  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } catch (error) {
      return { session: null, error };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error };
    }
  },
};

// Database helper functions
export const dbHelpers = {
  // Check if phone exists in approved members with retry logic
  checkApprovedMember: async (phone) => {
    const maxRetries = 2;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`=== START PHONE CHECK (Attempt ${attempt}/${maxRetries}) ===`);
        console.log('Input phone:', phone);
        
        // Clean phone number (remove any spaces or special chars)
        const cleanPhone = phone.replace(/\D/g, '');
        console.log('Clean phone:', cleanPhone);
        
        // Increase timeout on retry (first: 20s, second: 40s)
        const timeoutMs = attempt === 1 ? 20000 : 40000;
        console.log(`Timeout set to ${timeoutMs}ms for attempt ${attempt}`);
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Phone check timeout after ${timeoutMs}ms`)), timeoutMs);
        });
        
        console.log('Searching for phone:', cleanPhone);
        const phoneQuery = supabase
          .from('approved_members')
          .select('*')
          .eq('phone', cleanPhone)
          .maybeSingle();
        
        const result = await Promise.race([
          phoneQuery,
          timeoutPromise
        ]);
        
        const { data, error } = result;
        
        console.log(`Phone search result (attempt ${attempt}):`, { found: !!data, error: error?.message });
        console.log(`=== END PHONE CHECK (attempt ${attempt}) ===`);
        
        // If no match found, return null data (not an error)
        if (error && error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        
        if (error) {
          console.error(`Phone check error on attempt ${attempt}:`, error);
          lastError = error;
          
          // If this is not the last attempt, retry
          if (attempt < maxRetries) {
            console.log(`Retrying phone check (attempt ${attempt + 1})...`);
            // Small delay before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          // Still allow signup on error - don't block users
          return { data: null, error: null };
        }
        
        // Success
        return { data, error: null };
      } catch (error) {
        console.error(`checkApprovedMember exception on attempt ${attempt}:`, error);
        lastError = error;
        
        // If this is not the last attempt, retry
        if (attempt < maxRetries) {
          console.log(`Retrying phone check after exception (attempt ${attempt + 1})...`);
          // Small delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        console.log('=== END PHONE CHECK (exception) ===');
        // Return null data on any error (allows unverified signup)
        return { data: null, error: null };
      }
    }
    
    // Should never reach here, but just in case
    console.error('All retry attempts failed:', lastError);
    return { data: null, error: null };
  },

  // Create or update user profile
  upsertUserProfile: async (userId, profileData) => {
    try {
      console.log('upsertUserProfile called with:', { userId, profileData });
      
      // Validate required fields
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      if (!profileData.phone) {
        throw new Error('Phone number is required');
      }
      
      // Build the final data object
      const dataToUpdate = {
        id: userId,
        phone: profileData.phone.trim(),
        full_name: profileData.full_name?.trim() || '',
        city: profileData.city?.trim() || '',
        occupation: profileData.occupation?.trim() || null,
        is_verified: profileData.is_verified || false,
        photo_url: profileData.photo_url || null,
        email: profileData.email || null,
        google_id: profileData.google_id || null,
        updated_at: new Date().toISOString(),
      };
      
      console.log('Final data to upsert:', dataToUpdate);
      
      // Use a safer upsert pattern: omit explicit `returning` option (client handles it)
      // and use `maybeSingle()` to avoid throwing if the response isn't exactly one row.
      const { data, error } = await supabase
        .from('users')
        .upsert(dataToUpdate, { onConflict: 'id' })
        .select()
        .maybeSingle();
      
      console.log('Upsert result:', { success: !!data, error: error?.message });
      
      if (error) {
        console.error('upsertUserProfile error:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from upsert');
      }
      
      console.log('Profile created/updated successfully');
      return { data, error: null };
    } catch (error) {
      console.error('upsertUserProfile error:', error);
      return { data: null, error };
    }
  },

  // Get user profile
  getUserProfile: async (userId) => {
    try {
      console.log('Getting user profile for:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      console.log('Profile query result:', { data, error });
      return { data, error };
    } catch (error) {
      console.error('getUserProfile error:', error);
      return { data: null, error };
    }
  },

  // Get all verified users (directory)
  getVerifiedUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_verified', true)
        .order('full_name', { ascending: true });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Matrimonial functions
  getMatrimonialProfiles: async (filters = {}) => {
    try {
      let query = supabase
        .from('matrimonial_profiles')
        .select('*, users(*)')
        .eq('status', 'approved');

      if (filters.gender) query = query.eq('gender', filters.gender);
      if (filters.city) query = query.eq('city', filters.city);
      if (filters.gotra) query = query.eq('gotra', filters.gotra);

      const { data, error } = await query.order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  createMatrimonialProfile: async (profileData) => {
    try {
      const { data, error } = await supabase
        .from('matrimonial_profiles')
        .insert(profileData)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Events functions - UPDATED for announcements
  getEvents: async (type = 'all') => {
    try {
      let query = supabase
        .from('events')
        .select('*, users(*)')
        .eq('status', 'approved')
        .eq('is_visible', true);

      if (type === 'events') {
        query = query.eq('is_announcement', false);
      } else if (type === 'announcements') {
        query = query.eq('is_announcement', true);
      }

      const { data, error } = await query.order('event_date', { ascending: false, nullsFirst: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  createEvent: async (eventData) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Jobs functions
  getJobs: async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, users(*)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  createJob: async (jobData) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Blood donors functions
  getBloodDonors: async (bloodGroup = null, city = null) => {
    try {
      let query = supabase
        .from('blood_donors')
        .select('*, users(*)')
        .eq('is_available', true);

      if (bloodGroup) query = query.eq('blood_group', bloodGroup);
      if (city) query = query.eq('city', city);

      const { data, error } = await query.order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  registerBloodDonor: async (donorData) => {
    try {
      const { data, error } = await supabase
        .from('blood_donors')
        .insert(donorData)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Donations functions
  getDonations: async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('donated_at', { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  recordDonation: async (donationData) => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .insert(donationData)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Post holders functions
  getPostHolders: async () => {
    try {
      const { data, error } = await supabase
        .from('post_holders')
        .select('*, users(*)')
        .order('display_order', { ascending: true });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Contact request (matrimonial)
  createContactRequest: async (profileId, requesterId) => {
    try {
      const { data, error } = await supabase
        .from('contact_requests')
        .insert({
          profile_id: profileId,
          requester_id: requesterId,
        })
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Storage helper functions
export const storageHelpers = {
  // Upload file to Supabase Storage
  uploadFile: async (bucket, path, file) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get public URL for file
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete file
  deleteFile: async (bucket, path) => {
    try {
      const { data, error } = await supabase.storage.from(bucket).remove([path]);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

export default supabase;