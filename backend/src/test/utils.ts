export class TestTimer {
  private static timers: { [key: string]: number } = {};

  static start(testName: string) {
    this.timers[testName] = performance.now();
  }

  static end(testName: string) {
    const endTime = performance.now();
    const duration = endTime - (this.timers[testName] || endTime);
    if (duration > 100) { // Only log slow tests (>100ms)
      console.warn(`⚠️ Slow test detected: "${testName}" took ${duration.toFixed(2)}ms`);
    }
    delete this.timers[testName];
    return duration;
  }
}
