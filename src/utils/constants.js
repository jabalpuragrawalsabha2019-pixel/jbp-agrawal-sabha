// src/utils/constants.js

// Agrasen-Inspired Theme Colors
export const COLORS = {
  // Primary Colors (Agrasen theme)
  primary: '#F97316', // Orange 500
  primaryDark: '#EA580C', // Orange 600
  primaryLight: '#FB923C', // Orange 400
  
  // Secondary Colors
  secondary: '#F59E0B', // Amber 500
  secondaryDark: '#D97706', // Amber 600
  secondaryLight: '#FBBF24', // Amber 400
  
  // Accent
  accent: '#DC2626', // Red 600
  accentLight: '#EF4444', // Red 500
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Status Colors
  success: '#10B981', // Green 500
  warning: '#F59E0B', // Amber 500
  error: '#EF4444', // Red 500
  info: '#3B82F6', // Blue 500
  
  // Background
  background: '#FFF7ED', // Orange 50
  backgroundLight: '#FFFBF5',
  
  // Special
  gold: '#FFD700',
  saffron: '#FF9933',
};

// Typography
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  semibold: 'System',
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

// Border Radius
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadow Presets
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Blood Groups
export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

// Gotras (Common Agrawal Gotras)
export const GOTRAS = [
  'Garg',
  'Goyal',
  'Bansal',
  'Singhal',
  'Tingal',
  'Mangal',
  'Bindal',
  'Mittal',
  'Tayal',
  'Kansal',
  'Jindal',
  'Airan',
  'Bhandal',
  'Dharan',
  'Madhukul',
  'Nagil',
  'Other'
];

// Cities in Madhya Pradesh (for JBP Agrawal community)
export const CITIES = [
  'Jabalpur',
  'Bhopal',
  'Indore',
  'Gwalior',
  'Ujjain',
  'Sagar',
  'Ratlam',
  'Satna',
  'Dewas',
  'Rewa',
  'Katni',
  'Singrauli',
  'Burhanpur',
  'Khandwa',
  'Bhind',
  'Chhindwara',
  'Guna',
  'Shivpuri',
  'Vidisha',
  'Damoh',
  'Mandsaur',
  'Khargone',
  'Neemuch',
  'Pithampur',
  'Hoshangabad',
  'Other'
];

// Education Levels
export const EDUCATION_LEVELS = [
  '10th Pass',
  '12th Pass',
  'Diploma',
  'Graduate (BA/BSc/BCom)',
  'Post Graduate (MA/MSc/MCom)',
  'BE/B.Tech',
  'ME/M.Tech',
  'MBA',
  'CA',
  'CS',
  'Medical (MBBS/BDS)',
  'Law (LLB)',
  'PhD/Doctorate',
  'Other'
];

// Occupations
export const OCCUPATIONS = [
  'Business Owner',
  'Service (Private)',
  'Service (Government)',
  'Self Employed',
  'Professional (CA/CS/Lawyer)',
  'Doctor',
  'Engineer',
  'Teacher/Professor',
  'IT Professional',
  'Banking/Finance',
  'Marketing/Sales',
  'Agriculture',
  'Student',
  'Homemaker',
  'Retired',
  'Other'
];

// Post Holder Designations
export const DESIGNATIONS = [
  'President',
  'Senior Vice President',
  'Vice President',
  'Women Vice President',
  'Secretary',
  'Treasurer',
  'Joint Secretary',
  'Secretary (Publicity)',
  'Deputy Secretary'
];

// Event Types
export const EVENT_TYPES = [
  { value: 'event', label: 'Community Event' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'news', label: 'News' },
  { value: 'festival', label: 'Festival' },
  { value: 'meeting', label: 'Meeting' },
];

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

// Privacy Options
export const PRIVACY_OPTIONS = [
  { value: 'all', label: 'Visible to All Members' },
  { value: 'verified', label: 'Visible to Verified Members Only' },
  { value: 'hidden', label: 'Hidden (Admin Only)' },
];

// Notification Types
export const NOTIFICATION_TYPES = {
  EVENT: 'event',
  MATRIMONIAL: 'matrimonial',
  JOB: 'job',
  BLOOD: 'blood',
  ANNOUNCEMENT: 'announcement',
  SYSTEM: 'system',
};

// Status Types
export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Contact Request Status
export const CONTACT_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

// App Information
export const APP_INFO = {
  name: 'JBP Agrawal Sabha',
  version: '1.0.0',
  tagline: 'Unity • Prosperity • Service',
  email: 'info@jbpagrawal.com',
  phone: '+91-XXXXXXXXXX',
  website: 'https://jbpagrawal.com',
  
  // UPI for donations
  upiId: 'jbpagrawal@paytm',
  upiName: 'JBP Agrawal Sabha',
  
  // Social Media (if any)
  facebook: '',
  instagram: '',
  twitter: '',
};

// API Endpoints (if using Supabase Functions)
export const API_ENDPOINTS = {
  generateReceipt: '/functions/v1/generate-receipt',
  sendNotification: '/functions/v1/send-notification',
  verifyUser: '/functions/v1/verify-user',
};

// Storage Buckets
export const STORAGE_BUCKETS = {
  PROFILES: 'profiles',
  MATRIMONIAL: 'matrimonial',
  EVENTS: 'events',
  JOBS: 'jobs',
  DONATIONS: 'donations',
  DOCUMENTS: 'documents',
};

// Regex Patterns
export const PATTERNS = {
  phone: /^[6-9]\d{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  upiId: /^[\w.-]+@[\w.-]+$/,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  AUTH: 'Authentication failed. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  UPLOAD: 'File upload failed. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  POST_CREATED: 'Posted successfully! Awaiting admin approval.',
  REQUEST_SENT: 'Request sent successfully!',
  DONATION_RECORDED: 'Donation recorded. Thank you!',
  REGISTERED: 'Registered successfully!',
};

export default {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
  SHADOWS,
  BLOOD_GROUPS,
  GOTRAS,
  CITIES,
  EDUCATION_LEVELS,
  OCCUPATIONS,
  DESIGNATIONS,
  EVENT_TYPES,
  GENDER_OPTIONS,
  PRIVACY_OPTIONS,
  NOTIFICATION_TYPES,
  STATUS,
  CONTACT_REQUEST_STATUS,
  APP_INFO,
  API_ENDPOINTS,
  STORAGE_BUCKETS,
  PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};