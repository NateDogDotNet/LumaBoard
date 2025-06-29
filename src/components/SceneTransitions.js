/**
 * Scene Transitions Component for LumaBoard
 * Provides smooth animated transitions between scenes
 */
export class SceneTransitions {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      defaultTransition: options.defaultTransition || 'fade',
      duration: options.duration || 1000,
      easing: options.easing || 'ease-in-out',
      enabled: options.enabled !== false,
      ...options
    };
    
    this.isTransitioning = false;
    this.transitionQueue = [];
    this.currentTransition = null;
    
    this.init();
  }

  /**
   * Initialize transitions
   */
  init() {
    if (!this.options.enabled) {
      console.log('SceneTransitions: Disabled');
      return;
    }
    
    this.setupContainer();
    this.addTransitionStyles();
  }

  /**
   * Setup container for transitions
   */
  setupContainer() {
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
  }

  /**
   * Add CSS animations for transitions
   */
  addTransitionStyles() {
    if (document.querySelector('#scene-transition-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'scene-transition-styles';
    style.textContent = `
      .scene-transition-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transition-timing-function: var(--transition-easing, ease-in-out);
      }
      
      /* Fade Transition */
      .transition-fade-enter {
        opacity: 0;
        transform: scale(1.05);
      }
      
      .transition-fade-enter-active {
        opacity: 1;
        transform: scale(1);
        transition: opacity var(--transition-duration, 1000ms), 
                    transform var(--transition-duration, 1000ms);
      }
      
      .transition-fade-exit {
        opacity: 1;
        transform: scale(1);
      }
      
      .transition-fade-exit-active {
        opacity: 0;
        transform: scale(0.95);
        transition: opacity var(--transition-duration, 1000ms), 
                    transform var(--transition-duration, 1000ms);
      }
      
      /* Slide Transitions */
      .transition-slide-left-enter {
        transform: translateX(100%);
      }
      
      .transition-slide-left-enter-active {
        transform: translateX(0);
        transition: transform var(--transition-duration, 1000ms);
      }
      
      .transition-slide-left-exit {
        transform: translateX(0);
      }
      
      .transition-slide-left-exit-active {
        transform: translateX(-100%);
        transition: transform var(--transition-duration, 1000ms);
      }
      
      .transition-slide-right-enter {
        transform: translateX(-100%);
      }
      
      .transition-slide-right-enter-active {
        transform: translateX(0);
        transition: transform var(--transition-duration, 1000ms);
      }
      
      .transition-slide-right-exit {
        transform: translateX(0);
      }
      
      .transition-slide-right-exit-active {
        transform: translateX(100%);
        transition: transform var(--transition-duration, 1000ms);
      }
      
      .transition-slide-up-enter {
        transform: translateY(100%);
      }
      
      .transition-slide-up-enter-active {
        transform: translateY(0);
        transition: transform var(--transition-duration, 1000ms);
      }
      
      .transition-slide-up-exit {
        transform: translateY(0);
      }
      
      .transition-slide-up-exit-active {
        transform: translateY(-100%);
        transition: transform var(--transition-duration, 1000ms);
      }
      
      .transition-slide-down-enter {
        transform: translateY(-100%);
      }
      
      .transition-slide-down-enter-active {
        transform: translateY(0);
        transition: transform var(--transition-duration, 1000ms);
      }
      
      .transition-slide-down-exit {
        transform: translateY(0);
      }
      
      .transition-slide-down-exit-active {
        transform: translateY(100%);
        transition: transform var(--transition-duration, 1000ms);
      }
      
      /* Zoom Transition */
      .transition-zoom-enter {
        opacity: 0;
        transform: scale(0.8);
      }
      
      .transition-zoom-enter-active {
        opacity: 1;
        transform: scale(1);
        transition: opacity var(--transition-duration, 1000ms), 
                    transform var(--transition-duration, 1000ms);
      }
      
      .transition-zoom-exit {
        opacity: 1;
        transform: scale(1);
      }
      
      .transition-zoom-exit-active {
        opacity: 0;
        transform: scale(1.2);
        transition: opacity var(--transition-duration, 1000ms), 
                    transform var(--transition-duration, 1000ms);
      }
      
      /* Flip Transition */
      .transition-flip-enter {
        opacity: 0;
        transform: perspective(1000px) rotateY(-90deg);
      }
      
      .transition-flip-enter-active {
        opacity: 1;
        transform: perspective(1000px) rotateY(0deg);
        transition: opacity var(--transition-duration, 1000ms), 
                    transform var(--transition-duration, 1000ms);
      }
      
      .transition-flip-exit {
        opacity: 1;
        transform: perspective(1000px) rotateY(0deg);
      }
      
      .transition-flip-exit-active {
        opacity: 0;
        transform: perspective(1000px) rotateY(90deg);
        transition: opacity var(--transition-duration, 1000ms), 
                    transform var(--transition-duration, 1000ms);
      }
      
      /* Cube Transition */
      .transition-cube-container {
        perspective: 1000px;
        transform-style: preserve-3d;
      }
      
      .transition-cube-enter {
        transform: translateZ(-50vh) rotateY(-90deg);
      }
      
      .transition-cube-enter-active {
        transform: translateZ(0) rotateY(0deg);
        transition: transform var(--transition-duration, 1000ms);
      }
      
      .transition-cube-exit {
        transform: translateZ(0) rotateY(0deg);
      }
      
      .transition-cube-exit-active {
        transform: translateZ(-50vh) rotateY(90deg);
        transition: transform var(--transition-duration, 1000ms);
      }
      
      /* Mosaic Transition */
      .transition-mosaic-enter {
        opacity: 0;
        clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
      }
      
      .transition-mosaic-enter-active {
        opacity: 1;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
        transition: opacity var(--transition-duration, 1000ms), 
                    clip-path var(--transition-duration, 1000ms);
      }
      
      .transition-mosaic-exit {
        opacity: 1;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
      }
      
      .transition-mosaic-exit-active {
        opacity: 0;
        clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
        transition: opacity var(--transition-duration, 1000ms), 
                    clip-path var(--transition-duration, 1000ms);
      }
      
      /* Ripple Transition */
      .transition-ripple-enter {
        opacity: 0;
        clip-path: circle(0% at 50% 50%);
      }
      
      .transition-ripple-enter-active {
        opacity: 1;
        clip-path: circle(100% at 50% 50%);
        transition: opacity var(--transition-duration, 1000ms), 
                    clip-path var(--transition-duration, 1000ms);
      }
      
      .transition-ripple-exit {
        opacity: 1;
        clip-path: circle(100% at 50% 50%);
      }
      
      .transition-ripple-exit-active {
        opacity: 0;
        clip-path: circle(0% at 50% 50%);
        transition: opacity var(--transition-duration, 1000ms), 
                    clip-path var(--transition-duration, 1000ms);
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Execute a scene transition
   */
  async transition(fromElement, toElement, transitionType = null) {
    if (!this.options.enabled) {
      // No transition, just swap elements
      this.instantSwap(fromElement, toElement);
      return Promise.resolve();
    }
    
    if (this.isTransitioning) {
      // Queue the transition
      return new Promise((resolve, reject) => {
        this.transitionQueue.push({ fromElement, toElement, transitionType, resolve, reject });
      });
    }
    
    return this.executeTransition(fromElement, toElement, transitionType);
  }

  /**
   * Execute the actual transition
   */
  async executeTransition(fromElement, toElement, transitionType) {
    this.isTransitioning = true;
    this.currentTransition = transitionType || this.options.defaultTransition;
    
    try {
      // Set up transition containers
      const fromContainer = this.createTransitionContainer(fromElement, 'exit');
      const toContainer = this.createTransitionContainer(toElement, 'enter');
      
      // Set CSS variables for transition
      this.setCSSVariables();
      
      // Add containers to main container
      this.container.appendChild(fromContainer);
      this.container.appendChild(toContainer);
      
      // Start transition
      await this.performTransition(fromContainer, toContainer);
      
      // Cleanup
      this.cleanupTransition(fromContainer, toContainer, toElement);
      
    } catch (error) {
      console.error('SceneTransitions: Transition failed:', error);
      this.instantSwap(fromElement, toElement);
    } finally {
      this.isTransitioning = false;
      this.currentTransition = null;
      
      // Process next transition in queue
      this.processQueue();
    }
  }

  /**
   * Create a transition container
   */
  createTransitionContainer(element, phase) {
    const container = document.createElement('div');
    container.className = `scene-transition-container transition-${this.currentTransition}-${phase}`;
    
    // Clone the element content
    if (element) {
      container.appendChild(element.cloneNode(true));
    }
    
    return container;
  }

  /**
   * Set CSS variables for the transition
   */
  setCSSVariables() {
    this.container.style.setProperty('--transition-duration', `${this.options.duration}ms`);
    this.container.style.setProperty('--transition-easing', this.options.easing);
  }

  /**
   * Perform the actual transition animation
   */
  async performTransition(fromContainer, toContainer) {
    return new Promise((resolve) => {
      // Trigger reflow to ensure initial styles are applied
      fromContainer.offsetHeight;
      toContainer.offsetHeight;
      
      // Add active classes to start transition
      requestAnimationFrame(() => {
        fromContainer.classList.add(`transition-${this.currentTransition}-exit-active`);
        toContainer.classList.add(`transition-${this.currentTransition}-enter-active`);
        
        // Wait for transition to complete
        setTimeout(() => {
          resolve();
        }, this.options.duration);
      });
    });
  }

  /**
   * Cleanup after transition
   */
  cleanupTransition(fromContainer, toContainer, originalToElement) {
    // Remove transition containers
    if (fromContainer.parentNode) {
      fromContainer.parentNode.removeChild(fromContainer);
    }
    
    if (toContainer.parentNode) {
      toContainer.parentNode.removeChild(toContainer);
    }
    
    // Add the original element back
    if (originalToElement) {
      this.container.appendChild(originalToElement);
    }
  }

  /**
   * Instant swap without transition
   */
  instantSwap(fromElement, toElement) {
    if (fromElement && fromElement.parentNode) {
      fromElement.parentNode.removeChild(fromElement);
    }
    
    if (toElement) {
      this.container.appendChild(toElement);
    }
  }

  /**
   * Process the transition queue
   */
  processQueue() {
    if (this.transitionQueue.length > 0) {
      const next = this.transitionQueue.shift();
      this.executeTransition(next.fromElement, next.toElement, next.transitionType)
        .then(next.resolve)
        .catch(next.reject);
    }
  }

  /**
   * Get available transition types
   */
  getAvailableTransitions() {
    return [
      'fade',
      'slide-left',
      'slide-right', 
      'slide-up',
      'slide-down',
      'zoom',
      'flip',
      'cube',
      'mosaic',
      'ripple'
    ];
  }

  /**
   * Set transition options
   */
  setOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.setCSSVariables();
  }

  /**
   * Get current transition status
   */
  getStatus() {
    return {
      isTransitioning: this.isTransitioning,
      currentTransition: this.currentTransition,
      queueLength: this.transitionQueue.length,
      enabled: this.options.enabled,
      defaultTransition: this.options.defaultTransition,
      duration: this.options.duration
    };
  }

  /**
   * Enable transitions
   */
  enable() {
    this.options.enabled = true;
  }

  /**
   * Disable transitions
   */
  disable() {
    this.options.enabled = false;
    
    // Clear any pending transitions
    this.transitionQueue.forEach(item => {
      item.reject(new Error('Transitions disabled'));
    });
    this.transitionQueue = [];
  }

  /**
   * Destroy the transition system
   */
  destroy() {
    this.disable();
    this.container = null;
    this.options = null;
  }
}

/**
 * Transition presets for different use cases
 */
export const transitionPresets = {
  subtle: {
    defaultTransition: 'fade',
    duration: 800,
    easing: 'ease-out'
  },
  
  dynamic: {
    defaultTransition: 'slide-left',
    duration: 600,
    easing: 'ease-in-out'
  },
  
  dramatic: {
    defaultTransition: 'cube',
    duration: 1200,
    easing: 'ease-in-out'
  },
  
  modern: {
    defaultTransition: 'ripple',
    duration: 1000,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  fast: {
    defaultTransition: 'fade',
    duration: 300,
    easing: 'ease-out'
  },
  
  slow: {
    defaultTransition: 'zoom',
    duration: 2000,
    easing: 'ease-in-out'
  }
}; 