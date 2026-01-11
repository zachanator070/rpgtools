const fs = require('fs');
const path = require('path');

let config = {};


try {
  const fileContents = fs.readFileSync('package.json', 'utf8');
  const data = JSON.parse(fileContents);
  const version = data.version;
  console.log(`Building Electron App version ${version}`);

  config = {
    packagerConfig: { prune: true, executableName: '@rpgtools-server' },
    rebuildConfig: {},
    hooks: {
      async postPackage(_, { outputPaths }) {
        // Electron Forge may produce multiple output paths (e.g., dmg + zip),
        // so loop through them.
        for (const outputPath of outputPaths) {
          // The app directory inside the packaged output. In asar builds, this
          // directory contains the app files unless you've enabled `asarUnpack`.
          const appDir = path.join(outputPath, 'resources', 'app');

          const toDelete = [
            'db',
            'dev',
            'packages/frontend',
            'packages/server/src',
            'packages/server/tests',
            'packages/server/db',
            '.cache',
          ];

          for (const rel of toDelete) {
            const target = path.join(appDir, rel);

            if (fs.existsSync(target)) {
              try {
                fs.rmSync(target, { recursive: true, force: true });
                console.log(`[postPackage] Deleted: ${target}`);
              } catch (err) {
                console.error(`[postPackage] Failed to delete: ${target}`, err);
              }
            }
          }
        }
      }
    },
    makers: [
      {
        name: '@electron-forge/maker-squirrel',
        config: {bin: 'rpgtools-server', name: 'rpgtools-server', artifactName: 'rpgtools-server', appName: 'rpgtools-server', setupExe: `@rpgtools-server-${version} Setup.exe`, version},
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
