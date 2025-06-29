/**
 * WidgetBase - Base class for all LumaBoard widgets
 * Provides Shadow DOM isolation, theme integration, and consistent patterns
 */

export class WidgetBase {
  constructor(container, config) {
    this.container = container;
    this.config = config || {};
    this.shadowRoot = null;
    this.isDestroyed = false;
    this.updateInterval = null;
    this.themeVariables = '';
    
    // Widget metadata
    this.widgetType = this.constructor.name;
    this.widgetId = this.config.id || `${this.widgetType.toLowerCase()}-${Date.now()}`;
    
    this.init();
  }

  /**
   * Initialize the widget with Shadow DOM
   */
  init() {
    try {
      this.createShadowDOM();
      this.injectThemeVariables();
      this.createStyles();
      this.createStructure();
      this.bindEvents();
      this.startUpdateCycle();
      
      console.log(`WidgetBase: ${this.widgetType} initialized with Shadow DOM`);
    } catch (error) {
      console.error(`WidgetBase: Failed to initialize ${this.widgetType}:`, error);
      this.handleError(error);
    }
  }

  /**
   * Create Shadow DOM with closed mode for security
   */
  createShadowDOM() {
    if (!this.container || !this.container.attachShadow) {
      throw new Error('Container does not support Shadow DOM');
    }
    
    this.shadowRoot = this.container.attachShadow({ 
      mode: 'closed' // Closed mode for better encapsulation
    });
    
    // Add widget metadata to container
    this.container.setAttribute('data-widget-type', this.widgetType);
    this.container.setAttribute('data-widget-id', this.widgetId);
    this.container.classList.add('lumaboard-widget');
  }

  /**
   * Inject theme variables into Shadow DOM
   */
  injectThemeVariables() {
    // Get theme variables from document root
    const rootStyles = getComputedStyle(document.documentElement);
    const themeVars = [];
    
    // Extract CSS custom properties (theme variables)
    for (let i = 0; i < rootStyles.length; i++) {
      const property = rootStyles[i];
      if (property.startsWith('--')) {
        const value = rootStyles.getPropertyValue(property);
        themeVars.push(`${property}: ${value};`);
      }
    }
    
    this.themeVariables = themeVars.join(' ');
    
    // Create theme style element
    const themeStyle = document.createElement('style');
    themeStyle.className = 'theme-variables';
    themeStyle.textContent = `:host { ${this.themeVariables} }`;
    this.shadowRoot.appendChild(themeStyle);
  }

  /**
   * Create widget-specific styles (to be overridden)
   */
  createStyles() {
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadowRoot.appendChild(style);
  }

  /**
   * Get widget styles (to be overridden by subclasses)
   */
  getStyles() {
    return `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        color: var(--text-color, #333);
        background: var(--widget-background, transparent);
        border-radius: var(--border-radius, 8px);
        overflow: hidden;
      }
      
      .widget-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: var(--widget-padding, 16px);
        box-sizing: border-box;
      }
      
      .widget-header {
        font-size: var(--font-size-sm, 14px);
        font-weight: var(--font-weight-bold, 600);
        margin-bottom: var(--spacing-sm, 8px);
        color: var(--text-color-secondary, #666);
      }
      
      .widget-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      
      .widget-error {
        color: var(--error-color, #dc3545);
        text-align: center;
        padding: var(--spacing-md, 16px);
        border: 1px solid var(--error-color, #dc3545);
        border-radius: var(--border-radius, 8px);
        background: var(--error-background, rgba(220, 53, 69, 0.1));
      }
      
      .widget-loading {
        text-align: center;
        color: var(--text-color-secondary, #666);
        font-style: italic;
      }
      
      @media (max-width: 768px) {
        .widget-container {
          padding: var(--widget-padding-mobile, 12px);
        }
        
        .widget-header {
          font-size: var(--font-size-xs, 12px);
        }
      }
    `;
  }

  /**
   * Create widget structure (to be overridden)
   */
  createStructure() {
    const container = document.createElement('div');
    container.className = 'widget-container';
    
    if (this.config.title) {
      const header = document.createElement('div');
      header.className = 'widget-header';
      header.textContent = this.config.title;
      container.appendChild(header);
    }
    
    const content = document.createElement('div');
    content.className = 'widget-content';
    content.innerHTML = '<div class="widget-loading">Loading...</div>';
    container.appendChild(content);
    
    this.shadowRoot.appendChild(container);
    
    // Store references for subclasses
    this.elements = {
      container,
      content,
      header: container.querySelector('.widget-header')
    };
  }

