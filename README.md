# JBP Agrawal Sabha - Technical Documentation & Developer Guide

## Project Overview
**JBP Agrawal Sabha** is a cross-platform mobile application built with React Native and Expo for the Jabalpur Agrawal Sabha community. It functions as a central portal for community members to connect, search directories, view events and announcements, access matrimonial services, explore job opportunities, register as blood donors, view community office bearers, and track donations.

---

## Purpose
The primary objective of the application is to digitize community engagement for Jabalpur Agrawal Sabha by providing:
1. A verified registry and directory of community members.
2. A two-tiered access system distinguishing verified members (who have full posting privileges) from unverified users (who receive read-only access).
3. Specialized community modules including Matrimonial matchmaking, Job postings, Blood Donor directory, Events, and Announcements.

---

## Where to Look First

Quick reference guide for AI assistants and developers modifying or debugging specific components:

* **If modifying Authentication or Session Persistence:**
  * Inspect [`src/hooks/useAuth.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/hooks/useAuth.js)
  * Inspect [`src/screens/Auth/LoginScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Auth/LoginScreen.js)
  * Inspect [`src/navigation/AppNavigator.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/navigation/AppNavigator.js)
* **If modifying UI Styles, Theme Tokens, or Shared Components:**
  * Inspect [`src/utils/constants.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/utils/constants.js) (Colors, fonts, spacing, shadows)
  * Inspect [`src/components/common/Button.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/components/common/Button.js)
  * Inspect [`src/components/common/Card.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/components/common/Card.js)
* **If modifying Database API Calls or Query Helpers:**
  * Inspect [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js) (`dbHelpers` & `authHelpers`)
* **If modifying Image Uploads or Media Storage:**
  * Inspect [`src/config/cloudinary.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/cloudinary.js)
  * Inspect [`src/screens/Matrimonial/CreateMatrimonialScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Matrimonial/CreateMatrimonialScreen.js)
  * Inspect [`src/screens/Profile/ProfileScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Profile/ProfileScreen.js)
* **If modifying App Configuration, Deep Links, or Environment Variables:**
  * Inspect [`app.config.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/app.config.js)
  * Inspect [`eas.json`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/eas.json)
  * Inspect [`.env`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/.env)
