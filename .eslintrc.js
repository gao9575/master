module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    indent: ['off', 2],
    "camelcase": ["error", {
      "properties": "always"
    }]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
