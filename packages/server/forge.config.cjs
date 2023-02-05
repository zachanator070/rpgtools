const fs = require('fs');
const path = require('path');

module.exports = {
  packagerConfig: { prune: false, executableName: '@rpgtools-server' },
  rebuildConfig: {},
  hooks: {
    postPackage: async (forgeConfig, options) => {
      const rpgtoolsModuleDestination = path.join(options.outputPaths[0], 'resources', 'app', 'node_modules', '@rpgtools');
      fs.cpSync(path.join('.', '..', 'frontend', 'dist'), path.join(options.outputPaths[0], 'resources', 'app', 'dist', 'frontend'), {recursive: true});
      // fs.cpSync(path.join('.', '..', '..', 'node_modules_cache'), path.join(options.outputPaths[0], 'resources', 'app', 'node_modules'), {recursive: true, errorOnExist: true});
      // fs.mkdirSync(rpgtoolsModuleDestination);
      // fs.cpSync(path.join('.', '..', 'common'), path.join(rpgtoolsModuleDestination, 'common'), {recursive: true});
    }
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {bin: 'rpgtools-server', name: 'rpgtools-server', artifactName: 'rpgtools-server', appName: 'rpgtools-server'},
    },
    {
      name: '@electron-forge/maker-deb',
      config: {bin: '@rpgtools-server'},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {bin: '@rpgtools-server'},
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {bin: '@rpgtools-server'}
    }
  ],
};
