/**
 * Global Configuration
 * Centralized configuration management for the frontend application
 */

// Environment-based configuration
const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    isDevelopment,
    isProduction,
    isTest: process.env.NODE_ENV === 'test'
  };
};

// API Configuration
const getAPIConfig = () => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 
                 (getEnvironmentConfig().isDevelopment ? 'http://localhost:5000' : 'https://api.example.com');
  
  return {
    baseURL,
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
    retryAttempts: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '1000')
  };
};

// Feature Flags
const getFeatureFlags = () => {
  return {
    enableSocket: process.env.NEXT_PUBLIC_ENABLE_SOCKET !== 'false',
    enableSearchSuggestions: process.env.NEXT_PUBLIC_ENABLE_SEARCH_SUGGESTIONS !== 'false',
    enableTrending: process.env.NEXT_PUBLIC_ENABLE_TRENDING !== 'false',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableDebugMode: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true'
  };
};

// UI Configuration
const getUIConfig = () => {
  return {
    theme: {
      primaryColor: process.env.NEXT_PUBLIC_THEME_PRIMARY_COLOR || '#2563eb',
      secondaryColor: process.env.NEXT_PUBLIC_THEME_SECONDARY_COLOR || '#1d4ed8',
      fontFamily: process.env.NEXT_PUBLIC_THEME_FONT_FAMILY || 'system-ui, -apple-system, Segoe UI, Roboto, Arial'
    },
    pagination: {
      defaultLimit: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_LIMIT || '20'),
      maxLimit: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_LIMIT || '100')
    },
    search: {
      debounceDelay: parseInt(process.env.NEXT_PUBLIC_SEARCH_DEBOUNCE_DELAY || '300'),
      minQueryLength: parseInt(process.env.NEXT_PUBLIC_SEARCH_MIN_QUERY_LENGTH || '2'),
      maxSuggestions: parseInt(process.env.NEXT_PUBLIC_SEARCH_MAX_SUGGESTIONS || '8')
    }
  };
};

// Logging Configuration
const getLoggingConfig = () => {
  const env = getEnvironmentConfig();
  
  return {
    level: process.env.NEXT_PUBLIC_LOG_LEVEL || (env.isDevelopment ? 'debug' : 'info'),
    enableConsole: process.env.NEXT_PUBLIC_LOG_CONSOLE !== 'false',
    enableRemote: process.env.NEXT_PUBLIC_LOG_REMOTE === 'true',
    remoteEndpoint: process.env.NEXT_PUBLIC_LOG_REMOTE_ENDPOINT
  };
};

// Security Configuration
const getSecurityConfig = () => {
  return {
    enableCSP: process.env.NEXT_PUBLIC_ENABLE_CSP !== 'false',
    enableHSTS: process.env.NEXT_PUBLIC_ENABLE_HSTS !== 'false',
    allowedOrigins: process.env.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',') || ['*']
  };
};

// Create configuration object
const appConfig = {
  environment: getEnvironmentConfig(),
  api: getAPIConfig(),
  features: getFeatureFlags(),
  ui: getUIConfig(),
  logging: getLoggingConfig(),
  security: getSecurityConfig(),
  
  // Utility methods
  isDevelopment: () => getEnvironmentConfig().isDevelopment,
  isProduction: () => getEnvironmentConfig().isProduction,
  
  // Validation
  validate: () => {
    const errors = [];
    
    if (!appConfig.api.baseURL) {
      errors.push('API baseURL is required');
    }
    
    if (appConfig.api.timeout < 1000 || appConfig.api.timeout > 60000) {
      errors.push('API timeout must be between 1000ms and 60000ms');
    }
    
    if (appConfig.ui.pagination.defaultLimit < 1 || appConfig.ui.pagination.defaultLimit > appConfig.ui.pagination.maxLimit) {
      errors.push('Default page limit must be between 1 and max limit');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Validate configuration on load
const validation = appConfig.validate();
if (!validation.isValid) {
  console.error('Configuration validation failed:', validation.errors);
  if (appConfig.isDevelopment()) {
    console.warn('Continuing with invalid configuration in development mode');
  } else {
    throw new Error('Invalid configuration in production');
  }
}

module.exports = appConfig;