* **If fixing Google OAuth Redirect / Deep Link Callback:**
  * Inspect [`src/screens/Auth/LoginScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Auth/LoginScreen.js#L57-L160)
  * Inspect [`app.config.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/app.config.js#L44-L62)
* **If fixing Phone Verification & Member Registry Lookup:**
  * Inspect [`src/screens/Auth/PhoneVerificationScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Auth/PhoneVerificationScreen.js)
  * Inspect [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js#L62-L154)
* **If fixing Animated Train Marquee on Home Screen:**
  * Inspect [`src/components/common/TrainAnimation.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/components/common/TrainAnimation.js)
  * Inspect [`src/screens/Home/HomeScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Home/HomeScreen.js)

---

## AI Navigation Map

Feature-by-feature directory map detailing files, components, functions, endpoints, dependencies, and side effects across the codebase:

### 1. Feature: Authentication & OAuth Session Management
* **Purpose:** Authenticate users via Google OAuth 2.0, parse deep link callbacks, maintain session persistence in AsyncStorage, and provide global auth state.
* **Entry point:** [`src/screens/Auth/LoginScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Auth/LoginScreen.js) & [`src/hooks/useAuth.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/hooks/useAuth.js)
* **Main files:** [`src/screens/Auth/LoginScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Auth/LoginScreen.js), [`src/hooks/useAuth.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/hooks/useAuth.js), [`src/navigation/AppNavigator.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/navigation/AppNavigator.js), [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js)
* **Related components:** `AuthProvider` ([`useAuth.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/hooks/useAuth.js#L7-L249))
* **API endpoints:** Supabase Auth endpoints (`/auth/v1/authorize`, `/auth/v1/token`)
* **Database/storage:** `@react-native-async-storage/async-storage` (token cache)
* **External services:** Google OAuth 2.0 API, Supabase Auth
* **Important functions/classes:** `handleGoogleSignIn()`, `useAuth()`, `AuthProvider`, `signOut()`, `authHelpers.getSession()`, `supabase.auth.setSession()`
* **Dependencies:** `@supabase/supabase-js`, `expo-auth-session`, `expo-web-browser`, `@react-native-async-storage/async-storage`
* **Potential side effects:** Signing out scrubs all Supabase keys from AsyncStorage; session state change triggers top-level route switching in `AppNavigator`.

---

### 2. Feature: Phone Verification & Member Profile Setup
* **Purpose:** Verify user phone number against approved member registry (`approved_members`) and create/upsert user profile in `users` table with appropriate verification level (`is_verified`).
* **Entry point:** [`src/screens/Auth/PhoneVerificationScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Auth/PhoneVerificationScreen.js)
* **Main files:** [`src/screens/Auth/PhoneVerificationScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Auth/PhoneVerificationScreen.js), [`src/hooks/useAuth.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/hooks/useAuth.js), [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js)
* **Related components:** [`Card.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/components/common/Card.js), [`Button.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/components/common/Button.js)
* **API endpoints:** Supabase PostgREST endpoints (`GET /rest/v1/approved_members`, `POST/PATCH /rest/v1/users`)
* **Database/storage:** `approved_members` table, `users` table
* **External services:** Supabase Database
* **Important functions/classes:** `handleVerifyPhone()`, `handleCompleteProfile()`, `checkPhoneVerification()`, `createUserProfile()`, `dbHelpers.checkApprovedMember()`, `dbHelpers.upsertUserProfile()`
* **Dependencies:** `@supabase/supabase-js`, `expo-linear-gradient`, `@expo/vector-icons`
* **Potential side effects:** Successful profile creation updates `profile` state in `useAuth`, causing `AppNavigator` to switch navigation tree from `PhoneVerification` stack to `MainTabs`.

---

### 3. Feature: Home Dashboard & Animated Train Marquee
* **Purpose:** Render quick access feature grid, display upcoming events, community statistics, and run animated announcement marquee train (`TrainAnimation`).
* **Entry point:** [`src/screens/Home/HomeScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Home/HomeScreen.js)
* **Main files:** [`src/screens/Home/HomeScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Home/HomeScreen.js), [`src/components/common/TrainAnimation.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/components/common/TrainAnimation.js), [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js)
* **Related components:** [`TrainAnimation.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/components/common/TrainAnimation.js), [`Card.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/components/common/Card.js)
* **API endpoints:** Supabase PostgREST endpoint (`GET /rest/v1/events`)
* **Database/storage:** `events` table
* **External services:** Supabase Database
* **Important functions/classes:** `loadHomeData()`, `handleModulePress()`, `dbHelpers.getEvents()`, `TrainAnimation`
* **Dependencies:** `react-native` (Animated API), `@expo/vector-icons`
* **Potential side effects:** Tapping feature cards requiring verification will display an alert blocking unverified members.

---

### 4. Feature: Matrimonial Matchmaking & Media Upload
* **Purpose:** Browse matrimonial profiles, filter by gotra/gender/city, view detail card, upload candidate photos to Cloudinary, insert new profile into database, and submit contact requests.
* **Entry point:** [`src/screens/Matrimonial/MatrimonialListScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Matrimonial/MatrimonialListScreen.js)
* **Main files:** [`src/screens/Matrimonial/MatrimonialListScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Matrimonial/MatrimonialListScreen.js), [`src/screens/Matrimonial/MatrimonialDetailScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Matrimonial/MatrimonialDetailScreen.js), [`src/screens/Matrimonial/CreateMatrimonialScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Matrimonial/CreateMatrimonialScreen.js), [`src/config/cloudinary.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/cloudinary.js), [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js)
* **Related components:** `Card`, `Button`, `expo-image-picker`
* **API endpoints:** Supabase endpoints (`/rest/v1/matrimonial_profiles`, `/rest/v1/contact_requests`), Cloudinary REST endpoint (`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`)
* **Database/storage:** `matrimonial_profiles` table, `contact_requests` table, Cloudinary Media Storage
* **External services:** Cloudinary API, Supabase Database
* **Important functions/classes:** `dbHelpers.getMatrimonialProfiles()`, `dbHelpers.createMatrimonialProfile()`, `dbHelpers.createContactRequest()`, `uploadImageToCloudinary()`
* **Dependencies:** `expo-image-picker`, `cloudinary-react-native`, `@supabase/supabase-js`
* **Potential side effects:** Submitting a profile uploads photos to Cloudinary sequentially before inserting a database record; upload failures throw errors and prevent record creation.

---

### 5. Feature: Community Directory & User Profile Management
* **Purpose:** Browse directory of verified community members, update profile details, and change profile avatar with Cloudinary upload.
* **Entry point:** [`src/screens/Profile/DirectoryScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Profile/DirectoryScreen.js) & [`src/screens/Profile/ProfileScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Profile/ProfileScreen.js)
* **Main files:** [`src/screens/Profile/DirectoryScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Profile/DirectoryScreen.js), [`src/screens/Profile/ProfileScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Profile/ProfileScreen.js), [`src/hooks/useAuth.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/hooks/useAuth.js), [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js), [`src/config/cloudinary.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/cloudinary.js)
* **Related components:** `Card`, `Button`, `expo-image-picker`
* **API endpoints:** Supabase endpoint (`/rest/v1/users`), Cloudinary upload endpoint
* **Database/storage:** `users` table, Cloudinary Storage
* **External services:** Cloudinary API, Supabase Database
* **Important functions/classes:** `dbHelpers.getVerifiedUsers()`, `updateProfile()`, `dbHelpers.upsertUserProfile()`, `uploadImageToCloudinary()`
* **Dependencies:** `expo-image-picker`, `@supabase/supabase-js`
* **Potential side effects:** Profile updates overwrite the user record in `users` table and refresh global `profile` state.

---

### 6. Feature: Events & Announcements
* **Purpose:** Display community events and news announcements, view detailed event info, and filter announcements.
* **Entry point:** [`src/screens/Events/EventsScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Events/EventsScreen.js)
* **Main files:** [`src/screens/Events/EventsScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Events/EventsScreen.js), [`src/screens/Events/EventDetailScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Events/EventDetailScreen.js), [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js)
* **Related components:** `Card`, `Button`
* **API endpoints:** Supabase endpoint (`GET /rest/v1/events`)
* **Database/storage:** `events` table
* **External services:** Supabase Database
* **Important functions/classes:** `dbHelpers.getEvents()`, `dbHelpers.createEvent()`
* **Dependencies:** `@supabase/supabase-js`
* **Potential side effects:** Events marked `is_announcement = true` or `is_featured = true` populate the `HomeScreen` train marquee.

---

### 7. Feature: Job Opportunities Board
* **Purpose:** Search career opportunities and post job openings for community members.
* **Entry point:** [`src/screens/Jobs/JobsScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Jobs/JobsScreen.js)
* **Main files:** [`src/screens/Jobs/JobsScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Jobs/JobsScreen.js), [`src/screens/Jobs/PostJobScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Jobs/PostJobScreen.js), [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js)
* **Related components:** `Card`, `Button`
* **API endpoints:** Supabase endpoint (`/rest/v1/jobs`)
* **Database/storage:** `jobs` table
* **External services:** Supabase Database
* **Important functions/classes:** `dbHelpers.getJobs()`, `dbHelpers.createJob()`
* **Dependencies:** `@supabase/supabase-js`
* **Potential side effects:** Unverified users are blocked from creating job posts.

---

### 8. Feature: Blood Donor Directory & Registration
* **Purpose:** Search available blood donors by blood group/city and allow members to register as blood donors.
* **Entry point:** [`src/screens/Blood/BloodDonorsScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Blood/BloodDonorsScreen.js)
* **Main files:** [`src/screens/Blood/BloodDonorsScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Blood/BloodDonorsScreen.js), [`src/screens/Blood/RegisterDonorScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Blood/RegisterDonorScreen.js), [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js)
* **Related components:** `Card`, `Button`
* **API endpoints:** Supabase endpoint (`/rest/v1/blood_donors`)
* **Database/storage:** `blood_donors` table
* **External services:** Supabase Database
* **Important functions/classes:** `dbHelpers.getBloodDonors()`, `dbHelpers.registerBloodDonor()`
* **Dependencies:** `@supabase/supabase-js`
* **Potential side effects:** Inserts new donor entry linked to current user ID.

---

### 9. Feature: Community Donations & Executive Office Bearers
* **Purpose:** Display community donation history and list executive committee/office bearers.
* **Entry point:** [`src/screens/Donations/DonationsScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Donations/DonationsScreen.js) & [`src/screens/PostHolders/PostHoldersScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/PostHolders/PostHoldersScreen.js)
* **Main files:** [`src/screens/Donations/DonationsScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Donations/DonationsScreen.js), [`src/screens/PostHolders/PostHoldersScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/PostHolders/PostHoldersScreen.js), [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js)
* **Related components:** `Card`
* **API endpoints:** Supabase endpoints (`/rest/v1/donations`, `/rest/v1/post_holders`)
* **Database/storage:** `donations` table, `post_holders` table
* **External services:** Supabase Database
* **Important functions/classes:** `dbHelpers.getDonations()`, `dbHelpers.recordDonation()`, `dbHelpers.getPostHolders()`
* **Dependencies:** `@supabase/supabase-js`
* **Potential side effects:** None.

---

## Tech Stack
* **Frontend Framework:** React Native `0.81.5`, React `19.1.0`, Expo SDK `~54.0.25`
* **Navigation:** `@react-navigation/native-stack` (`^7.6.2`), `@react-navigation/stack` (`^7.6.2`), `@react-navigation/bottom-tabs` (`^7.7.3`)
* **Backend as a Service (BaaS):** Supabase (`@supabase/supabase-js` `^2.78.0`)
* **State Management:** React Context API & Custom Hooks ([`src/hooks/useAuth.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/hooks/useAuth.js))
* **Media Management:** Cloudinary (`cloudinary-react-native` `^1.3.0` & REST API)
* **Local Storage:** `@react-native-async-storage/async-storage` (`2.2.0`)
* **UI & Styling:** Standard React Native `StyleSheet`, `expo-linear-gradient`, `expo-blur`, `@expo/vector-icons` (Ionicons)
* **Auth & Deep Linking:** `expo-auth-session`, `expo-web-browser`, `expo-linking`
* **Build & Deployment:** Expo Application Services (EAS)

---

## Architecture
The application follows a serverless, client-heavy mobile architecture:
* **Client App:** React Native application managed by Expo.
* **BaaS (Supabase):** Serves as the primary backend provider handling database persistence (PostgreSQL), user authentication (OAuth & JWT), and session management.
* **Media Hosting (Cloudinary):** Used for uploading and hosting user profile pictures, document images, and event graphics.
* **Authentication & Navigation Gatekeeper:** `useAuth` hook maintains global auth state (`user`, `session`, `profile`, `isVerified`). `AppNavigator` reads this state to dynamically control screen stack rendering.

---

## Project Structure
```
jbp-agrawal-sabha/
├── .env                       # Local environment variables
├── App.js                     # Root React component with providers & navigation
├── index.js                   # Application entry point (registers root component)
├── app.config.js              # Dynamic Expo configuration
├── eas.json                   # EAS build profiles and production environment matrix
├── package.json               # Node.js project manifest & scripts
├── start-expo.js              # Custom CLI startup helper script
├── assets/                    # Image assets (logos, icons, splash screens)
└── src/
    ├── components/
    │   └── common/            # Shared UI components (Button.js, Card.js, TrainAnimation.js)
    ├── config/                # Service initialization & backend API adapters (supabase.js, cloudinary.js)
    ├── context/               # AuthContext.js (Legacy/Unused - see useAuth.js)
    ├── hooks/                 # Custom React hooks (useAuth.js - Primary Auth Hook)
    ├── navigation/            # AppNavigator.js (Stack & Tab navigation)
    ├── screens/               # Screen components grouped by feature area
    │   ├── Auth/              # LoginScreen.js, PhoneVerificationScreen.js
    │   ├── Blood/             # BloodDonorsScreen.js, RegisterDonorScreen.js
    │   ├── Donations/         # DonationsScreen.js
    │   ├── Events/            # EventsScreen.js, EventDetailScreen.js
    │   ├── Home/              # HomeScreen.js
    │   ├── Jobs/              # JobsScreen.js, PostJobScreen.js
    │   ├── Matrimonial/       # MatrimonialListScreen.js, MatrimonialDetailScreen.js, CreateMatrimonialScreen.js
    │   ├── PostHolders/       # PostHoldersScreen.js
    │   └── Profile/           # DirectoryScreen.js, ProfileScreen.js
    └── utils/                 # Application constants, colors, spacing (constants.js)
```

---

## Application Flow
1. **Startup & Session Check:** On launch ([`App.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/App.js)), `AuthProvider` ([`src/hooks/useAuth.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/hooks/useAuth.js)) checks `AsyncStorage` via Supabase client for existing valid auth session.
2. **Unauthenticated User:** If no active user session exists, `AppNavigator` renders `LoginScreen`.
3. **Google Sign-In:** User initiates Google OAuth sign-in, which launches a browser session. Upon authorization, Google redirects back to `com.jbpagrawal.sabha://auth/callback`.
4. **Token Handling:** `LoginScreen` extracts access/refresh tokens from the redirect URL and sets the Supabase session via `supabase.auth.setSession()`.
5. **Profile & Verification Check:**
   - If user exists but has no associated user profile or phone number in database, `AppNavigator` routes to `PhoneVerificationScreen`.
   - The phone number is verified against the `approved_members` table.
   - If found: Profile is created with `is_verified: true`.
   - If not found or on query error: Profile is created with `is_verified: false` (granting read-only access).
6. **Authenticated Navigation:** Once profile and phone exist, `AppNavigator` presents `MainTabs` (`HomeScreen`, `DirectoryScreen`, `MatrimonialListScreen`, `ProfileScreen`) alongside feature sub-stacks.

---

## Frontend
* **UI Framework:** Component-driven layout using React Native native primitives (`View`, `Text`, `TouchableOpacity`, `TextInput`, `ScrollView`).
* **Design System:** Design tokens defined centrally in [`src/utils/constants.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/utils/constants.js) (`COLORS`, `SPACING`, `RADIUS`, `FONT_SIZES`, `SHADOWS`, `PATTERNS`).
* **Visual Effects:** Dynamic gradients (`expo-linear-gradient`), custom animated train marquee ([`TrainAnimation.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/components/common/TrainAnimation.js) powered by React Native `Animated`), vector icons via `@expo/vector-icons/Ionicons`.

