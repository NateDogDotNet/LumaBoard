import { widgetMount } from './widgetMount.js';

/**
 * Scene Engine for LumaBoard
 * Manages scene rendering, rotation, and widget lifecycle
 */
export class SceneEngine {
  constructor(container) {
    this.container = container;
    this.scenes = [];
    this.currentSceneIndex = 0;
    this.rotationTimer = null;
    this.isRotating = false;
    this.currentWidgetIds = [];
  }

  /**
   * Load scenes configuration
   * @param {Array} scenes - Array of scene configurations
   */
  loadScenes(scenes) {
    this.scenes = scenes || [];
    console.log(`SceneEngine: Loaded ${this.scenes.length} scenes`);
  }

  /**
   * Start scene rotation
   * @param {number} interval - Rotation interval in seconds
   */
  startRotation(interval = 30) {
    if (this.scenes.length <= 1) {
      console.log('SceneEngine: Not starting rotation - only one scene or no scenes');
      return;
    }

    this.stopRotation();
    this.isRotating = true;
    
    this.rotationTimer = setInterval(() => {
      this.nextScene();
    }, interval * 1000);
    
    console.log(`SceneEngine: Started rotation with ${interval}s interval`);
  }

  /**
   * Stop scene rotation
   */
  stopRotation() {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
    this.isRotating = false;
    console.log('SceneEngine: Stopped rotation');
  }

  /**
   * Move to the next scene
   */
  nextScene() {
    if (this.scenes.length === 0) return;
    
    this.currentSceneIndex = (this.currentSceneIndex + 1) % this.scenes.length;
    this.renderCurrentScene();
    console.log(`SceneEngine: Switched to scene ${this.currentSceneIndex + 1}/${this.scenes.length}`);
  }

  /**
   * Move to the previous scene
   */
  previousScene() {
    if (this.scenes.length === 0) return;
    
    this.currentSceneIndex = this.currentSceneIndex === 0 
      ? this.scenes.length - 1 
      : this.currentSceneIndex - 1;
    this.renderCurrentScene();
    console.log(`SceneEngine: Switched to scene ${this.currentSceneIndex + 1}/${this.scenes.length}`);
  }

  /**
   * Go to a specific scene by index
   * @param {number} index - Scene index
   */
  goToScene(index) {
    if (index >= 0 && index < this.scenes.length) {
      this.currentSceneIndex = index;
      this.renderCurrentScene();
      console.log(`SceneEngine: Switched to scene ${index + 1}/${this.scenes.length}`);
    }
  }

  /**
   * Render the current scene
   */
  renderCurrentScene() {
    if (this.scenes.length === 0) {
      this.renderEmptyState();
      return;
    }

    const scene = this.scenes[this.currentSceneIndex];
    this.renderScene(scene);
  }

  /**
   * Render a specific scene
   * @param {Object} scene - Scene configuration
   */
  renderScene(scene) {
    console.log(`SceneEngine: Rendering scene "${scene.name}"`);
    
    // Clear current widgets
    this.clearCurrentWidgets();
    
    // Clear container
    this.container.innerHTML = '';
    
    // Apply scene background
    this.applySceneBackground(scene);
    
    // Create layout based on scene layout type
    const layout = this.createLayout(scene.layout);
    this.container.appendChild(layout);
    
    // Mount widgets
    this.mountSceneWidgets(scene, layout);
  }

  /**
   * Clear current widgets
   */
  clearCurrentWidgets() {
    this.currentWidgetIds.forEach(widgetId => {
      widgetMount.removeWidget(widgetId);
    });
    this.currentWidgetIds = [];
  }

