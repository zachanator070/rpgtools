import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import fileExtensionsInImportTs from 'eslint-plugin-file-extension-in-import-ts';


export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    "plugins": {
      "file-extension-in-import-ts": fileExtensionsInImportTs
    },
    "rules": {
      'file-extension-in-import-ts/file-extension-in-import-ts': [
        'error',
        'always',
        { extMapping: {'.ts': '.js' } }
      ]
    }
  }
];

