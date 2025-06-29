// Import all widget components
import { ClockWidget } from './components/ClockWidget.js';
import { WeatherWidget } from './components/WeatherWidget.js';
import { NewsTickerWidget } from './components/NewsTickerWidget.js';
import { StockTickerWidget } from './components/StockTickerWidget.js';
import { YouTubeEmbedWidget } from './components/YouTubeEmbedWidget.js';
import { ImageSlideshowWidget } from './components/ImageSlideshowWidget.js';
import { VideoPlayerWidget } from './components/VideoPlayerWidget.js';
import { CalendarWidget } from './components/CalendarWidget.js';
import { CountdownWidget } from './components/CountdownWidget.js';
import { QRCodeWidget } from './components/QRCodeWidget.js';
import { MapWidget } from './components/MapWidget.js';
import { freshnessManager } from './components/FreshnessIndicator.js';

/**
 * Widget mounting system for LumaBoard
 * Handles dynamic creation and configuration of widgets based on scene configuration
 */
export class WidgetMount {
  constructor() {
    this.widgets = new Map();
    this.widgetRegistry = {
      'clock': ClockWidget,
      'weather': WeatherWidget,
      'news': NewsTickerWidget,
      'stocks': StockTickerWidget,
      'youtube': YouTubeEmbedWidget,
      'image-slideshow': ImageSlideshowWidget,
      'video': VideoPlayerWidget,
      'calendar': CalendarWidget,
      'countdown': CountdownWidget,
      'qrcode': QRCodeWidget,
      'map': MapWidget
    };
  }

  /**
   * Create and mount a widget in the specified container
   * @param {string} type - Widget type
   * @param {HTMLElement} container - Container element
   * @param {Object} config - Widget configuration
   * @returns {HTMLElement} Created widget element
   */
  createWidget(type, container, config = {}) {
    const WidgetClass = this.widgetRegistry[type];
    
    if (!WidgetClass) {
      console.warn(`WidgetMount: Unknown widget type '${type}'`);
      return this.createPlaceholderWidget(type, container, config);
    }

    try {
      // Create widget element
      const widgetElement = document.createElement(this.getWidgetTagName(type));
      
      // Apply configuration
      if (config && Object.keys(config).length > 0) {
        widgetElement.setAttribute('config', JSON.stringify(config));
      }

      // Apply container styling
      this.applyContainerStyles(container);
      
      // Mount widget
      container.appendChild(widgetElement);
      
      // Store widget reference
      const widgetId = this.generateWidgetId(type);
      this.widgets.set(widgetId, {
        element: widgetElement,
        type: type,
        config: config,
        container: container
      });

      // Add freshness indicator for data widgets
      this.addFreshnessIndicator(widgetElement, type);

      console.log(`WidgetMount: Created ${type} widget with ID ${widgetId}`);
      return widgetElement;
    } catch (error) {
      console.error(`WidgetMount: Failed to create ${type} widget:`, error);
      return this.createErrorWidget(type, container, error);
    }
  }

  /**
   * Get the custom element tag name for a widget type
   * @param {string} type - Widget type
   * @returns {string} Tag name
   */
  getWidgetTagName(type) {
    return type + '-widget';
  }

