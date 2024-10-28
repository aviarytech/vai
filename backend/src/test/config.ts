export const TEST_CONFIG = {
  TIMEOUT: 5000, // 5 seconds timeout for tests
  PARALLEL: true, // Run tests in parallel when possible
  COLLECTIONS: {
    CREDENTIALS: 'credentials',
    VERIFICATION_RECORDS: 'verificationrecords'
  },
  PERFORMANCE: {
    SLOW_TEST_THRESHOLD: 100, // ms
    VERY_SLOW_TEST_THRESHOLD: 500, // ms
  }
};
