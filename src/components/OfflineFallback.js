/**
 * Offline Fallback System for LumaBoard
 * Provides alternative content when network is unavailable
 */
export class OfflineFallback {
  constructor(options = {}) {
    this.options = {
      enabled: options.enabled !== false,
      checkInterval: options.checkInterval || 30000, // 30 seconds
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 5000, // 5 seconds
      fallbackScenes: options.fallbackScenes || [],
      cacheStrategy: options.cacheStrategy || 'aggressive', // 'aggressive', 'conservative', 'minimal'
      ...options
    };
    
    this.isOnline = navigator.onLine;
    this.wasOffline = false;
    this.checkTimer = null;
    this.retryTimer = null;
    this.retryCount = 0;
    this.fallbackActive = false;
    this.originalScenes = null;
    this.sceneEngine = null;
    
    this.init();
  }

  /**
   * Initialize the offline fallback system
   */
  init() {
    if (!this.options.enabled) {
      console.log('OfflineFallback: Disabled');
      return;
    }
    
    this.setupEventListeners();
    this.startConnectivityCheck();
    this.initializeCache();
    
    console.log('OfflineFallback: Initialized');
  }

  /**
   * Set the scene engine reference
   */
  setSceneEngine(sceneEngine) {
    this.sceneEngine = sceneEngine;
  }