---

## Backend & API Architecture

### Architecture Overview
There is **no standalone custom server codebase** (such as Express, NestJS, Django, or Fastify) in this repository. All backend services, API routes, database operations, user authentication, and storage handlers operate via a **Serverless Backend-as-a-Service (BaaS)** architecture using **Supabase** and **Cloudinary**.

### Backend Entry Points & Service Modules
* **Supabase Service & Database Adapter:** [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js)
  * Initializes the `@supabase/supabase-js` client configured with `AsyncStorage` for session persistence.
  * Exports `authHelpers`, `dbHelpers` (all PostgreSQL queries/mutations), and `storageHelpers`.
* **Cloudinary Media Adapter:** [`src/config/cloudinary.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/cloudinary.js)
  * Direct REST integration for uploading multipart image payloads to Cloudinary endpoint `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`.
* **Auth Lifecycle & Session Service:** [`src/hooks/useAuth.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/hooks/useAuth.js)
  * Manages global auth state, handles `onAuthStateChange` events, performs profile synchronization, manages phone verification checks, and executes complete sign-out cleaning (scrubbing `AsyncStorage` keys).

### Database Service Operations (`dbHelpers` in [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js#L60-L437))

| Function Name | Target Table / Resource | Operation Description & Filters |
|---|---|---|
| `checkApprovedMember(phone)` | `approved_members` | Checks if phone is in member registry. Uses 2-attempt retry loop (20s & 40s timeouts), sanitizes digits (`\D`), ignores PostgREST `PGRST116` (no row), and falls back to `{ data: null, error: null }` on error to prevent blocking signup. |
| `upsertUserProfile(userId, profileData)` | `users` | Upserts profile payload on conflict `id`. Updates `phone`, `full_name`, `gender`, `guardian_type`, `guardian_name`, `city`, `address`, `pincode`, `occupation`, `is_verified`, `photo_url`, `email`, `google_id`, `updated_at`. |
| `getUserProfile(userId)` | `users` | Queries single profile matching `id`. |
| `getVerifiedUsers()` | `users` | Queries all users where `is_verified = true` ordered by `full_name ASC`. |
| `getMatrimonialProfiles(filters)` | `matrimonial_profiles` | Selects approved profiles with foreign key join `users!matrimonial_profiles_user_id_fkey(*)`. Supports filtering by `gender`, `city`, `gotra`. Ordered by `created_at DESC`. |
| `createMatrimonialProfile(profileData)` | `matrimonial_profiles` | Inserts new matrimonial listing. |
| `getEvents(type)` | `events` | Selects approved and visible events with join `users!events_posted_by_fkey(*)`. Supports filtering by `is_announcement = false` (events) or `is_announcement = true` (announcements). |
| `createEvent(eventData)` | `events` | Inserts new event or announcement. |
| `getJobs()` | `jobs` | Selects approved jobs with join `users!jobs_posted_by_fkey(*)`, ordered by `created_at DESC`. |
| `createJob(jobData)` | `jobs` | Inserts new job listing. |
| `getBloodDonors(bloodGroup, city)` | `blood_donors` | Selects available blood donors (`is_available = true`) with join `users!blood_donors_user_id_fkey(*)`, filtered by `blood_group` and `city`. |
| `registerBloodDonor(donorData)` | `blood_donors` | Inserts new donor registration. |
| `getDonations()` | `donations` | Queries all donations ordered by `donated_at DESC`. |
| `recordDonation(donationData)` | `donations` | Inserts donation record. |
| `getPostHolders()` | `post_holders` | Selects executive committee members with join `users!post_holders_user_id_fkey(*)`, ordered by `display_order ASC`. |
| `createContactRequest(profileId, requesterId)`| `contact_requests` | Inserts contact interest request for matrimonial profiles. |