  /**
   * Apply scene background styling
   * @param {Object} scene - Scene configuration
   */
  applySceneBackground(scene) {
    if (scene.background) {
      if (scene.background.type === 'color') {
        this.container.style.background = scene.background.value;
      } else if (scene.background.type === 'gradient') {
        this.container.style.background = scene.background.value;
      } else if (scene.background.type === 'image') {
        this.container.style.backgroundImage = `url(${scene.background.value})`;
        this.container.style.backgroundSize = 'cover';
        this.container.style.backgroundPosition = 'center';
      }
    } else {
      // Default background
      this.container.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }

  /**
   * Create layout container based on layout type
   * @param {string} layout - Layout type ('2x2', '3x3', 'single', 'custom')
   * @returns {HTMLElement} Layout container
   */
  createLayout(layout = '2x2') {
    const layoutContainer = document.createElement('div');
    layoutContainer.className = 'scene-layout';
    
    switch (layout) {
      case '2x2':
        layoutContainer.style.cssText = `
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 1rem;
          padding: 1rem;
          height: 100%;
          box-sizing: border-box;
        `;
        // Create 4 widget containers
        for (let i = 0; i < 4; i++) {
          const widgetContainer = document.createElement('div');
          widgetContainer.className = 'widget-container';
          widgetContainer.dataset.position = i;
          layoutContainer.appendChild(widgetContainer);
        }
        break;
        
      case '3x3':
        layoutContainer.style.cssText = `
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: 1fr 1fr 1fr;
          gap: 0.8rem;
          padding: 1rem;
          height: 100%;
          box-sizing: border-box;
        `;
        // Create 9 widget containers
        for (let i = 0; i < 9; i++) {
          const widgetContainer = document.createElement('div');
          widgetContainer.className = 'widget-container';
          widgetContainer.dataset.position = i;
          layoutContainer.appendChild(widgetContainer);
        }
        break;
        
      case 'single':
        layoutContainer.style.cssText = `
          display: flex;
          padding: 2rem;
          height: 100%;
          box-sizing: border-box;
        `;
        // Create 1 widget container
        const singleContainer = document.createElement('div');
        singleContainer.className = 'widget-container';
        singleContainer.dataset.position = 0;
        singleContainer.style.width = '100%';
        singleContainer.style.height = '100%';
        layoutContainer.appendChild(singleContainer);
        break;
        
      default:
        console.warn(`SceneEngine: Unknown layout type '${layout}', using 2x2`);
        return this.createLayout('2x2');
    }
    
    return layoutContainer;
  }

  /**
   * Mount widgets for a scene
   * @param {Object} scene - Scene configuration
   * @param {HTMLElement} layout - Layout container
   */
  mountSceneWidgets(scene, layout) {
    if (!scene.widgets || scene.widgets.length === 0) {
      console.log('SceneEngine: No widgets to mount for this scene');
      return;
    }

    scene.widgets.forEach((widgetConfig, index) => {
      const position = widgetConfig.position || index;
      const container = layout.querySelector(`[data-position="${position}"]`);
      
      if (!container) {
        console.warn(`SceneEngine: No container found for position ${position}`);
        return;
      }

      try {
        const widgetElement = widgetMount.createWidget(
          widgetConfig.type,
          container,
          widgetConfig.config || {}
        );
        
        // Store widget ID for cleanup
        const widgetId = this.extractWidgetId(widgetElement);
        if (widgetId) {
          this.currentWidgetIds.push(widgetId);
        }
        
        console.log(`SceneEngine: Mounted ${widgetConfig.type} widget at position ${position}`);
      } catch (error) {
        console.error(`SceneEngine: Failed to mount widget at position ${position}:`, error);
      }
    });
  }

  /**
   * Extract widget ID from widget element (helper method)
   * @param {HTMLElement} widgetElement - Widget element
   * @returns {string|null} Widget ID
   */
  extractWidgetId(widgetElement) {
    // Since we can't easily get the ID back from widgetMount.createWidget,
    // we'll use a different approach - get all current widgets and find the newest one
    const allWidgets = widgetMount.getAllWidgets();
    const widgetEntries = Array.from(allWidgets.entries());
    
    // Find the widget that matches this element
    for (const [id, widget] of widgetEntries) {
      if (widget.element === widgetElement) {
        return id;
      }
    }
    
    return null;
  }

  /**
   * Render empty state when no scenes are available
   */
  renderEmptyState() {
    this.container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: linear-gradient(135deg, #ddd 0%, #bbb 100%);
        color: #666;
        text-align: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📺</div>
        <div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">No Scenes Available</div>
        <div style="font-size: 1rem; opacity: 0.8;">Please configure scenes to display content</div>
      </div>
    `;
  }

  /**
   * Get current scene information
   * @returns {Object} Current scene info
   */
  getCurrentSceneInfo() {
    return {
      index: this.currentSceneIndex,
      total: this.scenes.length,
      scene: this.scenes[this.currentSceneIndex] || null,
      isRotating: this.isRotating
    };
  }

  /**
   * Get the widget mount instance
   * @returns {Object} Widget mount instance
   */
  get widgetMount() {
    return widgetMount;
  }

  /**
   * Refresh all widgets in the current scene
   */
  refreshCurrentScene() {
    this.currentWidgetIds.forEach(widgetId => {
      widgetMount.refreshWidget(widgetId);
    });
    console.log('SceneEngine: Refreshed all widgets in current scene');
  }

  /**
   * Destroy the scene engine and cleanup resources
   */
  destroy() {
    this.stopRotation();
    this.clearCurrentWidgets();
    this.container.innerHTML = '';
    console.log('SceneEngine: Destroyed');
  }
} 