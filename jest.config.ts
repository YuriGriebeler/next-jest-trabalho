import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/app/**/page.tsx',
    '!src/app/**/layout.tsx',
    '!src/app/**/template.tsx',
    '!src/app/api/**/route.ts',
    '!src/services/firebase.ts',
    '!src/**/types.ts',
    '!src/**/*.types.ts',
    '!src/**/*.edge.ts',
    '!src/components/providers/**',
    '!src/**/constants.ts',
    '!src/components/dashboard/ServerTaskSummary.tsx',
    '!src/utils/http-response.ts',
    '!src/services/tasks/task.repository.ts',
    '!src/services/auth/auth.constants.ts',
    '!src/services/auth/session.service.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
};

export default createJestConfig(config);