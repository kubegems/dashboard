const { defineConfig } = require('eslint-define-config');
module.exports = defineConfig({
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'plugin:vue/recommended',
    'plugin:vuetify/base',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
  ],
  plugins: ['vue'],
  rules: {
    'vue/script-setup-uses-vars': 'error',
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'vue/no-unused-properties': [
      'error',
      {
        groups: ['props', 'data', 'computed', 'setup', 'methods'],
        deepData: false,
        ignorePublicMembers: false,
      },
    ],
    'vue/require-name-property': ['error'],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/prop-name-casing': ['error', 'camelCase'],
    'vue/component-options-name-casing': ['error', 'PascalCase'],
    'vue/no-use-computed-property-like-method': ['error'],
    'vue/v-on-function-call': ['error'],
    'vue/require-default-prop': ['error'],
    'vue/v-slot-style': [
      'error',
      {
        atComponent: 'shorthand',
        default: 'shorthand',
        named: 'shorthand',
      },
    ],
    'vue/no-unused-refs': ['error'],
    'vue/custom-event-name-casing': [
      'error',
      'camelCase',
      {
        ignores: [],
      },
    ],
    'vue/valid-v-slot': ['error'],
    'vue/no-reserved-props': [
      'error',
      {
        vueVersion: 2,
      },
    ],
    'vue/max-len': [
      'error',
      {
        code: 120,
        template: 120,
        tabWidth: 2,
        comments: 80,
        ignorePattern: '^`.*`$',
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
        ignoreHTMLAttributeValues: true,
        ignoreHTMLTextContents: true,
      },
    ],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'sibling', 'parent', 'index', 'unknown'],
      },
    ],

    'import/no-unresolved': ['off'],

    'vue/no-template-shadow': ['off'],
    'vue/multi-word-component-names': ['off'],
    'vue/no-v-html': ['off'],
  },
  ignorePatterns: [
    '*.sh',
    'node_modules',
    '*.md',
    '*.woff',
    '*.ttf',
    '.vscode',
    '.idea',
    'dist',
    '/public',
    '/docs',
    '.husky',
    '.local',
    '/bin',
    'Dockerfile',
  ],
});
