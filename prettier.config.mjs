/**
 * @type {import('prettier').Config}
 */
const config = {
  semi: false,
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  endOfLine: 'lf',
  plugins: ['prettier-plugin-jsdoc'],
  jsdocCommentLineStrategy: 'multiline',
  jsdocCapitalizeDescription: true,
  jsdocPreferCodeFences: true,
  jsdocSeparateReturnsFromParam: true,
}

export default config
