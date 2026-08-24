const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch the local module directory
config.watchFolders = [workspaceRoot];

// Force Metro to resolve peer dependencies from the example app's node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Force resolution of these packages to this project's node_modules to avoid Duplicate React Error
config.resolver.extraNodeModules = {
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'expo': path.resolve(projectRoot, 'node_modules/expo'),
};

module.exports = config;
