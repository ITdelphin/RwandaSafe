module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { strict: false } }],
  },
  moduleNameMapper: {
    '^@rwanda-safe/(.*)$': '<rootDir>/../../packages/$1/src',
  },
};
