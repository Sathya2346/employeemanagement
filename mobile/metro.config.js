const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const shim = path.resolve(__dirname, 'vector-icons-shim/index.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@expo/vector-icons') {
    return context.resolveRequest(context, shim, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
