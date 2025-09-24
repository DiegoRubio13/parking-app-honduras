import 'dotenv/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_STAGING = process.env.APP_VARIANT === 'staging';
const IS_PRODUCTION = process.env.APP_VARIANT === 'production';

const getAppIdentifier = () => {
  if (IS_DEV) {
    return 'com.parking.app.dev';
  }
  if (IS_STAGING) {
    return 'com.parking.app.staging';
  }
  return 'com.parking.app';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'ParKing Dev';
  }
  if (IS_STAGING) {
    return 'ParKing Staging';
  }
  return 'ParKing';
};

const getAppSlug = () => {
  if (IS_DEV) {
    return 'parking-app-dev';
  }
  if (IS_STAGING) {
    return 'parking-app-staging';
  }
  return 'parking-app';
};

const getIconPath = () => {
  if (IS_DEV) {
    return './assets/icon-dev.png';
  }
  if (IS_STAGING) {
    return './assets/icon-staging.png';
  }
  return './assets/icon.png';
};

export default {
  expo: {
    name: getAppName(),
    slug: getAppSlug(),
    version: process.env.APP_VERSION || '1.0.0',
    orientation: 'portrait',
    icon: getIconPath(),
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    sdkVersion: '53.0.0',
    scheme: getAppSlug(),

    // App Store optimization
    description:
      'ParKing - Smart parking solution for Honduras. Find, reserve and pay for parking spots easily.',
    keywords: [
      'parking',
      'honduras',
      'tegucigalpa',
      'san pedro sula',
      'smart parking',
      'estacionamiento'
    ],
    primaryColor: '#1d4ed8',

    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#1d4ed8'
    },

    assetBundlePatterns: ['**/*'],

    ios: {
      supportsTablet: false,
      bundleIdentifier: getAppIdentifier(),
      jsEngine: 'jsc',
      buildNumber: process.env.IOS_BUILD_NUMBER || '1',

      // App Store Connect Configuration
      config: {
        usesNonExemptEncryption: false
      },

      // App Store metadata
      appStoreUrl: 'https://apps.apple.com/app/parking-app/id123456789',

      infoPlist: {
        NSCameraUsageDescription:
          'ParKing needs camera access to scan QR codes for parking entry and exit.',
        NSLocationWhenInUseUsageDescription:
          'ParKing needs location access to find nearby parking spots and improve your parking experience.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'ParKing needs location access to find nearby parking spots and improve your parking experience.',
        NSUserTrackingUsageDescription:
          'ParKing uses tracking to provide personalized parking recommendations and improve app performance.',
        NSPhotoLibraryUsageDescription:
          'ParKing needs photo library access to save parking receipts and photos.',
        NSMicrophoneUsageDescription:
          'ParKing needs microphone access for voice commands and customer support.',

        // Privacy manifests for iOS 17+
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType:
              'NSPrivacyAccessedAPICategoryUserDefaults',
            NSPrivacyAccessedAPITypeReasons: ['CA92.1']
          },
          {
            NSPrivacyAccessedAPIType:
              'NSPrivacyAccessedAPICategoryFileTimestamp',
            NSPrivacyAccessedAPITypeReasons: ['C617.1']
          }
        ],

        // App Transport Security
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            'parking-api.com': {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSExceptionMinimumTLSVersion: '1.2'
            }
          }
        },

        // Supported interface orientations
        UISupportedInterfaceOrientations: ['UIInterfaceOrientationPortrait'],

        // Background modes
        UIBackgroundModes: ['location', 'background-processing'],

        // Required device capabilities
        UIRequiredDeviceCapabilities: ['armv7', 'location-services']
      },

      // App Store review information
      reviewInformation: {
        firstName: 'Diego',
        lastName: 'Developer',
        email: 'review@parking-app.com',
        phone: '+504-0000-0000',
        notes:
          'Test account: email: test@parking-app.com, password: TestPass123!'
      }
    },

    android: {
      package: getAppIdentifier(),
      versionCode: parseInt(process.env.ANDROID_VERSION_CODE || '1'),
      jsEngine: 'jsc',

      // Google Play Store metadata
      playStoreUrl:
        'https://play.google.com/store/apps/details?id=com.parking.app',

      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1d4ed8'
      },

      permissions: [
        'android.permission.CAMERA',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.WAKE_LOCK',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.VIBRATE',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE'
      ],

      // Google Play Store optimization
      // googleServicesFile:
      //   process.env.GOOGLE_SERVICES_JSON || './google-services.json',

      // Proguard configuration for release builds
      proguardFiles: ['proguard-rules.pro']
    },

    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      name: getAppName(),
      shortName: 'ParKing',
      description: 'Smart parking solution for Honduras',
      startUrl: '/',
      display: 'standalone',
      orientation: 'portrait',
      themeColor: '#1d4ed8',
      backgroundColor: '#ffffff'
    },

    plugins: [
      [
        'expo-camera',
        {
          cameraPermission:
            'Allow ParKing to access your camera to scan QR codes for parking.'
        }
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow ParKing to use your location to find nearby parking spots and improve your experience.',
          locationAlwaysPermission:
            'Allow ParKing to use your location to find nearby parking spots and improve your experience.',
          locationWhenInUsePermission:
            'Allow ParKing to use your location to find nearby parking spots and improve your experience.',
          isIosBackgroundLocationEnabled: true,
          isAndroidBackgroundLocationEnabled: true
        }
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#1d4ed8',
          sounds: ['./assets/sounds/notification.wav'],
          mode: IS_PRODUCTION ? 'production' : 'development'
        }
      ],
      // Temporarily commented - Firebase plugins need to be installed
      // [
      //   '@react-native-firebase/app',
      //   {
      //     android: {
      //       googleServicesFile:
      //         process.env.GOOGLE_SERVICES_JSON || './google-services.json'
      //     },
      //     ios: {
      //       googleServicesPlist:
      //         process.env.GOOGLE_SERVICE_INFO_PLIST
      //         || './GoogleService-Info.plist'
      //     }
      //   }
      // ],
      // [
      //   '@react-native-firebase/crashlytics',
      //   {
      //     debug: !IS_PRODUCTION,
      //     enabledInDevelopment: false
      //   }
      // ],
      [
        'expo-tracking-transparency',
        {
          userTrackingPermission:
            'ParKing uses tracking to provide personalized parking recommendations and improve app performance.'
        }
      ]
    ],

    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID || 'parking-app-expo'
      },

      // Environment variables
      env: process.env.APP_VARIANT || 'development',
      appVersion: process.env.APP_VERSION || '1.0.0',
      apiUrl: process.env.API_URL || 'http://localhost:3000',
      apiKey: process.env.API_KEY,
      apiTimeout: process.env.API_TIMEOUT,
      maxRetryAttempts: process.env.MAX_RETRY_ATTEMPTS,

      // Firebase Configuration
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
      },

      // Stripe Configuration
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      stripeMerchantId: process.env.STRIPE_MERCHANT_ID,
      paymentTimeout: process.env.PAYMENT_TIMEOUT,

      // Maps Configuration
      mapsApiKey: process.env.MAPS_API_KEY,
      defaultLocationLat: process.env.DEFAULT_LOCATION_LAT,
      defaultLocationLng: process.env.DEFAULT_LOCATION_LNG,
      locationUpdateInterval: process.env.LOCATION_UPDATE_INTERVAL,

      // Push Notifications
      pushNotificationSenderId: process.env.PUSH_NOTIFICATION_SENDER_ID,
      oneSignalAppId: process.env.ONESIGNAL_APP_ID,

      // Deep Linking
      deepLinkScheme: process.env.DEEP_LINK_SCHEME,
      universalLinkDomain: process.env.UNIVERSAL_LINK_DOMAIN,

      // Analytics
      analyticsTrackingId: process.env.ANALYTICS_TRACKING_ID,
      mixpanelToken: process.env.MIXPANEL_TOKEN,

      // Social Authentication
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      facebookAppId: process.env.FACEBOOK_APP_ID,
      appleServiceId: process.env.APPLE_SERVICE_ID,

      // Feature flags
      enableDebugMenu: process.env.ENABLE_DEBUG_MENU,
      enableTestingTools: process.env.ENABLE_TESTING_TOOLS,
      enableAnalytics: process.env.ENABLE_ANALYTICS,
      enableCrashlytics: process.env.ENABLE_CRASHLYTICS,
      enablePerformanceMonitoring: process.env.ENABLE_PERFORMANCE_MONITORING,
      enableRemoteConfig: process.env.ENABLE_REMOTE_CONFIG,
      enablePushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS,
      enableDeepLinking: process.env.ENABLE_DEEP_LINKING,

      // Logging Configuration
      logLevel: process.env.LOG_LEVEL,
      enableConsoleLogs: process.env.ENABLE_CONSOLE_LOGS,
      enableFileLogs: process.env.ENABLE_FILE_LOGS,
      enableRemoteLogging: process.env.ENABLE_REMOTE_LOGGING,

      // Security Configuration
      enableSSLPinning: process.env.ENABLE_SSL_PINNING,

      // Cache Configuration
      cacheTimeout: process.env.CACHE_TIMEOUT,
      enableOfflineMode: process.env.ENABLE_OFFLINE_MODE,
      maxCacheSize: process.env.MAX_CACHE_SIZE,

      // Development Tools
      enableFlipper: process.env.ENABLE_FLIPPER,
      enableReactotron: process.env.ENABLE_REACTOTRON,
      enableDevServer: process.env.ENABLE_DEV_SERVER,
      devServerPort: process.env.DEV_SERVER_PORT,

      // Legacy feature flags for backward compatibility
      features: {
        analytics: IS_PRODUCTION,
        crashlytics: IS_PRODUCTION,
        debugging: !IS_PRODUCTION
      }
    },

    // Expo Updates configuration
    updates: {
      url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID || 'parking-app-expo'}`,
      enabled: true,
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 10000
    },

    // Runtime version for updates
    runtimeVersion: {
      policy: 'sdkVersion'
    },

    // Submission configuration
    submit: {
      ios: {
        appleId: process.env.APPLE_ID,
        ascAppId: process.env.ASC_APP_ID,
        appleTeamId: process.env.APPLE_TEAM_ID
      },
      android: {
        serviceAccountKeyPath: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
        track: IS_PRODUCTION ? 'production' : 'internal'
      }
    }
  }
};