  /**
   * Setup event listeners for connectivity changes
   */
  setupEventListeners() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Listen for failed network requests
    window.addEventListener('unhandledrejection', this.handleNetworkError.bind(this));
  }

  /**
   * Handle online event
   */
  handleOnline() {
    console.log('OfflineFallback: Network connection restored');
    this.isOnline = true;
    this.retryCount = 0;
    
    if (this.fallbackActive) {
      this.restoreOnlineMode();
    }
    
    this.emitConnectivityChange('online');
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    console.log('OfflineFallback: Network connection lost');
    this.isOnline = false;
    this.wasOffline = true;
    
    this.activateFallbackMode();
    this.emitConnectivityChange('offline');
  }

  /**
   * Handle network errors
   */
  handleNetworkError(event) {
    if (event.reason && event.reason.name === 'TypeError' && 
        event.reason.message.includes('fetch')) {
      console.log('OfflineFallback: Network request failed, checking connectivity');
      this.checkConnectivity();
    }
  }

  /**
   * Start periodic connectivity checking
   */
  startConnectivityCheck() {
    this.checkTimer = setInterval(() => {
      this.checkConnectivity();
    }, this.options.checkInterval);
  }

  /**
   * Stop connectivity checking
   */
  stopConnectivityCheck() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }

  /**
   * Check network connectivity
   */
  async checkConnectivity() {
    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        timeout: 5000
      });
      
      const wasOnline = this.isOnline;
      this.isOnline = response.ok;
      
      if (!wasOnline && this.isOnline) {
        this.handleOnline();
      } else if (wasOnline && !this.isOnline) {
        this.handleOffline();
      }
      
    } catch (error) {
      const wasOnline = this.isOnline;
      this.isOnline = false;
      
      if (wasOnline) {
        this.handleOffline();
      }
    }
  }

  /**
   * Activate fallback mode
   */
  activateFallbackMode() {
    if (this.fallbackActive) return;
    
    console.log('OfflineFallback: Activating fallback mode');
    this.fallbackActive = true;
    
    // Store original scenes
    if (this.sceneEngine && this.sceneEngine.scenes) {
      this.originalScenes = [...this.sceneEngine.scenes];
    }
    
    // Load fallback scenes
    this.loadFallbackScenes();
    
    // Show offline indicator
    this.showOfflineIndicator();
    
    // Start retry mechanism
    this.startRetryMechanism();
  }

  /**
   * Restore online mode
   */
  restoreOnlineMode() {
    if (!this.fallbackActive) return;
    
    console.log('OfflineFallback: Restoring online mode');
    this.fallbackActive = false;
    
    // Hide offline indicator
    this.hideOfflineIndicator();
    
    // Stop retry mechanism
    this.stopRetryMechanism();
    
    // Restore original scenes
    this.restoreOriginalScenes();
    
    // Refresh all widgets to get fresh data
    this.refreshAllWidgets();
  }

  /**
   * Load fallback scenes
   */
  loadFallbackScenes() {
    if (!this.sceneEngine) return;
    
    let fallbackScenes = this.options.fallbackScenes;
    
    // If no custom fallback scenes, create default ones
    if (!fallbackScenes || fallbackScenes.length === 0) {
      fallbackScenes = this.createDefaultFallbackScenes();
    }
    
    // Load cached content into fallback scenes
    fallbackScenes = this.enhanceFallbackScenesWithCache(fallbackScenes);
    
    this.sceneEngine.loadScenes(fallbackScenes);
    this.sceneEngine.renderCurrentScene();
  }

  /**
   * Create default fallback scenes
   */
  createDefaultFallbackScenes() {
    return [
      {
        name: 'Offline Mode',
        layout: '2x2',
        widgets: [
          { 
            type: 'clock', 
            position: 0, 
            config: { 
              format: '12', 
              showDate: true,
              offline: true 
            } 
          },
          { 
            type: 'weather', 
            position: 1, 
            config: { 
              offline: true,
              useCache: true 
            } 
          },
          { 
            type: 'news', 
            position: 2, 
            config: { 
              offline: true,
              useCache: true 
            } 
          },
          { 
            type: 'calendar', 
            position: 3, 
            config: { 
              offline: true 
            } 
          }
        ],
        background: {
          type: 'gradient',
          value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
      }
    ];
  }

  /**
   * Enhance fallback scenes with cached content
   */
  enhanceFallbackScenesWithCache(scenes) {
    return scenes.map(scene => ({
      ...scene,
      widgets: scene.widgets.map(widget => ({
        ...widget,
        config: {
          ...widget.config,
          offline: true,
          useCache: true,
          cachedData: this.getCachedData(widget.type)
        }
      }))
    }));
  }

  /**
   * Get cached data for a widget type
   */
  getCachedData(widgetType) {
    try {
      const cacheKey = `${widgetType}_cache`;
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn(`OfflineFallback: Failed to retrieve cache for ${widgetType}`);
      return null;
    }
  }

  /**
   * Restore original scenes
   */
  restoreOriginalScenes() {
    if (!this.sceneEngine || !this.originalScenes) return;
    
    this.sceneEngine.loadScenes(this.originalScenes);
    this.sceneEngine.renderCurrentScene();
    this.originalScenes = null;
  }

  /**
   * Show offline indicator
   */
  showOfflineIndicator() {
    // Remove existing indicator
    this.hideOfflineIndicator();
    
    const indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.innerHTML = `
      <div class="offline-indicator-content">
        <span class="offline-icon">📡</span>
        <span class="offline-text">Offline Mode</span>
        <span class="offline-status">Showing cached content</span>
      </div>
    `;
    
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      animation: slideInRight 0.5s ease-out;
    `;
    
    // Add animation styles
    if (!document.querySelector('#offline-indicator-styles')) {
      const style = document.createElement('style');
      style.id = 'offline-indicator-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        
        .offline-indicator-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .offline-icon {
          font-size: 16px;
        }
        
        .offline-text {
          font-weight: 600;
        }
        
        .offline-status {
          font-size: 12px;
          opacity: 0.9;
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(indicator);
  }

  /**
   * Hide offline indicator
   */
  hideOfflineIndicator() {
    const indicator = document.querySelector('#offline-indicator');
    if (indicator) {
      indicator.style.animation = 'slideOutRight 0.5s ease-out';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 500);
    }
  }

  /**
   * Start retry mechanism
   */
  startRetryMechanism() {
    if (this.retryTimer) return;
    
    this.retryTimer = setInterval(() => {
      if (this.retryCount < this.options.retryAttempts) {
        this.retryCount++;
        console.log(`OfflineFallback: Retry attempt ${this.retryCount}/${this.options.retryAttempts}`);
        this.checkConnectivity();
      }
    }, this.options.retryDelay);
  }

  /**
   * Stop retry mechanism
   */
  stopRetryMechanism() {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
    this.retryCount = 0;
  }

  /**
   * Refresh all widgets
   */
  refreshAllWidgets() {
    if (this.sceneEngine && this.sceneEngine.widgetMount) {
      this.sceneEngine.widgetMount.refreshAllWidgets();
    }
  }

  /**
   * Initialize cache for offline content
   */
  initializeCache() {
    // Set up cache policies based on strategy
    switch (this.options.cacheStrategy) {
      case 'aggressive':
        this.setupAggressiveCache();
        break;
      case 'conservative':
        this.setupConservativeCache();
        break;
      case 'minimal':
        this.setupMinimalCache();
        break;
    }
  }

  /**
   * Setup aggressive caching (cache everything)
   */
  setupAggressiveCache() {
    // Cache all widget data, images, and content
    this.cacheWidgetData = true;
    this.cacheImages = true;
    this.cacheContent = true;
    this.maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Setup conservative caching (cache essential data only)
   */
  setupConservativeCache() {
    // Cache only essential widget data
    this.cacheWidgetData = true;
    this.cacheImages = false;
    this.cacheContent = false;
    this.maxCacheAge = 6 * 60 * 60 * 1000; // 6 hours
  }

  /**
   * Setup minimal caching (cache very little)
   */
  setupMinimalCache() {
    // Cache only critical data
    this.cacheWidgetData = false;
    this.cacheImages = false;
    this.cacheContent = false;
    this.maxCacheAge = 1 * 60 * 60 * 1000; // 1 hour
  }

  /**
   * Cache widget data
   */
  cacheData(widgetType, data) {
    if (!this.cacheWidgetData) return;
    
    try {
      const cacheEntry = {
        data: data,
        timestamp: Date.now(),
        type: widgetType
      };
      
      const cacheKey = `${widgetType}_cache`;
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      
      console.log(`OfflineFallback: Cached data for ${widgetType}`);
    } catch (error) {
      console.warn(`OfflineFallback: Failed to cache data for ${widgetType}:`, error);
    }
  }

  /**
   * Get connectivity status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      fallbackActive: this.fallbackActive,
      retryCount: this.retryCount,
      maxRetries: this.options.retryAttempts,
      cacheStrategy: this.options.cacheStrategy,
      wasOffline: this.wasOffline
    };
  }

  /**
   * Emit connectivity change event
   */
  emitConnectivityChange(status) {
    const event = new CustomEvent('connectivitychange', {
      detail: {
        status: status,
        isOnline: this.isOnline,
        fallbackActive: this.fallbackActive,
        timestamp: Date.now()
      }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Manually trigger offline mode (for testing)
   */
  simulateOffline() {
    console.log('OfflineFallback: Simulating offline mode');
    this.isOnline = false;
    this.handleOffline();
  }

  /**
   * Manually trigger online mode (for testing)
   */
  simulateOnline() {
    console.log('OfflineFallback: Simulating online mode');
    this.isOnline = true;
    this.handleOnline();
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.endsWith('_cache'));
    
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`OfflineFallback: Cleared ${cacheKeys.length} cache entries`);
  }

  /**
   * Update options
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    if (!this.options.enabled && this.fallbackActive) {
      this.restoreOnlineMode();
    }
  }

  /**
   * Destroy the offline fallback system
   */
  destroy() {
    this.stopConnectivityCheck();
    this.stopRetryMechanism();
    this.hideOfflineIndicator();
    
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    window.removeEventListener('unhandledrejection', this.handleNetworkError);
    
    this.sceneEngine = null;
    this.originalScenes = null;
    
    console.log('OfflineFallback: Destroyed');
  }
} 