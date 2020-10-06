// https://jestjs.io/docs/en/configuration
module.exports = {
  bail: 1,
  collectCoverage: true,
  collectCoverageFrom: ['**/*.js', '!.[a-z]*', '!*.config.js'],
  coverageDirectory: 'reports',
  coveragePathIgnorePatterns: ['<rootDir>/reports', '<rootDir>/test'],
  // coverageProvider: 'babel',
  verbose: true
}
