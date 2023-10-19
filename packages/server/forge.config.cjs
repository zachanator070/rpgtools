const fs = require('fs');
const path = require('path');

const config = {
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

try {
  const fileContents = fs.readFileSync('../../package.json', 'utf8');
  const data = JSON.parse(fileContents);
  console.log(`Building Electron App version ${data.version}`);
  config.appVersion = data.version;
  config.packagerConfig.appVersion = data.version;
  for(let maker of config.makers) {
    maker.config.version = data.version;
  }
} catch (err) {
  console.error(err);
  throw err;
}

module.exports = config;
