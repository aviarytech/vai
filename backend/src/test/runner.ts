import { describe, expect, it, beforeAll, afterAll, beforeEach, afterEach } from "bun:test";
import { generatePerformanceReport } from './performance-report';

// Update TestTimer to store test durations
export class TestTimer {
  private static timers: { [key: string]: number } = {};
  private static durations: { name: string; duration: number }[] = [];
  private static currentTest: string | null = null;
  private static suiteCount = 0;
  private static completedSuites = 0;

  static start(testName: string) {
    this.timers[testName] = performance.now();
    this.currentTest = testName;
  }

  static end(testName: string) {
    const endTime = performance.now();
    const duration = endTime - (this.timers[testName] || endTime);
    if (duration > 100) { // Only track slow tests
      this.durations.push({ name: testName, duration });
      console.log(`⚠️ Slow test detected: "${testName}" took ${duration.toFixed(2)}ms`);
    }
    delete this.timers[testName];
    this.currentTest = null;
    return duration;
  }

  static getSlowTests() {
    return this.durations;
  }

  static reset() {
    this.timers = {};
    this.durations = [];
    this.currentTest = null;
  }

  static getCurrentTest() {
    return this.currentTest;
  }

  static incrementSuiteCount() {
    this.suiteCount++;
  }

  static incrementCompletedSuites() {
    this.completedSuites++;
    if (this.completedSuites === this.suiteCount) {
      console.log('\nAll test suites completed. Generating final report...');
      generatePerformanceReport();
    }
  }
}

// Create a test runner that wraps Bun's test functions
export function setupTestRunner() {
  const originalDescribe = describe;

  // Wrap describe to track suite execution
  global.describe = function wrappedDescribe(name: string, fn: () => void) {
    TestTimer.incrementSuiteCount();
    return originalDescribe(name, () => {
      console.log(`\nRunning test suite: ${name}`);
      TestTimer.start(`Suite: ${name}`);
      try {
        fn();
      } finally {
        TestTimer.end(`Suite: ${name}`);
        TestTimer.incrementCompletedSuites();
      }
    });
  };

  // Wrap it to track individual test execution
  global.it = function wrappedIt(name: string, fn: () => void | Promise<void>) {
    return it(name, async () => {
      TestTimer.start(name);
      try {
        await fn();
      } finally {
        TestTimer.end(name);
      }
    });
  };

  // Force immediate console flushing
  const originalLog = console.log;
  console.log = (...args) => {
    originalLog(...args);
    if (process.stdout.write) {
      process.stdout.write('');
    }
  };

  // Add process handlers
  process.on('beforeExit', () => {
    console.log('\nGenerating performance report before exit...');
    generatePerformanceReport();
  });

  process.on('exit', () => {
    console.log('\nGenerating final performance report...');
    generatePerformanceReport();
  });

  // Handle test failures
  process.on('uncaughtException', (error) => {
    const currentTest = TestTimer.getCurrentTest();
    if (currentTest) {
      console.error(`\n❌ Test failed: "${currentTest}"`);
      console.error(error);
      generatePerformanceReport();
    }
  });

  // Handle async errors
  process.on('unhandledRejection', (error) => {
    const currentTest = TestTimer.getCurrentTest();
    if (currentTest) {
      console.error(`\n❌ Test failed (unhandled rejection): "${currentTest}"`);
      console.error(error);
      generatePerformanceReport();
    }
  });
}
