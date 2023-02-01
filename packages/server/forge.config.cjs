const fs = require('fs');
const path = require('path');

module.exports = {
  packagerConfig: { prune: false, executableName: '@rpgtools-server' },
  rebuildConfig: {},
  hooks: {
    postPackage: async (forgeConfig, options) => {
      fs.cpSync(path.join('.', '..', 'frontend', 'dist'), path.join(options.outputPaths[0], 'resources', 'app', 'dist', 'frontend',), {recursive: true});
      fs.cpSync(path.join('.', '..', '..', 'node_modules'), path.join(options.outputPaths[0], 'resources', 'app', 'node_modules'), {recursive: true});
    }
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {bin: '@rpgtools-server'},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {bin: '@rpgtools-server'},
    },
    // {
    //   name: '@electron-forge/maker-rpm',
    //   config: {bin: '@rpgtools-server'},
    // },
  ],
};
