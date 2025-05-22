// Performance utilities for terminal application

export class PerformanceOptimizer {
  private static contentCache = new Map<string, any>();
  private static commandHistory = new Set<string>();

  // Cache management
  static cacheContent(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    const expiry = Date.now() + ttl;
    this.contentCache.set(key, { data, expiry });
  }

  static getCachedContent(key: string): any | null {
    const cached = this.contentCache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.contentCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  static clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.contentCache.entries()) {
      if (now > value.expiry) {
        this.contentCache.delete(key);
      }
    }
  }

  // Debounce utility for search and input
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle utility for scroll events
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Lazy loading for large content
  static async lazyLoadContent(loader: () => Promise<any>): Promise<any> {
    return new Promise((resolve) => {
      // Use requestIdleCallback if available, otherwise setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          loader().then(resolve);
        });
      } else {
        setTimeout(() => {
          loader().then(resolve);
        }, 0);
      }
    });
  }

  // Command prediction for autocomplete
  static predictCommand(input: string, availableCommands: string[]): string[] {
    if (!input.trim()) return [];
    
    const inputLower = input.toLowerCase();
    this.commandHistory.add(inputLower);
    
    // Prioritize exact matches, then startsWith, then includes
    const exactMatches = availableCommands.filter(cmd => 
      cmd.toLowerCase() === inputLower
    );
    const startMatches = availableCommands.filter(cmd => 
      cmd.toLowerCase().startsWith(inputLower) && !exactMatches.includes(cmd)
    );
    const partialMatches = availableCommands.filter(cmd => 
      cmd.toLowerCase().includes(inputLower) && 
      !exactMatches.includes(cmd) && 
      !startMatches.includes(cmd)
    );
    
    return [...exactMatches, ...startMatches, ...partialMatches].slice(0, 5);
  }

  // Memory cleanup
  static cleanup() {
    this.clearExpiredCache();
    // Keep only last 50 commands in history
    if (this.commandHistory.size > 50) {
      const entries = Array.from(this.commandHistory);
      this.commandHistory.clear();
      entries.slice(-50).forEach(cmd => this.commandHistory.add(cmd));
    }
  }

  // Performance monitoring
  static measurePerformance<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (end - start > 100) { // Log slow operations
      console.warn(`Slow operation "${name}": ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }
}