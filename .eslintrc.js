module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended',
  ],
  // required to lint *.vue files
  plugins: [
    'vue',
  ],
  // add your custom rules here
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'space-before-function-paren': ['error', 'never'],
    'vue/html-closing-bracket-spacing': [2, {
      selfClosingTag: 'always',
    }],
    'vue/max-attributes-per-line': 0,
    'semi': [2, 'never'],
    'indent': [2, 2],
    'quotes': [2, 'single'],
    'prefer-const': 2,
    'comma-spacing': 2,
    'comma-style': 2,
    'object-shorthand': 2,
  },
}
