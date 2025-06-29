/**
 * Configuration Manager for LumaBoard
 * Provides UI for importing, exporting, and editing configurations
 */
export class ConfigManager {
  constructor(lumaBoard) {
    this.lumaBoard = lumaBoard;
    this.isVisible = false;
    this.overlay = null;
    this.currentConfig = null;
    this.configHistory = [];
    this.maxHistorySize = 10;
    
    this.init();
  }

  /**
   * Initialize the config manager
   */
  init() {
    this.setupKeyboardListeners();
    this.loadConfigHistory();
    console.log('ConfigManager: Initialized');
  }

  /**
   * Setup keyboard listeners
   */
  setupKeyboardListeners() {
    document.addEventListener('keydown', (event) => {
      // Ctrl+Shift+C to toggle config manager
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        this.toggle();
      }
      
      // Escape to close if visible
      if (event.key === 'Escape' && this.isVisible) {
        event.preventDefault();
        this.hide();
      }
    });
  }

  /**
   * Toggle config manager visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Show config manager
   */
  show() {
    if (this.isVisible) return;
    
    this.isVisible = true;
    this.currentConfig = this.lumaBoard.config;
    this.createOverlay();
    
    console.log('ConfigManager: Opened');
  }

  /**
   * Hide config manager
   */
  hide() {
    if (!this.isVisible) return;
    
    this.isVisible = false;
    
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    
    this.overlay = null;
    console.log('ConfigManager: Closed');
  }

  /**
   * Create the config manager overlay
   */
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'config-manager-overlay';
    this.overlay.innerHTML = this.getOverlayHTML();
    
    this.setupOverlayEvents();
    document.body.appendChild(this.overlay);
    
    // Load current config into editor
    this.loadConfigIntoEditor();
  }

  /**
   * Get the HTML structure for the overlay
   */
  getOverlayHTML() {
    return `
      <div class="config-manager-panel">
        <div class="config-header">
          <h2>⚙️ Configuration Manager</h2>
          <div class="config-controls">
            <button class="config-btn config-validate" title="Validate Config">✓</button>
            <button class="config-btn config-close" title="Close (Esc)">✕</button>
          </div>
        </div>
        
        <div class="config-content">
          <div class="config-sidebar">
            <div class="config-section">
              <h3>📁 Quick Actions</h3>
              <button class="config-action-btn" data-action="import">📥 Import Config</button>
              <button class="config-action-btn" data-action="export">📤 Export Config</button>
              <button class="config-action-btn" data-action="reset">🔄 Reset to Default</button>
              <button class="config-action-btn" data-action="save">💾 Save Current</button>
            </div>
            
            <div class="config-section">
              <h3>📚 Presets</h3>
              <div class="config-presets">
                <button class="preset-btn" data-preset="minimal">Minimal</button>
                <button class="preset-btn" data-preset="standard">Standard</button>
                <button class="preset-btn" data-preset="advanced">Advanced</button>
                <button class="preset-btn" data-preset="demo">Demo</button>
              </div>
            </div>
            
            <div class="config-section">
              <h3>🕒 History</h3>
              <div class="config-history" id="config-history">
                <div class="history-loading">Loading history...</div>
              </div>
            </div>
            
            <div class="config-section">
              <h3>📊 Validation</h3>
              <div class="validation-status" id="validation-status">
                <div class="validation-pending">Click validate to check config</div>
              </div>
            </div>
          </div>
          
          <div class="config-main">
            <div class="config-editor-header">
              <h3>📝 Configuration Editor</h3>
              <div class="editor-controls">
                <button class="editor-btn" data-action="format">🎨 Format</button>
                <button class="editor-btn" data-action="minify">📦 Minify</button>
                <button class="editor-btn" data-action="copy">📋 Copy</button>
              </div>
            </div>
            
            <div class="config-editor-container">
              <textarea id="config-editor" class="config-editor" placeholder="Loading configuration..."></textarea>
              <div class="editor-info">
                <span class="line-count">Lines: <span id="line-count">0</span></span>
                <span class="char-count">Characters: <span id="char-count">0</span></span>
                <span class="size-info">Size: <span id="size-info">0 KB</span></span>
              </div>
            </div>
            
            <div class="config-actions">
              <button class="config-apply-btn">🚀 Apply Configuration</button>
              <button class="config-preview-btn">👁️ Preview Changes</button>
            </div>
          </div>
        </div>
        
        <div class="config-footer">
          <div class="config-tips">
            <strong>Tips:</strong> Ctrl+Shift+C (Toggle) | JSON format required | Backup before major changes
          </div>
        </div>
      </div>
      
      <style>
        .config-manager-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', monospace, sans-serif;
          color: #fff;
        }
        
        .config-manager-panel {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          border-radius: 12px;
          border: 2px solid #3498db;
          max-width: 95vw;
          max-height: 95vh;
          width: 1200px;
          height: 800px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
        }
        
        .config-header {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #34495e;
        }
        
        .config-header h2 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .config-controls {
          display: flex;
          gap: 0.5rem;
        }
        
        .config-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: white;
          padding: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        
        .config-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }
        
        .config-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .config-sidebar {
          width: 250px;
          background: rgba(0, 0, 0, 0.2);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem;
          overflow-y: auto;
        }
        
        .config-main {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
        }
        
        .config-section {
          margin-bottom: 1.5rem;
        }
        
        .config-section h3 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #3498db;
          border-bottom: 1px solid rgba(52, 152, 219, 0.3);
          padding-bottom: 0.3rem;
        }
        
        .config-action-btn, .preset-btn {
          display: block;
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: white;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
          text-align: left;
        }
        
        .config-action-btn:hover, .preset-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(2px);
        }
        
        .config-presets {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.3rem;
        }
        
        .preset-btn {
          text-align: center;
          font-size: 0.7rem;
        }
        
        .config-history {
          max-height: 150px;
          overflow-y: auto;
        }
        
        .history-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          padding: 0.3rem;
          margin-bottom: 0.3rem;
          cursor: pointer;
          font-size: 0.7rem;
          transition: all 0.2s ease;
        }
        
        .history-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .validation-status {
          font-size: 0.8rem;
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .validation-pending {
          color: #bdc3c7;
        }
        
        .validation-success {
          background: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
          border-color: #2ecc71;
        }
        
        .validation-error {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
          border-color: #e74c3c;
        }
        
        .config-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .config-editor-header h3 {
          margin: 0;
          font-size: 1rem;
          color: #3498db;
        }
        
        .editor-controls {
          display: flex;
          gap: 0.3rem;
        }
        
        .editor-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          color: white;
          padding: 0.3rem 0.6rem;
          cursor: pointer;
          font-size: 0.7rem;
          transition: all 0.2s ease;
        }
        
        .editor-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .config-editor-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
        }
        
        .config-editor {
          flex: 1;
          background: #1e1e1e;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: #fff;
          padding: 1rem;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.9rem;
          line-height: 1.4;
          resize: none;
          outline: none;
          white-space: pre;
          overflow-wrap: normal;
          overflow-x: auto;
        }
        
        .config-editor:focus {
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
        }
        
        .editor-info {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 0 0 6px 6px;
          font-size: 0.7rem;
          color: #bdc3c7;
        }
        
        .config-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        .config-apply-btn, .config-preview-btn {
          background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
          border: none;
          border-radius: 6px;
          color: white;
          padding: 0.8rem 1.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .config-preview-btn {
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
        }
        
        .config-apply-btn:hover, .config-preview-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .config-footer {
          background: rgba(0, 0, 0, 0.3);
          padding: 0.8rem 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.8rem;
          color: #bdc3c7;
        }
        
        .history-loading, .validation-pending {
          text-align: center;
          color: #bdc3c7;
          font-style: italic;
          font-size: 0.7rem;
        }
      </style>
    `;
  }

  /**
   * Setup overlay event listeners
   */
  setupOverlayEvents() {
    // Close button
    const closeBtn = this.overlay.querySelector('.config-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', this.hide.bind(this));
    }
    
    // Action buttons
    const actionBtns = this.overlay.querySelectorAll('.config-action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleAction(action);
      });
    });
    
    // Preset buttons
    const presetBtns = this.overlay.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.target.dataset.preset;
        this.loadPreset(preset);
      });
    });
    
    // Editor buttons
    const editorBtns = this.overlay.querySelectorAll('.editor-btn');
    editorBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleEditorAction(action);
      });
    });
    
    // Apply and preview buttons
    const applyBtn = this.overlay.querySelector('.config-apply-btn');
    const previewBtn = this.overlay.querySelector('.config-preview-btn');
    
    if (applyBtn) {
      applyBtn.addEventListener('click', this.applyConfiguration.bind(this));
    }
    
    if (previewBtn) {
      previewBtn.addEventListener('click', this.previewConfiguration.bind(this));
    }
    
    // Validate button
    const validateBtn = this.overlay.querySelector('.config-validate');
    if (validateBtn) {
      validateBtn.addEventListener('click', this.validateConfiguration.bind(this));
    }
    
    // Editor events
    const editor = this.overlay.querySelector('#config-editor');
    if (editor) {
      editor.addEventListener('input', this.updateEditorInfo.bind(this));
    }
    
    // Click outside to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
    
    // Load history
    this.loadHistoryUI();
  }

  /**
   * Load current config into editor
   */
  loadConfigIntoEditor() {
    const editor = this.overlay.querySelector('#config-editor');
    if (editor && this.currentConfig) {
      editor.value = JSON.stringify(this.currentConfig, null, 2);
      this.updateEditorInfo();
    }
  }

  /**
   * Update editor info (lines, characters, size)
   */
  updateEditorInfo() {
    const editor = this.overlay.querySelector('#config-editor');
    if (!editor) return;
    
    const content = editor.value;
    const lines = content.split('\n').length;
    const chars = content.length;
    const size = (new Blob([content]).size / 1024).toFixed(2);
    
    const lineCount = this.overlay.querySelector('#line-count');
    const charCount = this.overlay.querySelector('#char-count');
    const sizeInfo = this.overlay.querySelector('#size-info');
    
    if (lineCount) lineCount.textContent = lines;
    if (charCount) charCount.textContent = chars;
    if (sizeInfo) sizeInfo.textContent = `${size} KB`;
  }

  /**
   * Handle action button clicks
   */
  async handleAction(action) {
    switch (action) {
      case 'import':
        await this.importConfiguration();
        break;
      case 'export':
        this.exportConfiguration();
        break;
      case 'reset':
        this.resetConfiguration();
        break;
      case 'save':
        this.saveConfiguration();
        break;
    }
  }

  /**
   * Handle editor action button clicks
   */
  handleEditorAction(action) {
    const editor = this.overlay.querySelector('#config-editor');
    if (!editor) return;
    
    switch (action) {
      case 'format':
        this.formatJSON(editor);
        break;
      case 'minify':
        this.minifyJSON(editor);
        break;
      case 'copy':
        this.copyToClipboard(editor.value);
        break;
    }
  }

  /**
   * Format JSON in editor
   */
  formatJSON(editor) {
    try {
      const config = JSON.parse(editor.value);
      editor.value = JSON.stringify(config, null, 2);
      this.updateEditorInfo();
    } catch (error) {
      alert('Invalid JSON format. Cannot format.');
    }
  }

  /**
   * Minify JSON in editor
   */
  minifyJSON(editor) {
    try {
      const config = JSON.parse(editor.value);
      editor.value = JSON.stringify(config);
      this.updateEditorInfo();
    } catch (error) {
      alert('Invalid JSON format. Cannot minify.');
    }
  }

  /**
   * Copy content to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showNotification('Copied to clipboard!', 'success');
    } catch (error) {
      this.showNotification('Failed to copy to clipboard', 'error');
    }
  }

  /**
   * Import configuration from file
   */
  async importConfiguration() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const config = JSON.parse(text);
          
          const editor = this.overlay.querySelector('#config-editor');
          if (editor) {
            editor.value = JSON.stringify(config, null, 2);
            this.updateEditorInfo();
          }
          
          this.showNotification('Configuration imported successfully!', 'success');
        } catch (error) {
          this.showNotification('Failed to import configuration: ' + error.message, 'error');
        }
      }
    };
    
    input.click();
  }

  /**
   * Export current configuration
   */
  exportConfiguration() {
    const editor = this.overlay.querySelector('#config-editor');
    if (!editor) return;
    
    try {
      const config = JSON.parse(editor.value);
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumaboard-config-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      this.showNotification('Configuration exported successfully!', 'success');
    } catch (error) {
      this.showNotification('Failed to export configuration: ' + error.message, 'error');
    }
  }

  /**
   * Reset to default configuration
   */
  resetConfiguration() {
    if (confirm('Are you sure you want to reset to default configuration? This will overwrite current changes.')) {
      // Load default config (this is a simplified version)
      const defaultConfig = {
        scenes: [
          {
            name: "Default Scene",
            layout: "2x2",
            widgets: [
              { type: "clock", position: 0 },
              { type: "weather", position: 1 },
              { type: "news", position: 2 },
              { type: "calendar", position: 3 }
            ]
          }
        ],
        sceneRotation: { enabled: false, interval: 30 },
        refreshInterval: 300
      };
      
      const editor = this.overlay.querySelector('#config-editor');
      if (editor) {
        editor.value = JSON.stringify(defaultConfig, null, 2);
        this.updateEditorInfo();
      }
      
      this.showNotification('Configuration reset to default', 'success');
    }
  }

  /**
   * Save current configuration to history
   */
  saveConfiguration() {
    const editor = this.overlay.querySelector('#config-editor');
    if (!editor) return;
    
    try {
      const config = JSON.parse(editor.value);
      this.addToHistory(config);
      this.showNotification('Configuration saved to history', 'success');
    } catch (error) {
      this.showNotification('Invalid JSON format. Cannot save.', 'error');
    }
  }

  /**
   * Load a preset configuration
   */
  loadPreset(preset) {
    // This would load different preset configurations
    const presets = {
      minimal: {
        scenes: [{ name: "Minimal", layout: "single", widgets: [{ type: "clock", position: 0 }] }],
        sceneRotation: { enabled: false }
      },
      standard: this.lumaBoard.config,
      advanced: this.lumaBoard.config, // Would be more complex
      demo: this.lumaBoard.config
    };
    
    const config = presets[preset] || presets.standard;
    const editor = this.overlay.querySelector('#config-editor');
    if (editor) {
      editor.value = JSON.stringify(config, null, 2);
      this.updateEditorInfo();
    }
    
    this.showNotification(`Loaded ${preset} preset`, 'success');
  }

  /**
   * Validate configuration
   */
  validateConfiguration() {
    const editor = this.overlay.querySelector('#config-editor');
    const statusElement = this.overlay.querySelector('#validation-status');
    
    if (!editor || !statusElement) return;
    
    try {
      const config = JSON.parse(editor.value);
      
      // Basic validation
      if (!config.scenes || !Array.isArray(config.scenes)) {
        throw new Error('Configuration must have a scenes array');
      }
      
      if (config.scenes.length === 0) {
        throw new Error('At least one scene is required');
      }
      
      // Validate each scene
      config.scenes.forEach((scene, index) => {
        if (!scene.name) {
          throw new Error(`Scene ${index + 1} must have a name`);
        }
        if (!scene.widgets || !Array.isArray(scene.widgets)) {
          throw new Error(`Scene "${scene.name}" must have a widgets array`);
        }
      });
      
      statusElement.className = 'validation-status validation-success';
      statusElement.innerHTML = '✓ Configuration is valid';
      
    } catch (error) {
      statusElement.className = 'validation-status validation-error';
      statusElement.innerHTML = `✗ Error: ${error.message}`;
    }
  }

  /**
   * Apply configuration to LumaBoard
   */
  async applyConfiguration() {
    const editor = this.overlay.querySelector('#config-editor');
    if (!editor) return;
    
    try {
      const config = JSON.parse(editor.value);
      
      // Validate first
      this.validateConfiguration();
      const statusElement = this.overlay.querySelector('#validation-status');
      if (statusElement && statusElement.classList.contains('validation-error')) {
        this.showNotification('Please fix validation errors before applying', 'error');
        return;
      }
      
      // Add to history
      this.addToHistory(config);
      
      // Apply to LumaBoard
      this.lumaBoard.config = config;
      
      // Reload scenes
      if (this.lumaBoard.sceneEngine) {
        this.lumaBoard.sceneEngine.loadScenes(config.scenes || []);
        this.lumaBoard.sceneEngine.renderCurrentScene();
      }
      
      this.showNotification('Configuration applied successfully!', 'success');
      this.hide();
      
    } catch (error) {
      this.showNotification('Failed to apply configuration: ' + error.message, 'error');
    }
  }

  /**
   * Preview configuration changes
   */
  previewConfiguration() {
    // This would show a preview of the changes without applying them
    this.showNotification('Preview functionality coming soon!', 'info');
  }

  /**
   * Add configuration to history
   */
  addToHistory(config) {
    const historyItem = {
      config: config,
      timestamp: Date.now(),
      name: `Config ${new Date().toLocaleString()}`
    };
    
    this.configHistory.unshift(historyItem);
    
    // Limit history size
    if (this.configHistory.length > this.maxHistorySize) {
      this.configHistory = this.configHistory.slice(0, this.maxHistorySize);
    }
    
    this.saveConfigHistory();
    this.loadHistoryUI();
  }

  /**
   * Load history UI
   */
  loadHistoryUI() {
    const historyContainer = this.overlay?.querySelector('#config-history');
    if (!historyContainer) return;
    
    if (this.configHistory.length === 0) {
      historyContainer.innerHTML = '<div class="history-loading">No history available</div>';
      return;
    }
    
    const historyHTML = this.configHistory.map((item, index) => `
      <div class="history-item" data-index="${index}">
        <div style="font-weight: 600;">${item.name}</div>
        <div style="font-size: 0.6rem; opacity: 0.7;">
          ${new Date(item.timestamp).toLocaleString()}
        </div>
      </div>
    `).join('');
    
    historyContainer.innerHTML = historyHTML;
    
    // Add click handlers
    historyContainer.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.loadFromHistory(index);
      });
    });
  }

  /**
   * Load configuration from history
   */
  loadFromHistory(index) {
    const historyItem = this.configHistory[index];
    if (!historyItem) return;
    
    const editor = this.overlay.querySelector('#config-editor');
    if (editor) {
      editor.value = JSON.stringify(historyItem.config, null, 2);
      this.updateEditorInfo();
    }
    
    this.showNotification(`Loaded configuration from ${historyItem.name}`, 'success');
  }

  /**
   * Save config history to localStorage
   */
  saveConfigHistory() {
    try {
      localStorage.setItem('lumaboard_config_history', JSON.stringify(this.configHistory));
    } catch (error) {
      console.warn('Failed to save config history:', error);
    }
  }

  /**
   * Load config history from localStorage
   */
  loadConfigHistory() {
    try {
      const saved = localStorage.getItem('lumaboard_config_history');
      if (saved) {
        this.configHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load config history:', error);
      this.configHistory = [];
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `config-notification config-notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
      color: white;
      padding: 1rem;
      border-radius: 6px;
      z-index: 10002;
      font-family: 'Segoe UI', sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  /**
   * Destroy the config manager
   */
  destroy() {
    this.hide();
    this.lumaBoard = null;
    this.configHistory = [];
  }
} 