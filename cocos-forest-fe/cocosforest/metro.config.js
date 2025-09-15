// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// GLB/GLTF/BIN을 에셋으로 인식시키기
config.resolver.assetExts = [...config.resolver.assetExts, 'glb', 'gltf', 'bin'];

module.exports = config;
