// expo-plugins.js
const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const withNewArchitecture = (config) => {
  return withDangerousMod(config, [
    'android',
    (config) => {
      // Enable new architecture for Android
      const gradlePropertiesPath = path.join(
        config.modRequest.platformProjectRoot,
        'gradle.properties'
      );
      
      let gradleProperties = '';
      if (fs.existsSync(gradlePropertiesPath)) {
        gradleProperties = fs.readFileSync(gradlePropertiesPath, 'utf8');
      }
      
      // Add new architecture flags
      if (!gradleProperties.includes('newArchEnabled=true')) {
        gradleProperties += '\nnewArchEnabled=true';
      }
      if (!gradleProperties.includes('hermesEnabled=true')) {
        gradleProperties += '\nhermesEnabled=true';
      }
      
      fs.writeFileSync(gradlePropertiesPath, gradleProperties);
      
      return config;
    },
  ]);
};

module.exports = withNewArchitecture;