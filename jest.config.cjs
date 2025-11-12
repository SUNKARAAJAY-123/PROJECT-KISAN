module.exports = {
  testEnvironment: require.resolve('jest-environment-jsdom'),
    transform: {
      '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
    },
    // Use babel.config.cjs for CommonJS compatibility
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
    transformIgnorePatterns: [
      '/node_modules/(?!@google/genai)'
    ],
    // Transform .mjs files in @google/genai for ESM compatibility
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
    globals: {
      'ts-jest': {
        useESM: true,
      },
    },
};
