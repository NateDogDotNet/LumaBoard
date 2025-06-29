/**
 * LumaBoard Resilience System
 * Comprehensive error handling, retry mechanisms, and graceful degradation
 */

class ResilienceManager {
  constructor(config = {}) {
    this.config = {
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      exponentialBackoff: config.exponentialBackoff !== false,
      networkTimeout: config.networkTimeout || 10000,
      healthCheckInterval: config.healthCheckInterval || 30000,
      errorThreshold: config.errorThreshold || 5,
      circuitBreakerTimeout: config.circuitBreakerTimeout || 60000,
      ...config
    };
    
    this.errorBoundaries = new Map();
    this.retryStrategies = new Map();
    this.fallbackContent = new Map();
    this.circuitBreakers = new Map();
    this.healthMetrics = new Map();
    this.errorCounts = new Map();
    
    this.init();
  }

  init() {
    this.setupGlobalErrorHandling();
    this.setupNetworkMonitoring();
    this.startHealthMonitoring();
    console.log('ResilienceManager: Initialized');
  }

  /**
   * Setup global error handling
   */
  setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('ResilienceManager: Unhandled promise rejection:', event.reason);
      this.handleError('global', event.reason, 'promise_rejection');
      event.preventDefault();
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('ResilienceManager: JavaScript error:', event.error);
      this.handleError('global', event.error, 'javascript_error');
    });

    // Handle resource loading errors
    document.addEventListener('error', (event) => {
      if (event.target !== window) {
        console.error('ResilienceManager: Resource loading error:', event.target);
        this.handleError('resource', new Error(`Failed to load ${event.target.tagName}`), 'resource_error');
      }
    }, true);
  }

  /**
   * Setup network monitoring
   */
  setupNetworkMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      console.log('ResilienceManager: Network connection restored');
      this.handleNetworkRestore();
    });

    window.addEventListener('offline', () => {
      console.warn('ResilienceManager: Network connection lost');
      this.handleNetworkLoss();
    });
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform system health check
   */
  performHealthCheck() {
    const health = {
      timestamp: Date.now(),
      online: navigator.onLine,
      memory: this.getMemoryUsage(),
      errors: this.getErrorCounts(),
      widgets: this.getWidgetHealth(),
      performance: this.getPerformanceMetrics()
    };
    
    this.healthMetrics.set('latest', health);
    
    // Emit health check event
    document.dispatchEvent(new CustomEvent('healthcheck', {
      detail: health
    }));
    
    // Check for degraded performance
    if (health.errors.total > this.config.errorThreshold) {
      this.handleDegradedPerformance(health);
    }
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }

  /**
   * Get error counts by category
   */
  getErrorCounts() {
    const counts = { total: 0 };
    
    for (const [category, count] of this.errorCounts) {
      counts[category] = count;
      counts.total += count;
    }
    
    return counts;
  }

  /**
   * Get widget health status
   */
  getWidgetHealth() {
    const widgets = document.querySelectorAll('.lumaboard-widget');
    const health = {
      total: widgets.length,
      healthy: 0,
      errors: 0
    };
    
    widgets.forEach(widget => {
      const hasError = widget.querySelector('.widget-error');
      if (hasError) {
        health.errors++;
      } else {
        health.healthy++;
      }
    });
    
    return health;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    if (navigation) {
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: this.getFirstPaintTime(),
        resourceCount: performance.getEntriesByType('resource').length
      };
    }
    
    return null;
  }

  /**
   * Get first paint time
   */
  getFirstPaintTime() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  /**
   * Handle error with context and recovery
   */
  handleError(context, error, category = 'unknown') {
    console.error(`ResilienceManager: Error in ${context}:`, error);
    
    // Update error counts
    const currentCount = this.errorCounts.get(category) || 0;
    this.errorCounts.set(category, currentCount + 1);
    
    // Check circuit breaker
    if (this.shouldTripCircuitBreaker(context, category)) {
      this.tripCircuitBreaker(context);
    }
    
    // Try recovery strategies
    this.attemptRecovery(context, error, category);
    
    // Emit error event
    document.dispatchEvent(new CustomEvent('resilienceerror', {
      detail: { context, error: error.message, category }
    }));
  }

  /**
   * Check if circuit breaker should trip
   */
  shouldTripCircuitBreaker(context, category) {
    const errorCount = this.errorCounts.get(category) || 0;
    return errorCount >= this.config.errorThreshold;
  }

  /**
   * Trip circuit breaker for context
   */
  tripCircuitBreaker(context) {
    const breaker = {
      tripped: true,
      tripTime: Date.now(),
      timeout: this.config.circuitBreakerTimeout
    };
    
    this.circuitBreakers.set(context, breaker);
    
    console.warn(`ResilienceManager: Circuit breaker tripped for ${context}`);
    
    // Auto-reset after timeout
    setTimeout(() => {
      this.resetCircuitBreaker(context);
    }, breaker.timeout);
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(context) {
    this.circuitBreakers.delete(context);
    this.errorCounts.delete(context);
    console.log(`ResilienceManager: Circuit breaker reset for ${context}`);
  }

  /**
   * Check if circuit breaker is tripped
   */
  isCircuitBreakerTripped(context) {
    const breaker = this.circuitBreakers.get(context);
    return breaker && breaker.tripped;
  }

  /**
   * Attempt error recovery
   */
  attemptRecovery(context, error, category) {
    const recoveryStrategies = {
      network_error: () => this.handleNetworkError(context, error),
      widget_error: () => this.handleWidgetError(context, error),
      config_error: () => this.handleConfigError(context, error),
      resource_error: () => this.handleResourceError(context, error),
      javascript_error: () => this.handleJavaScriptError(context, error)
    };
    
    const strategy = recoveryStrategies[category];
    if (strategy) {
      try {
        strategy();
      } catch (recoveryError) {
        console.error(`ResilienceManager: Recovery strategy failed for ${category}:`, recoveryError);
      }
    }
  }

  /**
   * Handle network errors
   */
  handleNetworkError(context, error) {
    console.log(`ResilienceManager: Handling network error for ${context}`);
    
    // Enable offline mode
    document.dispatchEvent(new CustomEvent('enableofflinemode', {
      detail: { context, error: error.message }
    }));
    
    // Show network error notification
    this.showErrorNotification('Network connection lost. Operating in offline mode.', 'warning');
  }

  /**
   * Handle widget errors
   */
  handleWidgetError(context, error) {
    console.log(`ResilienceManager: Handling widget error for ${context}`);
    
    // Find and restart the widget
    const widget = document.querySelector(`[data-widget-id="${context}"]`);
    if (widget) {
      this.restartWidget(widget);
    }
  }

  /**
   * Handle configuration errors
   */
  handleConfigError(context, error) {
    console.log(`ResilienceManager: Handling config error for ${context}`);
    
    // Load fallback configuration
    document.dispatchEvent(new CustomEvent('loadfallbackconfig', {
      detail: { context, error: error.message }
    }));
  }

  /**
   * Handle resource loading errors
   */
  handleResourceError(context, error) {
    console.log(`ResilienceManager: Handling resource error for ${context}`);
    
    // Try to reload the resource or use fallback
    this.retryResourceLoad(context);
  }

  /**
   * Handle JavaScript errors
   */
  handleJavaScriptError(context, error) {
    console.log(`ResilienceManager: Handling JavaScript error for ${context}`);
    
    // Attempt to restart the affected component
    this.restartComponent(context);
  }

  /**
   * Restart a widget
   */
  restartWidget(widgetElement) {
    try {
      const widgetType = widgetElement.getAttribute('data-widget-type');
      const widgetId = widgetElement.getAttribute('data-widget-id');
      
      console.log(`ResilienceManager: Restarting widget ${widgetType} (${widgetId})`);
      
      // Emit widget restart event
      document.dispatchEvent(new CustomEvent('restartwidget', {
        detail: { widgetType, widgetId, element: widgetElement }
      }));
      
    } catch (error) {
      console.error('ResilienceManager: Failed to restart widget:', error);
    }
  }

  /**
   * Restart a component
   */
  restartComponent(context) {
    console.log(`ResilienceManager: Attempting to restart component ${context}`);
    
    // Emit component restart event
    document.dispatchEvent(new CustomEvent('restartcomponent', {
      detail: { context }
    }));
  }

  /**
   * Retry resource loading
   */
  retryResourceLoad(context) {
    console.log(`ResilienceManager: Retrying resource load for ${context}`);
    
    // Emit resource retry event
    document.dispatchEvent(new CustomEvent('retryresource', {
      detail: { context }
    }));
  }

  /**
   * Handle network restoration
   */
  handleNetworkRestore() {
    // Reset network-related circuit breakers
    for (const [context, breaker] of this.circuitBreakers) {
      if (context.includes('network')) {
        this.resetCircuitBreaker(context);
      }
    }
    
    // Disable offline mode
    document.dispatchEvent(new CustomEvent('disableofflinemode'));
    
    // Show restoration notification
    this.showErrorNotification('Network connection restored.', 'success');
  }

  /**
   * Handle network loss
   */
  handleNetworkLoss() {
    // Enable offline mode for all network-dependent components
    document.dispatchEvent(new CustomEvent('enableofflinemode'));
  }

  /**
   * Handle degraded performance
   */
  handleDegradedPerformance(health) {
    console.warn('ResilienceManager: Degraded performance detected', health);
    
    // Emit performance degradation event
    document.dispatchEvent(new CustomEvent('performancedegradation', {
      detail: health
    }));
    
    // Suggest optimizations
    this.suggestOptimizations(health);
  }

  /**
   * Suggest performance optimizations
   */
  suggestOptimizations(health) {
    const suggestions = [];
    
    if (health.memory && health.memory.percentage > 80) {
      suggestions.push('High memory usage detected. Consider reducing widget complexity.');
    }
    
    if (health.errors.total > this.config.errorThreshold) {
      suggestions.push('High error rate detected. Check widget configurations.');
    }
    
    if (health.widgets.errors > 0) {
      suggestions.push(`${health.widgets.errors} widgets have errors. Check widget status.`);
    }
    
    if (suggestions.length > 0) {
      console.warn('ResilienceManager: Performance suggestions:', suggestions);
      
      // Emit optimization suggestions
      document.dispatchEvent(new CustomEvent('optimizationsuggestions', {
        detail: { suggestions }
      }));
    }
  }

  /**
   * Show error notification
   */
  showErrorNotification(message, type = 'error') {
    // Emit notification event
    document.dispatchEvent(new CustomEvent('shownotification', {
      detail: { message, type, duration: 5000 }
    }));
  }

  /**
   * Create retry strategy with exponential backoff
   */
  async retry(operation, context, maxRetries = null) {
    const retries = maxRetries || this.config.maxRetries;
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === retries) {
          console.error(`ResilienceManager: All retry attempts failed for ${context}:`, error);
          this.handleError(context, error, 'retry_exhausted');
          throw error;
        }
        
        const delay = this.calculateRetryDelay(attempt);
        console.warn(`ResilienceManager: Attempt ${attempt + 1} failed for ${context}, retrying in ${delay}ms:`, error);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(attempt) {
    if (this.config.exponentialBackoff) {
      return this.config.retryDelay * Math.pow(2, attempt);
    }
    return this.config.retryDelay;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wrap function with error boundary
   */
  wrapWithErrorBoundary(fn, context) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(context, error, 'boundary');
        throw error;
      }
    };
  }

  /**
   * Get system resilience status
   */
  getStatus() {
    return {
      healthy: this.getErrorCounts().total < this.config.errorThreshold,
      errorCounts: this.getErrorCounts(),
      circuitBreakers: Array.from(this.circuitBreakers.keys()),
      lastHealthCheck: this.healthMetrics.get('latest'),
      networkOnline: navigator.onLine
    };
  }

  /**
   * Reset all resilience state
   */
  reset() {
    this.errorCounts.clear();
    this.circuitBreakers.clear();
    this.healthMetrics.clear();
    console.log('ResilienceManager: State reset');
  }

  /**
   * Destroy resilience manager
   */
  destroy() {
    this.reset();
    console.log('ResilienceManager: Destroyed');
  }
}

// Global instance
let globalResilienceManager = null;

export function initResilienceManager(config = {}) {
  globalResilienceManager = new ResilienceManager(config);
  return globalResilienceManager;
}

export function getResilienceManager() {
  if (!globalResilienceManager) {
    globalResilienceManager = new ResilienceManager();
  }
  return globalResilienceManager;
}

export function handleError(context, error, category) {
  return getResilienceManager().handleError(context, error, category);
}

export function retry(operation, context, maxRetries) {
  return getResilienceManager().retry(operation, context, maxRetries);
}

export function wrapWithErrorBoundary(fn, context) {
  return getResilienceManager().wrapWithErrorBoundary(fn, context);
}

export { ResilienceManager };
export default getResilienceManager; 