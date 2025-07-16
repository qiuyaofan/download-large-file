module.exports = {
  root: true,
  env: {
    browser: true,
  },
  globals: {
    defineProps: 'readonly',
  },
  extends: ['plugin:vue/vue3-essential', '@vue/typescript', '@vue/prettier'],
  plugins: ['simple-import-sort'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
    'vue/require-default-prop': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'vue/multi-word-component-names': 'off',
  },
  overrides: [
    {
      files: ['**/tests/**/*.{j,t}s?(x)', '**/__tests__/**/*.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
  ],
};
