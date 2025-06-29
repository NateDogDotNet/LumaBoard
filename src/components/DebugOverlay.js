/**
 * Debug Overlay Component for LumaBoard
 * Provides system diagnostics, widget status, and developer tools
 */
export class DebugOverlay {
  constructor(lumaBoard) {
    this.lumaBoard = lumaBoard;
    this.isVisible = false;
    this.overlay = null;
    this.refreshInterval = null;
    this.startTime = Date.now();
    
    // Bind methods
    this.toggle = this.toggle.bind(this);
    this.hide = this.hide.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.refreshData = this.refreshData.bind(this);
    
    // Set up keyboard listeners
    this.setupKeyboardListeners();
  }

  /**
   * Set up keyboard listeners for debug overlay
   */
  setupKeyboardListeners() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  /**
   * Handle keyboard events
   */
  handleKeydown(event) {
    // Ctrl+Shift+D to toggle debug overlay
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      this.toggle();
    }
    
    // Escape to close if visible
    if (event.key === 'Escape' && this.isVisible) {
      event.preventDefault();
      this.hide();
    }
  }

  /**
   * Toggle debug overlay visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Show debug overlay
   */
  show() {
    if (this.isVisible) return;
    
    this.isVisible = true;
    this.createOverlay();
    this.startRefreshTimer();
    
    console.log('DebugOverlay: Opened');
  }

  /**
   * Hide debug overlay
   */
  hide() {
    if (!this.isVisible) return;
    
    this.isVisible = false;
    this.stopRefreshTimer();
    
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    
    this.overlay = null;
    console.log('DebugOverlay: Closed');
  }

  /**
   * Create the debug overlay DOM structure
   */
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'debug-overlay';
    this.overlay.innerHTML = this.getOverlayHTML();
    
    // Add event listeners
    this.setupOverlayEvents();
    
    // Append to body
    document.body.appendChild(this.overlay);
    
    // Initial data refresh
    this.refreshData();
  }

  /**
   * Set up overlay event listeners
   */
  setupOverlayEvents() {
    // Close button
    const closeBtn = this.overlay.querySelector('.debug-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', this.hide);
    }
    
    // Refresh button
    const refreshBtn = this.overlay.querySelector('.debug-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshData();
        if (this.lumaBoard.sceneEngine) {
          this.lumaBoard.sceneEngine.refreshCurrentScene();
        }
      });
    }
    
    // Scene navigation buttons
    const prevBtn = this.overlay.querySelector('.debug-prev-scene');
    const nextBtn = this.overlay.querySelector('.debug-next-scene');
    
    if (prevBtn && this.lumaBoard.sceneEngine) {
      prevBtn.addEventListener('click', () => {
        this.lumaBoard.sceneEngine.previousScene();
        setTimeout(() => this.refreshData(), 100);
      });
    }
    
    if (nextBtn && this.lumaBoard.sceneEngine) {
      nextBtn.addEventListener('click', () => {
        this.lumaBoard.sceneEngine.nextScene();
        setTimeout(() => this.refreshData(), 100);
      });
    }
    
    // Click outside to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
  }

  /**
   * Get the HTML structure for the overlay
   */
  getOverlayHTML() {
    return `
      <div class="debug-panel">
        <div class="debug-header">
          <h2>🔧 LumaBoard Debug Console</h2>
          <div class="debug-controls">
            <button class="debug-refresh" title="Refresh Data">🔄</button>
            <button class="debug-close" title="Close (Esc)">✕</button>
          </div>
        </div>
        
        <div class="debug-content">
          <div class="debug-section">
            <h3>📊 System Status</h3>
            <div class="debug-grid" id="system-status">
              <div class="debug-item">
                <span class="debug-label">Uptime:</span>
                <span class="debug-value" id="system-uptime">--</span>
              </div>
              <div class="debug-item">
                <span class="debug-label">Memory:</span>
                <span class="debug-value" id="system-memory">--</span>
              </div>
              <div class="debug-item">
                <span class="debug-label">Performance:</span>
                <span class="debug-value" id="system-performance">--</span>
              </div>
              <div class="debug-item">
                <span class="debug-label">Network:</span>
                <span class="debug-value" id="system-network">--</span>
              </div>
            </div>
          </div>
          
          <div class="debug-section">
            <h3>🎬 Scene Information</h3>
            <div class="debug-grid" id="scene-info">
              <div class="debug-item">
                <span class="debug-label">Current Scene:</span>
                <span class="debug-value" id="current-scene">--</span>
              </div>
              <div class="debug-item">
                <span class="debug-label">Total Scenes:</span>
                <span class="debug-value" id="total-scenes">--</span>
              </div>
              <div class="debug-item">
                <span class="debug-label">Rotation:</span>
                <span class="debug-value" id="scene-rotation">--</span>
              </div>
              <div class="debug-item">
                <span class="debug-label">Layout:</span>
                <span class="debug-value" id="scene-layout">--</span>
              </div>
            </div>
            <div class="debug-scene-controls">
              <button class="debug-prev-scene">← Previous Scene</button>
              <button class="debug-next-scene">Next Scene →</button>
            </div>
          </div>
          
          <div class="debug-section">
            <h3>🧩 Widget Status</h3>
            <div id="widget-status">
              <div class="debug-loading">Loading widget information...</div>
            </div>
          </div>
          
          <div class="debug-section">
            <h3>⚙️ Configuration</h3>
            <div class="debug-config" id="config-info">
              <div class="debug-item">
                <span class="debug-label">Config Source:</span>
                <span class="debug-value" id="config-source">--</span>
              </div>
              <div class="debug-item">
                <span class="debug-label">Theme:</span>
                <span class="debug-value" id="config-theme">--</span>
              </div>
              <div class="debug-item">
                <span class="debug-label">Refresh Interval:</span>
                <span class="debug-value" id="config-refresh">--</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="debug-footer">
          <div class="debug-shortcuts">
            <strong>Shortcuts:</strong> Ctrl+Shift+D (Toggle) | Esc (Close) | R (Refresh Scene)
          </div>
        </div>
      </div>
      
      <style>
        .debug-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', monospace, sans-serif;
          color: #fff;
        }
        
        .debug-panel {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          border-radius: 12px;
          border: 2px solid #3498db;
          max-width: 90vw;
          max-height: 90vh;
          width: 800px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .debug-header {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #34495e;
        }
        
        .debug-header h2 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .debug-controls {
          display: flex;
          gap: 0.5rem;
        }
        
        .debug-controls button {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: white;
          padding: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        
        .debug-controls button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }
        
        .debug-content {
          padding: 1rem;
          max-height: 60vh;
          overflow-y: auto;
        }
        
        .debug-section {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .debug-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #3498db;
          border-bottom: 1px solid rgba(52, 152, 219, 0.3);
          padding-bottom: 0.5rem;
        }
        
        .debug-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        
        .debug-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          font-size: 0.9rem;
        }
        
        .debug-label {
          font-weight: 600;
          color: #bdc3c7;
        }
        
        .debug-value {
          color: #ecf0f1;
          font-family: monospace;
        }
        
        .debug-scene-controls {
          margin-top: 1rem;
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }
        
        .debug-scene-controls button {
          background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
          border: none;
          border-radius: 6px;
          color: white;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        
        .debug-scene-controls button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .widget-list {
          display: grid;
          gap: 0.5rem;
        }
        
        .widget-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          border-left: 3px solid #3498db;
        }
        
        .widget-info {
          flex: 1;
        }
        
        .widget-name {
          font-weight: 600;
          color: #ecf0f1;
        }
        
        .widget-details {
          font-size: 0.8rem;
          color: #bdc3c7;
          margin-top: 0.2rem;
        }
        
        .widget-refresh-btn {
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          border: none;
          border-radius: 4px;
          color: white;
          padding: 0.3rem 0.6rem;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }
        
        .widget-refresh-btn:hover {
          transform: scale(1.05);
        }
        
        .debug-footer {
          background: rgba(0, 0, 0, 0.3);
          padding: 0.8rem 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.8rem;
          color: #bdc3c7;
        }
        
        .debug-loading {
          text-align: center;
          color: #bdc3c7;
          font-style: italic;
        }
        
        .status-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 0.5rem;
        }
        
        .status-online { background: #27ae60; }
        .status-offline { background: #e74c3c; }
        .status-warning { background: #f39c12; }
      </style>
    `;
  }

  /**
   * Start the refresh timer
   */
  startRefreshTimer() {
    this.refreshInterval = setInterval(this.refreshData, 2000); // Refresh every 2 seconds
  }

  /**
   * Stop the refresh timer
   */
  stopRefreshTimer() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Refresh all debug data
   */
  refreshData() {
    if (!this.isVisible || !this.overlay) return;
    
    this.updateSystemStatus();
    this.updateSceneInfo();
    this.updateWidgetStatus();
    this.updateConfigInfo();
  }

  /**
   * Update system status information
   */
  updateSystemStatus() {
    const uptime = this.formatUptime(Date.now() - this.startTime);
    const memory = this.getMemoryInfo();
    const performance = this.getPerformanceInfo();
    const network = navigator.onLine ? 'Online' : 'Offline';
    
    this.updateElement('system-uptime', uptime);
    this.updateElement('system-memory', memory);
    this.updateElement('system-performance', performance);
    this.updateElement('system-network', `<span class="status-indicator status-${navigator.onLine ? 'online' : 'offline'}"></span>${network}`);
  }

  /**
   * Update scene information
   */
  updateSceneInfo() {
    if (!this.lumaBoard.sceneEngine) return;
    
    const sceneInfo = this.lumaBoard.sceneEngine.getCurrentSceneInfo();
    const currentScene = `${sceneInfo.index + 1}/${sceneInfo.total}`;
    const sceneName = sceneInfo.scene?.name || 'Unknown';
    const rotation = sceneInfo.isRotating ? 'Active' : 'Paused';
    const layout = sceneInfo.scene?.layout || 'Default';
    
    this.updateElement('current-scene', `${currentScene} (${sceneName})`);
    this.updateElement('total-scenes', sceneInfo.total.toString());
    this.updateElement('scene-rotation', `<span class="status-indicator status-${sceneInfo.isRotating ? 'online' : 'warning'}"></span>${rotation}`);
    this.updateElement('scene-layout', layout);
  }

  /**
   * Update widget status information
   */
  updateWidgetStatus() {
    const widgetContainer = this.overlay.querySelector('#widget-status');
    if (!widgetContainer || !this.lumaBoard.sceneEngine?.widgetMount) {
      return;
    }
    
    const widgets = this.lumaBoard.sceneEngine.widgetMount.getAllWidgets();
    
    if (widgets.size === 0) {
      widgetContainer.innerHTML = '<div class="debug-loading">No widgets currently mounted</div>';
      return;
    }
    
    const widgetHTML = Array.from(widgets.entries()).map(([id, widget]) => {
      const lastRefresh = widget.element?.lastUpdate ? 
        new Date(widget.element.lastUpdate).toLocaleTimeString() : 'Never';
      
      return `
        <div class="widget-item">
          <div class="widget-info">
            <div class="widget-name">${widget.type} (${id.split('-')[0]})</div>
            <div class="widget-details">
              Last Update: ${lastRefresh} | 
              Config: ${Object.keys(widget.config || {}).length} properties
            </div>
          </div>
          <button class="widget-refresh-btn" data-widget-id="${id}">Refresh</button>
        </div>
      `;
    }).join('');
    
    widgetContainer.innerHTML = `<div class="widget-list">${widgetHTML}</div>`;
    
    // Re-attach event listeners for new buttons
    const refreshBtns = widgetContainer.querySelectorAll('.widget-refresh-btn');
    refreshBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const widgetId = e.target.dataset.widgetId;
        if (widgetId && this.lumaBoard.sceneEngine.widgetMount) {
          this.lumaBoard.sceneEngine.widgetMount.refreshWidget(widgetId);
          setTimeout(() => this.refreshData(), 100);
        }
      });
    });
  }

  /**
   * Update configuration information
   */
  updateConfigInfo() {
    const config = this.lumaBoard.config;
    if (!config) return;
    
    const source = config.source || 'Unknown';
    const theme = config.theme?.primaryColor || 'Default';
    const refreshInterval = `${config.refreshInterval || 300}s`;
    
    this.updateElement('config-source', source);
    this.updateElement('config-theme', theme);
    this.updateElement('config-refresh', refreshInterval);
  }

  /**
   * Update a DOM element's innerHTML
   */
  updateElement(id, content) {
    const element = this.overlay.querySelector(`#${id}`);
    if (element) {
      element.innerHTML = content;
    }
  }

  /**
   * Format uptime duration
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Get memory information
   */
  getMemoryInfo() {
    if (performance.memory) {
      const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
      return `${used}MB / ${total}MB`;
    }
    return 'Not available';
  }

  /**
   * Get performance information
   */
  getPerformanceInfo() {
    const timing = performance.timing;
    if (timing && timing.loadEventEnd && timing.navigationStart) {
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      return `Load: ${loadTime}ms`;
    }
    return 'Good';
  }

  /**
   * Destroy the debug overlay
   */
  destroy() {
    this.hide();
    document.removeEventListener('keydown', this.handleKeydown);
  }
} 