// app.config.js
module.exports = {
  expo: {
    name: "JBP Agrawal Sabha",
    slug: "jbp-agrawal-sabha",
    owner: "jabalpuragrawalsabha2019",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#00000000"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jbpagrawal.sabha"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#00000000"
      },
      package: "com.jbpagrawal.sabha",
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "NOTIFICATIONS"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      cloudinaryCloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      eas: {
        projectId: process.env.EAS_PROJECT_ID || "b330fdd8-8085-46a6-8b0d-8b6f5d2ba65e"
      }
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#F97316"
        }
      ]
    ],
    scheme: "com.jbpagrawal.sabha"
  }
};