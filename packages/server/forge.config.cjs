const fs = require('fs');
const path = require('path');

let config = {};


try {
  const fileContents = fs.readFileSync('../../package.json', 'utf8');
  const data = JSON.parse(fileContents);
  const version = data.version;
  console.log(`Building Electron App version ${version}`);

  config = {
    packagerConfig: { prune: false, executableName: '@rpgtools-server' },
    rebuildConfig: {},
    hooks: {},
    makers: [
      {
        name: '@electron-forge/maker-squirrel',
        config: {bin: 'rpgtools-server', name: 'rpgtools-server', artifactName: 'rpgtools-server', appName: 'rpgtools-server', setupExe: `@rpgtools-server-${version} Setup`, version},
      },
      {
        name: '@electron-forge/maker-deb',
        config: {bin: '@rpgtools-server', version},
      },
      {
        name: '@electron-forge/maker-rpm',
        config: {bin: '@rpgtools-server', version},
      },
      {
        name: '@electron-forge/maker-dmg',
        config: {bin: '@rpgtools-server', name: `@rpgtools-server-${version}-x64`}
      }
    ],
  };

} catch (err) {
  console.error(err);
  throw err;
}

module.exports = config;
