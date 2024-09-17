import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import fileExtensionsInImportTs from "eslint-plugin-file-extension-in-import-ts";
import pluginReact from "eslint-plugin-react";
import jest from 'eslint-plugin-jest';

export default [
  {files: ["**/*.{ts,tsx}"]},
  {
    files: ["packages/server/**/*.{ts}"],
    plugins: {
      "file-extension-in-import-ts": fileExtensionsInImportTs,
    },
    rules: {
      'file-extension-in-import-ts/file-extension-in-import-ts': [
        'error',
        'always',
      ],
      "no-unused-vars": "warn"
    }
  },
  {
    files: ["packages/frontend/**/*.{ts,tsx}"],
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      }
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["packages/server/tests/**/*.{ts}"],
    ...jest.configs['flat/style']
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser
      }
    },
    "settings": {
      "node": {
        "tryExtensions": [".js", ".json", ".ts", ".tsx", ".css"]
      }
    },
  }
];

