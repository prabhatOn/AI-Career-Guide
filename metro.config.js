const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable new architecture and TurboModules
config.resolver.platforms = ['ios', 'android', 'web', 'native'];

// Configure transformer for better compatibility
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  hermesParser: true,
};

// Resolver configuration for TurboModules
config.resolver = {
  ...config.resolver,
  resolverMainFields: ['react-native', 'browser', 'main'],
  platforms: ['ios', 'android', 'web', 'native'],
};

module.exports = config;