// i18n Translations for ParKing App
// Supports Spanish (es) and English (en)

export type Language = 'es' | 'en';

export interface Translations {
  // Common
  common: {
    continue: string;
    cancel: string;
    back: string;
    save: string;
    delete: string;
    edit: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    yes: string;
    no: string;
  };

  // Auth
  auth: {
    // Login
    welcomeBack: string;
    phoneNumber: string;
    phoneNumberPlaceholder: string;
    sendCode: string;
    verificationCode: string;
    verificationCodePlaceholder: string;
    verify: string;
    changeNumber: string;
    noAccount: string;
    register: string;
    specialAccess: string;

    // Register
    registration: string;
    createNewAccount: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    alreadyHaveAccount: string;
    login: string;

    // SMS Verification
    smsVerification: string;
    codeSentTo: string;
    resendCode: string;
    resendIn: string;

    // Validation Messages
    phoneRequired: string;
    phoneInvalid: string;
    codeRequired: string;
    codeInvalid: string;
    nameRequired: string;
    nameMinLength: string;
    emailRequired: string;
    emailInvalid: string;

    // Success/Error Messages
    codeSentSuccess: string;
    codeSentError: string;
    verificationSuccess: string;
    verificationError: string;
    registrationSuccess: string;
    registrationError: string;

    // Mock Development
    devModeCode: string;
  };

  // Navigation
  nav: {
    home: string;
    history: string;
    profile: string;
    settings: string;
    parking: string;
    guard: string;
    admin: string;
  };

  // Parking
  parking: {
    findParking: string;
    myParking: string;
    parkingHistory: string;
    scanQR: string;
    enterManually: string;
    vehiclePlate: string;
    parkingSpot: string;
    duration: string;
    cost: string;
    total: string;
    pay: string;
    checkIn: string;
    checkOut: string;
  };

  // Profile
  profile: {
    myProfile: string;
    personalInfo: string;
    balance: string;
    addFunds: string;
    paymentHistory: string;
    settings: string;
    language: string;
    notifications: string;
    theme: string;
    logout: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    common: {
      continue: 'Continuar',
      cancel: 'Cancelar',
      back: 'Volver',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      confirm: 'Confirmar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      yes: 'Sí',
      no: 'No',
    },

    auth: {
      // Login
      welcomeBack: 'Bienvenido de vuelta',
      phoneNumber: 'Número de teléfono',
      phoneNumberPlaceholder: 'Número de teléfono',
      sendCode: 'ENVIAR CÓDIGO',
      verificationCode: 'Código de verificación',
      verificationCodePlaceholder: '______',
      verify: 'VERIFICAR',
      changeNumber: 'Cambiar número',
      noAccount: '¿No tienes cuenta?',
      register: 'Registrarse',
      specialAccess: 'Acceso especial',

      // Register
      registration: 'Registro',
      createNewAccount: 'Crear cuenta nueva',
      fullName: 'Nombre completo',
      fullNamePlaceholder: 'Ingresa tu nombre completo',
      email: 'Correo electrónico',
      emailPlaceholder: 'ejemplo@correo.com',
      alreadyHaveAccount: '¿Ya tienes cuenta?',
      login: 'Iniciar sesión',

      // SMS Verification
      smsVerification: 'Verificación SMS',
      codeSentTo: 'Enviado a',
      resendCode: 'Reenviar código',
      resendIn: 'Reenviar en',

      // Validation Messages
      phoneRequired: 'Por favor ingresa tu número de teléfono',
      phoneInvalid: 'Por favor ingresa un número válido de 8 dígitos',
      codeRequired: 'Por favor ingresa el código de verificación',
      codeInvalid: 'El código debe tener 6 dígitos',
      nameRequired: 'El nombre es requerido',
      nameMinLength: 'El nombre debe tener al menos 2 caracteres',
      emailRequired: 'El correo electrónico es requerido',
      emailInvalid: 'Ingresa un correo electrónico válido',

      // Success/Error Messages
      codeSentSuccess: 'Revisa tu teléfono para el código de verificación',
      codeSentError: 'No se pudo enviar el código',
      verificationSuccess: 'Autenticación exitosa',
      verificationError: 'Código de verificación inválido',
      registrationSuccess: 'Tu cuenta ha sido creada. Te enviaremos un código de verificación por SMS.',
      registrationError: 'No se pudo crear la cuenta. Inténtalo de nuevo.',

      // Mock Development
      devModeCode: 'Código de desarrollo: 123456',
    },

    nav: {
      home: 'Inicio',
      history: 'Historial',
      profile: 'Perfil',
      settings: 'Ajustes',
      parking: 'Estacionamiento',
      guard: 'Guardia',
      admin: 'Admin',
    },

    parking: {
      findParking: 'Buscar estacionamiento',
      myParking: 'Mi estacionamiento',
      parkingHistory: 'Historial de estacionamiento',
      scanQR: 'Escanear QR',
      enterManually: 'Ingresar manualmente',
      vehiclePlate: 'Placa del vehículo',
      parkingSpot: 'Lugar de estacionamiento',
      duration: 'Duración',
      cost: 'Costo',
      total: 'Total',
      pay: 'Pagar',
      checkIn: 'Registrar entrada',
      checkOut: 'Registrar salida',
    },

    profile: {
      myProfile: 'Mi perfil',
      personalInfo: 'Información personal',
      balance: 'Saldo',
      addFunds: 'Agregar fondos',
      paymentHistory: 'Historial de pagos',
      settings: 'Configuración',
      language: 'Idioma',
      notifications: 'Notificaciones',
      theme: 'Tema',
      logout: 'Cerrar sesión',
    },
  },

