/**
 * Freshness Indicator Component for LumaBoard
 * Shows data age and freshness status for widgets
 */
export class FreshnessIndicator {
  constructor(widget, options = {}) {
    this.widget = widget;
    this.options = {
      showAge: options.showAge !== false, // Show by default
      showIcon: options.showIcon !== false, // Show by default
      position: options.position || 'top-right', // top-right, top-left, bottom-right, bottom-left
      threshold: {
        fresh: options.threshold?.fresh || 60000, // 1 minute
        stale: options.threshold?.stale || 300000, // 5 minutes
        expired: options.threshold?.expired || 900000 // 15 minutes
      },
      ...options
    };
    
    this.indicator = null;
    this.updateInterval = null;
    this.lastUpdate = null;
    
    this.init();
  }

  /**
   * Initialize the freshness indicator
   */
  init() {
    this.createIndicator();
    this.attachToWidget();
    this.startUpdateTimer();
    this.updateFreshness();
  }

  /**
   * Create the indicator DOM element
   */
  createIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.className = 'freshness-indicator';
    this.indicator.style.cssText = this.getIndicatorStyles();
    this.indicator.innerHTML = this.getIndicatorHTML();
  }

  /**
   * Get CSS styles for the indicator
   */
  getIndicatorStyles() {
    const positions = {
      'top-right': 'top: 8px; right: 8px;',
      'top-left': 'top: 8px; left: 8px;',
      'bottom-right': 'bottom: 8px; right: 8px;',
      'bottom-left': 'bottom: 8px; left: 8px;'
    };

    return `
      position: absolute;
      ${positions[this.options.position] || positions['top-right']}
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-family: 'Segoe UI', monospace, sans-serif;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
      z-index: 100;
      transition: all 0.3s ease;
      opacity: 0.8;
      pointer-events: none;
      user-select: none;
    `;
  }

  /**
   * Get HTML content for the indicator
   */
  getIndicatorHTML() {
    return `
      <span class="freshness-icon">🟢</span>
      <span class="freshness-text">Fresh</span>
    `;
  }

  /**
   * Attach the indicator to the widget
   */
  attachToWidget() {
    if (!this.widget || !this.indicator) return;
    
    // Ensure widget has relative positioning
    const widgetStyle = window.getComputedStyle(this.widget);
    if (widgetStyle.position === 'static') {
      this.widget.style.position = 'relative';
    }
    
    // Append indicator to widget
    this.widget.appendChild(this.indicator);
  }

  /**
   * Start the update timer
   */
  startUpdateTimer() {
    // Update every 5 seconds
    this.updateInterval = setInterval(() => {
      this.updateFreshness();
    }, 5000);
  }

  /**
   * Stop the update timer
   */
  stopUpdateTimer() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update the freshness display
   */
  updateFreshness() {
    if (!this.indicator) return;
    
    const now = Date.now();
    const lastUpdate = this.getLastUpdate();
    
    if (!lastUpdate) {
      this.setStatus('unknown', '?', 'No data');
      return;
    }
    
    const age = now - lastUpdate;
    const { status, icon, text } = this.getFreshnessStatus(age);
    
    this.setStatus(status, icon, text);
  }

  /**
   * Get the last update time from the widget
   */
  getLastUpdate() {
    // Try multiple sources for last update time
    if (this.widget.lastUpdate) {
      return this.widget.lastUpdate;
    }
    
    if (this.widget.dataset?.lastUpdate) {
      return parseInt(this.widget.dataset.lastUpdate);
    }
    
    // Check for cached data timestamp
    const widgetType = this.widget.tagName?.toLowerCase();
    if (widgetType) {
      const cacheKey = `${widgetType}_lastUpdate`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return parseInt(cached);
      }
    }
    
    return this.lastUpdate;
  }

  /**
   * Get freshness status based on age
   */
  getFreshnessStatus(age) {
    const { fresh, stale, expired } = this.options.threshold;
    
    if (age < fresh) {
      return {
        status: 'fresh',
        icon: '🟢',
        text: this.options.showAge ? this.formatAge(age) : 'Fresh'
      };
    } else if (age < stale) {
      return {
        status: 'aging',
        icon: '🟡',
        text: this.options.showAge ? this.formatAge(age) : 'Aging'
      };
    } else if (age < expired) {
      return {
        status: 'stale',
        icon: '🟠',
        text: this.options.showAge ? this.formatAge(age) : 'Stale'
      };
    } else {
      return {
        status: 'expired',
        icon: '🔴',
        text: this.options.showAge ? this.formatAge(age) : 'Expired'
      };
    }
  }

  /**
   * Format age duration for display
   */
  formatAge(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }

  /**
   * Set the indicator status
   */
  setStatus(status, icon, text) {
    if (!this.indicator) return;
    
    const iconElement = this.indicator.querySelector('.freshness-icon');
    const textElement = this.indicator.querySelector('.freshness-text');
    
    if (iconElement && this.options.showIcon) {
      iconElement.textContent = icon;
      iconElement.style.display = 'inline';
    } else if (iconElement) {
      iconElement.style.display = 'none';
    }
    
    if (textElement) {
      textElement.textContent = text;
    }
    
    // Update indicator background based on status
    const colors = {
      fresh: 'rgba(46, 204, 113, 0.8)',
      aging: 'rgba(241, 196, 15, 0.8)',
      stale: 'rgba(230, 126, 34, 0.8)',
      expired: 'rgba(231, 76, 60, 0.8)',
      unknown: 'rgba(149, 165, 166, 0.8)'
    };
    
    this.indicator.style.background = colors[status] || colors.unknown;
    
    // Add pulsing animation for expired data
    if (status === 'expired') {
      this.indicator.style.animation = 'pulse 2s infinite';
      this.addPulseAnimation();
    } else {
      this.indicator.style.animation = 'none';
    }
  }

  /**
   * Add pulse animation CSS if not already present
   */
  addPulseAnimation() {
    if (document.querySelector('#freshness-pulse-animation')) return;
    
    const style = document.createElement('style');
    style.id = 'freshness-pulse-animation';
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
        100% { opacity: 0.8; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Manually update the last update timestamp
   */
  markAsUpdated(timestamp = Date.now()) {
    this.lastUpdate = timestamp;
    
    // Also update widget properties
    if (this.widget) {
      this.widget.lastUpdate = timestamp;
      this.widget.dataset.lastUpdate = timestamp.toString();
    }
    
    // Update cache
    const widgetType = this.widget?.tagName?.toLowerCase();
    if (widgetType) {
      const cacheKey = `${widgetType}_lastUpdate`;
      localStorage.setItem(cacheKey, timestamp.toString());
    }
    
    this.updateFreshness();
  }

  /**
   * Show the indicator
   */
  show() {
    if (this.indicator) {
      this.indicator.style.display = 'flex';
    }
  }

  /**
   * Hide the indicator
   */
  hide() {
    if (this.indicator) {
      this.indicator.style.display = 'none';
    }
  }

  /**
   * Update indicator options
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    if (this.indicator) {
      this.indicator.style.cssText = this.getIndicatorStyles();
    }
    
    this.updateFreshness();
  }

  /**
   * Destroy the freshness indicator
   */
  destroy() {
    this.stopUpdateTimer();
    
    if (this.indicator && this.indicator.parentNode) {
      this.indicator.parentNode.removeChild(this.indicator);
    }
    
    this.indicator = null;
    this.widget = null;
  }
}

/**
 * Global freshness indicator manager
 */
export class FreshnessManager {
  constructor() {
    this.indicators = new Map();
    this.globalOptions = {
      enabled: true,
      showAge: true,
      showIcon: true,
      position: 'top-right'
    };
  }

  /**
   * Add freshness indicator to a widget
   */
  addIndicator(widget, options = {}) {
    if (!this.globalOptions.enabled || !widget) return null;
    
    const widgetId = this.getWidgetId(widget);
    
    // Remove existing indicator if present
    this.removeIndicator(widgetId);
    
    // Create new indicator
    const indicator = new FreshnessIndicator(widget, {
      ...this.globalOptions,
      ...options
    });
    
    this.indicators.set(widgetId, indicator);
    return indicator;
  }

  /**
   * Remove freshness indicator from a widget
   */
  removeIndicator(widgetId) {
    const indicator = this.indicators.get(widgetId);
    if (indicator) {
      indicator.destroy();
      this.indicators.delete(widgetId);
    }
  }

  /**
   * Get widget ID for tracking
   */
  getWidgetId(widget) {
    return widget.id || widget.dataset?.widgetId || `widget_${Date.now()}_${Math.random()}`;
  }

  /**
   * Update global options for all indicators
   */
  updateGlobalOptions(options) {
    this.globalOptions = { ...this.globalOptions, ...options };
    
    // Update all existing indicators
    this.indicators.forEach(indicator => {
      indicator.updateOptions(this.globalOptions);
    });
  }

  /**
   * Mark widget as updated
   */
  markWidgetUpdated(widget, timestamp = Date.now()) {
    const widgetId = this.getWidgetId(widget);
    const indicator = this.indicators.get(widgetId);
    
    if (indicator) {
      indicator.markAsUpdated(timestamp);
    }
  }

  /**
   * Show all indicators
   */
  showAll() {
    this.indicators.forEach(indicator => indicator.show());
  }

  /**
   * Hide all indicators
   */
  hideAll() {
    this.indicators.forEach(indicator => indicator.hide());
  }

  /**
   * Destroy all indicators
   */
  destroyAll() {
    this.indicators.forEach(indicator => indicator.destroy());
    this.indicators.clear();
  }
}

// Global instance
export const freshnessManager = new FreshnessManager(); 