---

## Database / Storage
### Database (PostgreSQL via Supabase)
Tables and foreign keys verified in code:
* `approved_members`: Pre-approved community directory used for phone verification (`phone`, `full_name`, `city`).
* `users`: Primary user profile table (`id` [PK], `phone`, `full_name`, `gender`, `guardian_type`, `guardian_name`, `city`, `address`, `pincode`, `occupation`, `is_verified`, `is_admin`, `photo_url`, `email`, `google_id`, `updated_at`).
* `matrimonial_profiles`: Matrimonial profiles (`status`, `gender`, `city`, `gotra`, `created_at`, `user_id` [FK: `matrimonial_profiles_user_id_fkey` $\rightarrow$ `users.id`]).
* `contact_requests`: Matrimonial profile contact requests (`profile_id`, `requester_id`).
* `events`: Announcements and events (`is_announcement`, `is_visible`, `is_featured`, `status`, `title`, `announcement_text`, `event_date`, `posted_by` [FK: `events_posted_by_fkey` $\rightarrow$ `users.id`]).
* `jobs`: Job listings (`status`, `posted_by` [FK: `jobs_posted_by_fkey` $\rightarrow$ `users.id`], `created_at`).
* `blood_donors`: Donor listings (`is_available`, `blood_group`, `city`, `user_id` [FK: `blood_donors_user_id_fkey` $\rightarrow$ `users.id`]).
* `donations`: Log of community contributions (`donated_at`).
* `post_holders`: Executive committee entries (`display_order`, `user_id` [FK: `post_holders_user_id_fkey` $\rightarrow$ `users.id`]).

