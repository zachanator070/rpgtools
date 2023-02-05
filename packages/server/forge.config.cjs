const fs = require('fs');
const path = require('path');

module.exports = {
  packagerConfig: { prune: false, executableName: '@rpgtools-server' },
  rebuildConfig: {},
  hooks: {},
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
