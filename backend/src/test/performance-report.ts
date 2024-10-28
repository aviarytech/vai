import { TEST_CONFIG } from './config';
import { TestTimer } from './runner';

export function generatePerformanceReport() {
  const slowTests = TestTimer.getSlowTests();
  if (slowTests.length > 0) {
    console.log('\nPerformance Report:');
    console.log('==================');
    
    // Sort tests by duration
    slowTests
      .sort((a, b) => b.duration - a.duration)
      .forEach(({ name, duration }) => {
        const severity = duration > TEST_CONFIG.PERFORMANCE.VERY_SLOW_TEST_THRESHOLD ? '🔴' : '🟡';
        console.log(`${severity} ${name}: ${duration.toFixed(2)}ms`);
      });
      
    console.log('==================');
    console.log(`Total slow tests: ${slowTests.length}`);
    console.log(`Average duration: ${(slowTests.reduce((acc, test) => acc + test.duration, 0) / slowTests.length).toFixed(2)}ms`);
    console.log('==================\n');
  }
}