  /**
   * Bind events (to be overridden)
   */
  bindEvents() {
    // Theme change listener
    this.themeChangeListener = () => {
      this.updateThemeVariables();
    };
    
    // Listen for theme changes on document
    document.addEventListener('themechange', this.themeChangeListener);
    
    // Configuration change listener
    this.configChangeListener = (event) => {
      if (event.detail && event.detail.widgetId === this.widgetId) {
        this.updateConfig(event.detail.config);
      }
    };
    
    document.addEventListener('widgetconfigchange', this.configChangeListener);
  }

  /**
   * Start update cycle (to be overridden)
   */
  startUpdateCycle() {
    if (this.config.updateInterval && this.config.updateInterval > 0) {
      this.updateInterval = setInterval(() => {
        if (!this.isDestroyed) {
          this.update();
        }
      }, this.config.updateInterval * 1000);
    }
  }

  /**
   * Update widget content (to be overridden)
   */
  update() {
    // Override in subclasses
  }

  /**
   * Update theme variables when theme changes
   */
  updateThemeVariables() {
    try {
      this.injectThemeVariables();
      console.log(`WidgetBase: Theme updated for ${this.widgetType}`);
    } catch (error) {
      console.error(`WidgetBase: Failed to update theme for ${this.widgetType}:`, error);
    }
  }

  /**
   * Update widget configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      this.refresh();
      console.log(`WidgetBase: Configuration updated for ${this.widgetType}`);
    } catch (error) {
      console.error(`WidgetBase: Failed to update config for ${this.widgetType}:`, error);
    }
  }

  /**
   * Refresh widget (recreate structure and content)
   */
  refresh() {
    try {
      // Clear existing content
      const container = this.shadowRoot.querySelector('.widget-container');
      if (container) {
        container.remove();
      }
      
      // Recreate structure
      this.createStructure();
      this.update();
    } catch (error) {
      console.error(`WidgetBase: Failed to refresh ${this.widgetType}:`, error);
      this.handleError(error);
    }
  }

  /**
   * Handle widget errors
   */
  handleError(error) {
    try {
      const content = this.shadowRoot.querySelector('.widget-content');
      if (content) {
        content.innerHTML = `
          <div class="widget-error">
            <strong>Widget Error</strong><br>
            ${error.message || 'Unknown error occurred'}
          </div>
        `;
      }
      
      // Emit error event for debugging
      this.container.dispatchEvent(new CustomEvent('widgeterror', {
        detail: {
          widgetType: this.widgetType,
          widgetId: this.widgetId,
          error: error.message
        },
        bubbles: true
      }));
    } catch (e) {
      console.error(`WidgetBase: Failed to handle error for ${this.widgetType}:`, e);
    }
  }

  /**
   * Show loading state
   */
  showLoading(message = 'Loading...') {
    const content = this.shadowRoot.querySelector('.widget-content');
    if (content) {
      content.innerHTML = `<div class="widget-loading">${message}</div>`;
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const loading = this.shadowRoot.querySelector('.widget-loading');
    if (loading) {
      loading.remove();
    }
  }

  /**
   * Get widget data for debugging
   */
  getDebugInfo() {
    return {
      widgetType: this.widgetType,
      widgetId: this.widgetId,
      config: this.config,
      isDestroyed: this.isDestroyed,
      hasUpdateInterval: !!this.updateInterval,
      shadowRootMode: 'closed',
      themeVariablesCount: this.themeVariables.split(';').length - 1
    };
  }

  /**
   * Emit custom events from widget
   */
  emit(eventName, detail = {}) {
    this.container.dispatchEvent(new CustomEvent(eventName, {
      detail: {
        widgetType: this.widgetType,
        widgetId: this.widgetId,
        ...detail
      },
      bubbles: true
    }));
  }

  /**
   * Destroy widget and cleanup resources
   */
  destroy() {
    try {
      this.isDestroyed = true;
      
      // Clear update interval
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
      
      // Remove event listeners
      if (this.themeChangeListener) {
        document.removeEventListener('themechange', this.themeChangeListener);
      }
      
      if (this.configChangeListener) {
        document.removeEventListener('widgetconfigchange', this.configChangeListener);
      }
      
      // Clear shadow root
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = '';
      }
      
      // Remove widget classes
      this.container.classList.remove('lumaboard-widget');
      this.container.removeAttribute('data-widget-type');
      this.container.removeAttribute('data-widget-id');
      
      console.log(`WidgetBase: ${this.widgetType} destroyed`);
    } catch (error) {
      console.error(`WidgetBase: Failed to destroy ${this.widgetType}:`, error);
    }
  }
}

export default WidgetBase; 