### Storage
* **Local Device Storage:** `@react-native-async-storage/async-storage` for storing persistent authentication sessions.
* **Remote Media Storage:** Cloudinary (upload preset: `jbp-agrawal-uploads`, target folder: `jbp-agrawal/*`) for image hosting.
* **Supabase Storage Helpers:** [`storageHelpers`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js#L440-L473) (`uploadFile`, `getPublicUrl`, `deleteFile`) wrap Supabase storage bucket endpoints.

---

## APIs and External Services
* **Supabase PostgREST API:** `https://<project-ref>.supabase.co/rest/v1/...` for database queries/mutations.
* **Supabase Auth Service:** `https://<project-ref>.supabase.co/auth/v1/...` for authentication and OAuth session handling.
* **Google OAuth 2.0 API:** Google web client auth provider (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`).
* **Cloudinary Upload API:** Endpoint `https://api.cloudinary.com/v1_1/<cloud_name>/image/upload` receiving `FormData` for client-side image uploads.
* **Expo Notifications API:** Integrated via `expo-notifications` for push notifications.

---

## Authentication & Authorization
* **Authentication Flow:**
  1. Google Sign-In initiated in [`LoginScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Auth/LoginScreen.js#L57-L160) using `supabase.auth.signInWithOAuth()`.
  2. OAuth redirect handled via `WebBrowser.openAuthSessionAsync()` targeting `com.jbpagrawal.sabha://auth/callback`.
  3. Session set via `supabase.auth.setSession({ access_token, refresh_token })` and persisted to `AsyncStorage`.
* **Authorization & Verification Tiering:**
  * **Unauthenticated:** Redirected to `LoginScreen`.
  * **Unverified Profile (`is_verified: false`):** Read-only access across Directory, Matrimonial, Events, Jobs, Blood Donors, and Office Bearers screens.
  * **Verified Profile (`is_verified: true`):** Full privileges to create matrimonial profiles ([`CreateMatrimonialScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Matrimonial/CreateMatrimonialScreen.js)), post jobs ([`PostJobScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Jobs/PostJobScreen.js)), post events ([`EventsScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Events/EventsScreen.js)), register as a blood donor ([`RegisterDonorScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Blood/RegisterDonorScreen.js)), and request contact details.
  * **Admin (`is_admin: true`):** Privileged administrative permissions.

---

## Error Handling & Resiliency Strategies
1. **Phone Lookup Retry Loop:** `checkApprovedMember` in [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js#L62-L154) runs up to 2 attempts with escalating timeouts (20s on attempt 1, 40s on attempt 2 using `Promise.race`).
2. **PostgREST Error Code Handling:** `PGRST116` (no row found) is caught and handled gracefully as a non-error state (`{ data: null, error: null }`).
3. **Async Request Race Mitigation:** [`PhoneVerificationScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Auth/PhoneVerificationScreen.js#L54-L125) uses a `requestIdRef` counter to discard stale verification responses if user parameters change mid-flight.
4. **Graceful Onboarding Fallback:** Network exceptions during phone lookup return `{ data: null, error: null }`, allowing the user to create an unverified profile rather than blocking registration.
5. **Storage Scrubbing on Sign-Out:** `signOut` in [`src/hooks/useAuth.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/hooks/useAuth.js#L90-L139) inspects all `AsyncStorage` keys and explicitly removes all keys matching `supabase.auth.token`, `supabase-auth-token`, or `@supabase`.

---

## Configuration / Environment Variables
The application relies on environment variables loaded in `app.config.js` and `eas.json`:

| Variable Name | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anonymous API key |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth Web Client ID |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset name |
| `EAS_PROJECT_ID` | Expo Application Services project ID |
| `EXPO_REDIRECT_URL` | OAuth redirect URL for deep linking |

---

## Important File Paths & Direct References

### Backend Adapters & Auth Lifecycle
* [`src/config/supabase.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/supabase.js): Main Supabase client instance, `authHelpers`, database helper functions (`dbHelpers`), and storage helper functions (`storageHelpers`).
* [`src/config/cloudinary.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/config/cloudinary.js): Cloudinary upload adapter (`uploadImageToCloudinary`).
* [`src/hooks/useAuth.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/hooks/useAuth.js): Auth state management, profile loader, and sign-out logic.
* [`src/navigation/AppNavigator.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/navigation/AppNavigator.js): Route guard enforcing authentication & verification screens.

### Core Entry & Configuration Files
* [`App.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/App.js): React entry point wrapping auth and navigation providers.
* [`app.config.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/app.config.js): Expo dynamic configuration, Android intent filters, and environment bindings.
* [`eas.json`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/eas.json): EAS build matrix and environment profile configs.

### Feature Screens Interacting with Backend
* [`src/screens/Auth/LoginScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Auth/LoginScreen.js): Google OAuth sign-in flow.
* [`src/screens/Auth/PhoneVerificationScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Auth/PhoneVerificationScreen.js): Member registry phone check and initial profile creation.
* [`src/screens/Home/HomeScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Home/HomeScreen.js): Fetches announcements, featured upcoming events, and community stats.
* [`src/screens/Profile/DirectoryScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Profile/DirectoryScreen.js): Fetches verified community members.
* [`src/screens/Profile/ProfileScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Profile/ProfileScreen.js): Profile editing and Cloudinary avatar upload.
* [`src/screens/Matrimonial/MatrimonialListScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Matrimonial/MatrimonialListScreen.js): Filtered matrimonial listing queries.
* [`src/screens/Matrimonial/CreateMatrimonialScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Matrimonial/CreateMatrimonialScreen.js): Cloudinary multi-photo upload & matrimonial profile insertion.
* [`src/screens/Events/EventsScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Events/EventsScreen.js): Event and announcement querying.
* [`src/screens/Jobs/JobsScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Jobs/JobsScreen.js) & [`src/screens/Jobs/PostJobScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Jobs/PostJobScreen.js): Job board queries and creation.
* [`src/screens/Blood/BloodDonorsScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Blood/BloodDonorsScreen.js) & [`src/screens/Blood/RegisterDonorScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Blood/RegisterDonorScreen.js): Donor queries and registration.
* [`src/screens/Donations/DonationsScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/Donations/DonationsScreen.js): Donation queries and logging.
* [`src/screens/PostHolders/PostHoldersScreen.js`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/src/screens/PostHolders/PostHoldersScreen.js): Executive committee member listing.

---

## Key Workflows

### 1. Google OAuth Sign-In Workflow
User clicks "Sign in with Google" on `LoginScreen` 
→ Frontend triggers `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })` 
→ API returns OAuth authorization URL 
→ Frontend opens browser using `WebBrowser.openAuthSessionAsync` 
→ Google authenticates user and redirects back to `com.jbpagrawal.sabha://auth/callback` with access and refresh tokens 
→ `LoginScreen` extracts tokens from redirect URL fragment 
→ Frontend calls `supabase.auth.setSession({ access_token, refresh_token })` 
→ Supabase verifies tokens and updates session state 
→ `useAuth` hook updates `user` state and triggers profile lookup.

### 2. Phone Verification & Profile Creation Workflow
User submits 10-digit phone number on `PhoneVerificationScreen` 
→ Frontend calls `checkPhoneVerification(phone)` 
→ API executes `dbHelpers.checkApprovedMember(phone)` querying `approved_members` table via Supabase client 
→ Supabase Database searches for phone match 
→ If match found: Database returns member details (`verified: true`); if not found/error: returns `verified: false` 
→ User fills in additional profile fields (name, city, address, occupation) and submits 
→ Frontend invokes `createUserProfile(profilePayload)` calling `dbHelpers.upsertUserProfile()` 
→ Supabase Database inserts/updates record in `users` table 
→ `useAuth` hook sets `profile` state 
→ `AppNavigator` evaluates updated `profile` state and automatically transitions user to `MainTabs`.

### 3. Media Upload Workflow
User selects image using `expo-image-picker` 
→ Frontend passes local file URI to `uploadImageToCloudinary(imageUri, folder)` 
→ Helper formats payload into `FormData` with target upload preset 
→ API issues HTTP POST to `https://api.cloudinary.com/v1_1/<cloud_name>/image/upload` 
→ Cloudinary stores media file and generates HTTPS URL 
→ External service returns JSON containing `secure_url` 
→ Frontend includes `secure_url` in profile/event/matrimonial record creation call to Supabase.

### 4. Fetching Data (e.g. Matrimonial Profiles / Events / Jobs)
User opens feature screen (e.g., `MatrimonialListScreen`) 
→ Screen invokes corresponding `dbHelpers` function (e.g., `dbHelpers.getMatrimonialProfiles(filters)`) 
→ Frontend issues PostgREST query to Supabase 
→ Supabase Database executes query joining child table with `users` profile table 
→ Database returns array of JSON records 
→ Screen state updates and re-renders UI card list.

---

## Current Features
* **Google Single Sign-On:** Authentication via Google OAuth.
* **Member Registry Verification:** Phone-based lookup against approved member database.
* **Graceful Unverified Access:** Read-only access mode for unverified users.
* **Animated Announcement Marquee:** Train-themed moving announcement banner on Home screen.
* **Community Member Directory:** Searchable and filterable directory of verified community members.
* **Matrimonial Module:** Matrimonial profiles listing, detail view, creation screen, gotra/city filters, and contact requests.
* **Events & News:** Community event listings, detail screen, and announcement ticker.
* **Job Board:** Career opportunities board and job posting portal.
* **Blood Donors Network:** Registered blood donor directory with blood group and city filters.
* **Executive Committee:** Directory of office bearers and leadership.
* **Donations:** Record and view community donations.

---

## Known Issues / Limitations
1. **Duplicate Auth Context File:** Both `src/context/AuthContext.js` and `src/hooks/useAuth.js` exist in the codebase. `App.js` currently uses `src/hooks/useAuth.js`, making `src/context/AuthContext.js` redundant/unused.
2. **Cloudinary Deletion Unimplemented:** `deleteImageFromCloudinary` in `src/config/cloudinary.js` is a stub function returning dummy success without deleting the asset on Cloudinary.
3. **No Database Migration Files in Repository:** SQL schema definitions and migrations are managed directly on the Supabase dashboard and do not exist as version-controlled `.sql` files in this repository.
4. **Hardcoded EAS Project ID Fallback:** `app.config.js` falls back to a hardcoded `eas.projectId` string (`b330fdd8-8085-46a6-8b0d-8b6f5d2ba65e`) if the `EAS_PROJECT_ID` environment variable is omitted.

---

## Important Design Decisions
* **Non-Blocking User Onboarding:** Failing phone verification or encountering network timeouts during signup does not lock the user out. Instead, the system assigns `is_verified: false` to allow read-only access while awaiting manual admin verification.
* **Dynamic Expo Configuration:** Using `app.config.js` instead of a static `app.json` enables runtime injection of process environment variables into `expo.extra`.
* **Centralized Database Helper Pattern:** All Supabase table interactions are consolidated into `dbHelpers` object within `src/config/supabase.js` rather than being scattered raw across individual UI screens.

---

## Development / Run Instructions

### Prerequisites
* Node.js (v18+)
* Yarn package manager (`yarn@1.22.22`)
* Expo CLI (`npx expo`)
* Android Studio / Android Emulator or iOS Simulator / Expo Go app

### Step-by-Step Setup
1. **Install Dependencies:**
   ```bash
   yarn install
   ```
2. **Environment Setup:**
   Ensure `.env` file exists in project root with required keys:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://<your-supabase-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<your-google-client-id>
   EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
   EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<your-upload-preset>
   ```
3. **Start Development Server:**
   ```bash
   yarn start
   # or using the custom runner script:
   node start-expo.js
   ```
4. **Run on Platforms:**
   * Android: `yarn android`
   * iOS: `yarn ios`
   * Web: `yarn web`

---

## Deployment

Deployment and builds are configured through Expo Application Services (EAS):

### EAS Build Command Examples
* **Build Development Android APK:**
  ```bash
  eas build --profile development --platform android
  ```
* **Build Production Android App Bundle (AAB):**
  ```bash
  eas build --profile production --platform android
  ```

Build environment variables are defined under the `production.env` block in [`eas.json`](file:///c:/Users/vedag/Desktop/final_app/jbp-agrawal-sabha/eas.json).

---

## AI / Developer Notes
* **Auth Hook Usage:** Always import `useAuth` from `src/hooks/useAuth.js`. Do not import from `src/context/AuthContext.js`.
* **Environment Variable Mapping:** When adding new environment variables, remember to expose them in three places: `.env`, `app.config.js` (`extra` block), and `eas.json` (`production.env` block).
* **Deep Linking Scheme:** Android deep links respond to `com.jbpagrawal.sabha://auth/callback` as defined in `app.config.js` intent filters.
