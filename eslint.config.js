import { fileURLToPath, URL } from 'node:url'
import js from '@eslint/js'
import { includeIgnoreFile } from 'eslint/config'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import typescriptEslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default typescriptEslint.config(
  includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url)), {
    gitignoreResolution: true,
  }),

  js.configs.recommended,

  {
    extends: [typescriptEslint.configs.strictTypeChecked],
    files: ['**/*.{ts,mts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/explicit-member-accessibility': 'error',
    },
  },

  ...vue.configs['flat/recommended'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        extraFileExtensions: ['.vue'],
        parser: typescriptEslint.parser,
        projectService: true,
        sourceType: 'module',
      },
    },
  },

  {
    files: [
      'lib/**/*.{ts,mts}',
      'components/**/*.{ts,vue}',
      'pages/**/*.ts',
      '.vitepress/theme/**/*.{ts,vue}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                './**',
                '../**',
              ],
              message: 'Use the @/ alias instead of relative imports.',
            },
          ],
        },
      ],
    },
  },

  prettierRecommended,
)