  /**
   * Generate a unique widget ID
   * @param {string} type - Widget type
   * @returns {string} Unique widget ID
   */
  generateWidgetId(type) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `${type}-${timestamp}-${random}`;
  }

  /**
   * Apply standard container styles for widgets
   * @param {HTMLElement} container - Container element
   */
  applyContainerStyles(container) {
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
  }

  /**
   * Create a placeholder widget for unknown types
   * @param {string} type - Widget type
   * @param {HTMLElement} container - Container element
   * @param {Object} config - Widget configuration
   * @returns {HTMLElement} Placeholder widget element
   */
  createPlaceholderWidget(type, container, config) {
    const placeholder = document.createElement('div');
    placeholder.className = 'widget-placeholder';
    placeholder.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: linear-gradient(135deg, #ddd 0%, #bbb 100%);
        color: #666;
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      ">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔧</div>
        <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">Unknown Widget</div>
        <div style="font-size: 0.9rem; opacity: 0.8;">Type: ${type}</div>
        ${config ? `<div style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.6;">Config: ${Object.keys(config).length} properties</div>` : ''}
      </div>
    `;

    this.applyContainerStyles(container);
    container.appendChild(placeholder);
    
    return placeholder;
  }

  /**
   * Create an error widget when widget creation fails
   * @param {string} type - Widget type
   * @param {HTMLElement} container - Container element
   * @param {Error} error - Error that occurred
   * @returns {HTMLElement} Error widget element
   */
  createErrorWidget(type, container, error) {
    const errorWidget = document.createElement('div');
    errorWidget.className = 'widget-error';
    errorWidget.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        color: white;
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      ">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
        <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">Widget Error</div>
        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 0.5rem;">Type: ${type}</div>
        <div style="font-size: 0.8rem; opacity: 0.8; max-width: 200px; word-break: break-word;">${error.message}</div>
      </div>
    `;

    this.applyContainerStyles(container);
    container.appendChild(errorWidget);
    
    return errorWidget;
  }

  /**
   * Remove a widget by ID
   * @param {string} widgetId - Widget ID to remove
   */
  removeWidget(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      // Call destroy method if available
      if (widget.element && typeof widget.element.destroy === 'function') {
        widget.element.destroy();
      }
      
      // Remove from DOM
      if (widget.element && widget.element.parentNode) {
        widget.element.parentNode.removeChild(widget.element);
      }
      
      // Remove from registry
      this.widgets.delete(widgetId);
      
      console.log(`WidgetMount: Removed widget ${widgetId}`);
    }
  }

  /**
   * Remove all widgets
   */
  removeAllWidgets() {
    for (const [widgetId] of this.widgets) {
      this.removeWidget(widgetId);
    }
  }

  /**
   * Refresh a widget by ID
   * @param {string} widgetId - Widget ID to refresh
   */
  refreshWidget(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (widget && widget.element && typeof widget.element.refresh === 'function') {
      widget.element.refresh();
      
      // Update freshness indicator
      freshnessManager.markWidgetUpdated(widget.element);
      
      console.log(`WidgetMount: Refreshed widget ${widgetId}`);
    }
  }

  /**
   * Refresh all widgets
   */
  refreshAllWidgets() {
    for (const [widgetId] of this.widgets) {
      this.refreshWidget(widgetId);
    }
  }

  /**
   * Get widget information
   * @param {string} widgetId - Widget ID
   * @returns {Object|null} Widget information
   */
  getWidget(widgetId) {
    return this.widgets.get(widgetId) || null;
  }

  /**
   * Get all widgets
   * @returns {Map} All widgets
   */
  getAllWidgets() {
    return new Map(this.widgets);
  }

  /**
   * Get available widget types
   * @returns {Array} Array of available widget types
   */
  getAvailableWidgetTypes() {
    return Object.keys(this.widgetRegistry);
  }

  /**
   * Check if a widget type is supported
   * @param {string} type - Widget type to check
   * @returns {boolean} True if supported
   */
  isWidgetTypeSupported(type) {
    return this.widgetRegistry.hasOwnProperty(type);
  }

  /**
   * Add freshness indicator to data widgets
   * @param {HTMLElement} widgetElement - Widget element
   * @param {string} type - Widget type
   */
  addFreshnessIndicator(widgetElement, type) {
    // Only add freshness indicators to data widgets that fetch external data
    const dataWidgets = ['weather', 'news', 'stocks', 'map'];
    
    if (dataWidgets.includes(type)) {
      // Wait for widget to be fully initialized
      setTimeout(() => {
        freshnessManager.addIndicator(widgetElement, {
          position: 'top-right',
          showAge: true,
          showIcon: true,
          threshold: {
            fresh: 30000,    // 30 seconds
            stale: 300000,   // 5 minutes
            expired: 900000  // 15 minutes
          }
        });
      }, 1000);
    }
  }
}

// Create and export singleton instance
export const widgetMount = new WidgetMount(); 