const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// The mobile UI currently imports MaterialCommunityIcons as a named export
// from @expo/vector-icons. Keep that existing UI code intact while resolving
// the barrel import through a stable local shim. The shim itself uses Expo's
// documented direct default import for the icon set.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@expo/vector-icons': path.resolve(__dirname, 'vector-icons-shim'),
};

module.exports = config;
