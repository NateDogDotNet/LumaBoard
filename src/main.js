// Entry point for LumaBoard
import './styles/main.css';
import { loadConfig } from './configLoader.js';
import { SceneEngine } from './sceneEngine.js';
import { WidgetMount } from './widgetMount.js';
import { DebugOverlay } from './components/DebugOverlay.js';
import { SceneScheduler } from './components/SceneScheduler.js';
import { SceneTransitions } from './components/SceneTransitions.js';
import { OfflineFallback } from './components/OfflineFallback.js';
import { animationEngine } from './components/AnimationEngine.js';
import { ConfigManager } from './components/ConfigManager.js';
import { BurnInProtection } from './components/BurnInProtection.js';

// Import all widget components
import './components/ClockWidget.js';
import './components/WeatherWidget.js';
import './components/NewsTickerWidget.js';
import './components/StockTickerWidget.js';
import './components/YouTubeEmbedWidget.js';
import './components/ImageSlideshowWidget.js';
import './components/VideoPlayerWidget.js';
import './components/CalendarWidget.js';
import './components/CountdownWidget.js';
import './components/QRCodeWidget.js';
import './components/MapWidget.js';

/**
 * LumaBoard Main Application
 * Entry point for the digital signage platform
 */
class LumaBoard {
  constructor() {
    this.config = null;
    this.sceneEngine = null;
    this.debugOverlay = null;
    this.sceneScheduler = null;
    this.sceneTransitions = null;
    this.offlineFallback = null;
    this.animationEngine = null;
    this.configManager = null;
    this.burnInProtection = null;
    this.isInitialized = false;
    this.startTime = Date.now();
  }

  /**
   * Initialize the LumaBoard application
   */
  async init() {
    try {
      console.log('LumaBoard: Starting initialization...');
      
      // Load configuration
      await this.loadConfiguration();
      
      // Initialize scene engine
      this.initializeSceneEngine();
      
      // Start the application
      this.start();
      
      this.isInitialized = true;
      console.log('LumaBoard: Initialization complete');
      
    } catch (error) {
      console.error('LumaBoard: Initialization failed:', error);
      this.showErrorState(error);
    }
  }

  /**
   * Load application configuration
   */
  async loadConfiguration() {
    try {
      this.config = await loadConfig();
      console.log('LumaBoard: Configuration loaded successfully');
      console.log('LumaBoard: Scenes available:', this.config.scenes?.length || 0);
    } catch (error) {
      console.error('LumaBoard: Failed to load configuration:', error);
      // Use fallback configuration
      this.config = this.getFallbackConfig();
      console.log('LumaBoard: Using fallback configuration');
    }
  }

  /**
   * Initialize the scene engine
   */
  initializeSceneEngine() {
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container element not found');
    }

    // Create scene engine
    this.sceneEngine = new SceneEngine(appContainer);
    
    // Load scenes
    this.sceneEngine.loadScenes(this.config.scenes || []);
    
