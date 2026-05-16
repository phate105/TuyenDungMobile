const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add wasm to assetExts so Expo SQLite works on the Web
config.resolver.assetExts.push('wasm');

module.exports = config;
