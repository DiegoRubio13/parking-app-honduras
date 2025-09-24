const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable Hermes temporarily to avoid the "Cannot convert undefined value to object" error
config.transformer = {
  ...config.transformer,
  hermesParser: false,
};

module.exports = config;