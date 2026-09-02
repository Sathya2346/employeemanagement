const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;

// Keep the existing UI import:
//   import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// but resolve the barrel through a local shim. This avoids the web runtime
// resolving the icon set as an object while preserving the current App.js UI.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@expo/vector-icons') {
    return defaultResolveRequest(
      context,
      path.resolve(__dirname, 'vector-icons-shim'),
      platform
    );
  }
  return defaultResolveRequest(context, moduleName, platform);
};

module.exports = config;