  en: {
    common: {
      continue: 'Continue',
      cancel: 'Cancel',
      back: 'Back',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      yes: 'Yes',
      no: 'No',
    },

    auth: {
      // Login
      welcomeBack: 'Welcome back',
      phoneNumber: 'Phone number',
      phoneNumberPlaceholder: 'Phone number',
      sendCode: 'SEND CODE',
      verificationCode: 'Verification code',
      verificationCodePlaceholder: '______',
      verify: 'VERIFY',
      changeNumber: 'Change number',
      noAccount: "Don't have an account?",
      register: 'Register',
      specialAccess: 'Special access',

      // Register
      registration: 'Registration',
      createNewAccount: 'Create new account',
      fullName: 'Full name',
      fullNamePlaceholder: 'Enter your full name',
      email: 'Email',
      emailPlaceholder: 'example@email.com',
      alreadyHaveAccount: 'Already have an account?',
      login: 'Sign in',

      // SMS Verification
      smsVerification: 'SMS Verification',
      codeSentTo: 'Sent to',
      resendCode: 'Resend code',
      resendIn: 'Resend in',

      // Validation Messages
      phoneRequired: 'Please enter your phone number',
      phoneInvalid: 'Please enter a valid 8-digit number',
      codeRequired: 'Please enter the verification code',
      codeInvalid: 'The code must be 6 digits',
      nameRequired: 'Name is required',
      nameMinLength: 'Name must be at least 2 characters',
      emailRequired: 'Email is required',
      emailInvalid: 'Enter a valid email address',

      // Success/Error Messages
      codeSentSuccess: 'Check your phone for the verification code',
      codeSentError: 'Could not send the code',
      verificationSuccess: 'Authentication successful',
      verificationError: 'Invalid verification code',
      registrationSuccess: 'Your account has been created. We will send you a verification code via SMS.',
      registrationError: 'Could not create account. Please try again.',

      // Mock Development
      devModeCode: 'Development code: 123456',
    },

    nav: {
      home: 'Home',
      history: 'History',
      profile: 'Profile',
      settings: 'Settings',
      parking: 'Parking',
      guard: 'Guard',
      admin: 'Admin',
    },

    parking: {
      findParking: 'Find parking',
      myParking: 'My parking',
      parkingHistory: 'Parking history',
      scanQR: 'Scan QR',
      enterManually: 'Enter manually',
      vehiclePlate: 'Vehicle plate',
      parkingSpot: 'Parking spot',
      duration: 'Duration',
      cost: 'Cost',
      total: 'Total',
      pay: 'Pay',
      checkIn: 'Check in',
      checkOut: 'Check out',
    },

    profile: {
      myProfile: 'My profile',
      personalInfo: 'Personal information',
      balance: 'Balance',
      addFunds: 'Add funds',
      paymentHistory: 'Payment history',
      settings: 'Settings',
      language: 'Language',
      notifications: 'Notifications',
      theme: 'Theme',
      logout: 'Sign out',
    },
  },
};

// Helper function to get translations
export const getTranslations = (language: Language): Translations => {
  return translations[language] || translations.es;
};