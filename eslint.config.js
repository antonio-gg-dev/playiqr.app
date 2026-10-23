import js from '@eslint/js'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import typescriptEslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default typescriptEslint.config(
  {
    ignores: [
      '.vitepress/cache/**',
      '.vitepress/dist/**',
    ],
  },
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
  prettierRecommended,
)
