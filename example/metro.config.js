const fs = require('fs');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const dirname = fs.realpathSync.native(__dirname);
const root = path.resolve(dirname, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = withMetroConfig(getDefaultConfig(dirname), {
  root,
  dirname,
  conditions: ['squircle-view-source'],
});

module.exports = config;