    console.log('LumaBoard: Scene engine initialized');
  }

  /**
   * Start the application
   */
  start() {
    if (!this.sceneEngine) {
      throw new Error('Scene engine not initialized');
    }

    // Render the first scene
    this.sceneEngine.renderCurrentScene();
    
    // Start scene rotation if configured and multiple scenes exist
    if (this.config.sceneRotation?.enabled && this.config.scenes?.length > 1) {
      const interval = this.config.sceneRotation.interval || 30;
      this.sceneEngine.startRotation(interval);
      console.log(`LumaBoard: Started scene rotation (${interval}s interval)`);
    }

    // Set up keyboard controls
    this.setupKeyboardControls();
    
    // Set up periodic refresh
    this.setupPeriodicRefresh();
    
    // Initialize debug overlay
    this.setupDebugOverlay();
    
    // Initialize scene scheduler
    this.setupSceneScheduler();
    
    // Initialize scene transitions
    this.setupSceneTransitions();
    
    // Initialize offline fallback
    this.setupOfflineFallback();
    
    // Initialize animation engine
    this.setupAnimationEngine();
    
    // Initialize config manager
    this.setupConfigManager();
    
    // Initialize burn-in protection
    this.setupBurnInProtection();
    
    console.log('LumaBoard: Application started successfully');
  }

  /**
   * Set up keyboard controls for navigation
   */
  setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
      if (!this.sceneEngine) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'n':
        case 'N':
          event.preventDefault();
          this.sceneEngine.nextScene();
          break;
          
        case 'ArrowLeft':
        case 'p':
        case 'P':
          event.preventDefault();
          this.sceneEngine.previousScene();
          break;
          
        case 'r':
        case 'R':
          event.preventDefault();
          this.sceneEngine.refreshCurrentScene();
          console.log('LumaBoard: Manual refresh triggered');
          break;
          
        case ' ':
          event.preventDefault();
          if (this.sceneEngine.isRotating) {
            this.sceneEngine.stopRotation();
            console.log('LumaBoard: Scene rotation paused');
          } else {
            const interval = this.config.sceneRotation?.interval || 30;
            this.sceneEngine.startRotation(interval);
            console.log('LumaBoard: Scene rotation resumed');
          }
          break;
          
        case 'Escape':
          event.preventDefault();
          this.showInfo();
          break;
      }
    });

    console.log('LumaBoard: Keyboard controls enabled');
    console.log('LumaBoard: Controls - Arrow keys: navigate, Space: pause/resume, R: refresh, Esc: info');
  }

  /**
   * Set up periodic refresh for widgets
   */
  setupPeriodicRefresh() {
    const refreshInterval = this.config.refreshInterval || 300; // 5 minutes default
    
    setInterval(() => {
      if (this.sceneEngine) {
        this.sceneEngine.refreshCurrentScene();
        console.log('LumaBoard: Periodic refresh executed');
      }
    }, refreshInterval * 1000);
    
    console.log(`LumaBoard: Periodic refresh enabled (${refreshInterval}s interval)`);
  }

  /**
   * Show application information overlay
   */
  showInfo() {
    if (!this.sceneEngine) return;
    
    const sceneInfo = this.sceneEngine.getCurrentSceneInfo();
    const info = {
      version: '1.0.0',
      currentScene: `${sceneInfo.index + 1}/${sceneInfo.total}`,
      sceneName: sceneInfo.scene?.name || 'Unknown',
      isRotating: sceneInfo.isRotating,
      configSource: this.config.source || 'Unknown',
      uptime: this.getUptime()
    };

    // Create info overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      z-index: 10000;
    `;

    overlay.innerHTML = `
      <div style="
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        max-width: 400px;
      ">
        <h2 style="margin: 0 0 1rem 0; font-size: 1.5rem;">📺 LumaBoard</h2>
        <div style="margin-bottom: 0.5rem;"><strong>Version:</strong> ${info.version}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Scene:</strong> ${info.currentScene}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Scene Name:</strong> ${info.sceneName}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Rotation:</strong> ${info.isRotating ? 'Active' : 'Paused'}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Config:</strong> ${info.configSource}</div>
        <div style="margin-bottom: 1rem;"><strong>Uptime:</strong> ${info.uptime}</div>
        <div style="font-size: 0.9rem; opacity: 0.8;">Press Esc to close</div>
      </div>
    `;

    // Close on click or Esc
    const closeOverlay = () => {
      document.body.removeChild(overlay);
      document.removeEventListener('keydown', handleKeydown);
    };

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeOverlay();
      }
    };

    overlay.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', handleKeydown);
    
    document.body.appendChild(overlay);
  }

  /**
   * Set up debug overlay
   */
  setupDebugOverlay() {
    this.debugOverlay = new DebugOverlay(this);
    console.log('LumaBoard: Debug overlay initialized (Ctrl+Shift+D to toggle)');
  }

  /**
   * Set up scene scheduler
   */
  setupSceneScheduler() {
    const schedulerConfig = this.config.scheduler || {};
    this.sceneScheduler = new SceneScheduler(this.sceneEngine, schedulerConfig);
    console.log('LumaBoard: Scene scheduler initialized');
  }

  /**
   * Set up scene transitions
   */
  setupSceneTransitions() {
    const appContainer = document.getElementById('app');
    const transitionConfig = this.config.transitions || {};
    this.sceneTransitions = new SceneTransitions(appContainer, transitionConfig);
    console.log('LumaBoard: Scene transitions initialized');
  }

  /**
   * Set up offline fallback
   */
  setupOfflineFallback() {
    const offlineConfig = this.config.offline || {};
    this.offlineFallback = new OfflineFallback(offlineConfig);
    this.offlineFallback.setSceneEngine(this.sceneEngine);
    console.log('LumaBoard: Offline fallback initialized');
  }

  /**
   * Set up animation engine
   */
  setupAnimationEngine() {
    this.animationEngine = animationEngine;
    
    // Apply global animation options from config
    if (this.config.animations) {
      this.animationEngine.updateGlobalOptions(this.config.animations.global || {});
    }
    
    console.log('LumaBoard: Animation engine initialized');
  }

  /**
   * Set up config manager
   */
  setupConfigManager() {
    this.configManager = new ConfigManager(this);
    console.log('LumaBoard: Config manager initialized (Ctrl+Shift+C to toggle)');
  }

  /**
   * Set up burn-in protection
   */
  setupBurnInProtection() {
    const burnInConfig = this.config.burnInProtection || {};
    this.burnInProtection = new BurnInProtection(this);
    
    if (burnInConfig) {
      this.burnInProtection.updateConfig(burnInConfig);
    }
    
    console.log('LumaBoard: Burn-in protection initialized');
  }

  /**
   * Get application uptime
   * @returns {string} Formatted uptime
   */
  getUptime() {
    if (!this.startTime) {
      this.startTime = Date.now();
    }
    
    const uptime = Date.now() - this.startTime;
    const minutes = Math.floor(uptime / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  }

  /**
   * Get fallback configuration when loading fails
   * @returns {Object} Fallback configuration
   */
  getFallbackConfig() {
    return {
      source: 'fallback',
      scenes: [
        {
          name: 'Default Scene',
          layout: '2x2',
          widgets: [
            { type: 'clock', position: 0, config: { format: '12', showDate: true } },
            { type: 'weather', position: 1, config: { location: 'Minneapolis' } },
            { type: 'news', position: 2, config: {} },
            { type: 'calendar', position: 3, config: {} }
          ]
        }
      ],
      sceneRotation: {
        enabled: false,
        interval: 30
      },
      refreshInterval: 300
    };
  }

  /**
   * Show error state when initialization fails
   * @param {Error} error - Error that occurred
   */
  showErrorState(error) {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    appContainer.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        color: white;
        text-align: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        padding: 2rem;
        box-sizing: border-box;
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">LumaBoard Initialization Failed</div>
        <div style="font-size: 1rem; margin-bottom: 1rem; max-width: 600px; word-break: break-word;">
          ${error.message}
        </div>
        <div style="font-size: 0.9rem; opacity: 0.8;">
          Please check the configuration and reload the page
        </div>
      </div>
    `;
  }

  /**
   * Destroy the application and cleanup resources
   */
  destroy() {
    if (this.burnInProtection) {
      this.burnInProtection.destroy();
      this.burnInProtection = null;
    }
    
    if (this.configManager) {
      this.configManager.destroy();
      this.configManager = null;
    }
    
    if (this.animationEngine) {
      this.animationEngine.destroy();
      this.animationEngine = null;
    }
    
    if (this.offlineFallback) {
      this.offlineFallback.destroy();
      this.offlineFallback = null;
    }
    
    if (this.sceneTransitions) {
      this.sceneTransitions.destroy();
      this.sceneTransitions = null;
    }
    
    if (this.sceneScheduler) {
      this.sceneScheduler.destroy();
      this.sceneScheduler = null;
    }
    
    if (this.debugOverlay) {
      this.debugOverlay.destroy();
      this.debugOverlay = null;
    }
    
    if (this.sceneEngine) {
      this.sceneEngine.destroy();
      this.sceneEngine = null;
    }
    
    this.config = null;
    this.isInitialized = false;
    
    console.log('LumaBoard: Application destroyed');
  }
}

// Create and initialize the application
const lumaBoard = new LumaBoard();

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    lumaBoard.init();
  });
} else {
  lumaBoard.init();
}

// Make lumaBoard available globally for debugging
window.lumaBoard = lumaBoard;

// Handle page unload
window.addEventListener('beforeunload', () => {
  lumaBoard.destroy();
}); 