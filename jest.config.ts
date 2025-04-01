import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  roots: ['<rootDir>/test'], 
  moduleFileExtensions: ['ts', 'js'],
  testTimeout: 10000,
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};

export default config;