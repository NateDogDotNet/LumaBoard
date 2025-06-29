/**
 * Declarative Animation Engine for LumaBoard
 * Allows widgets to define animations through configuration
 */
export class AnimationEngine {
  constructor() {
    this.animations = new Map();
    this.timelines = new Map();
    this.globalOptions = {
      duration: 1000,
      easing: 'ease-in-out',
      delay: 0,
      iterations: 1,
      direction: 'normal',
      fillMode: 'both'
    };
    
    this.init();
  }

  /**
   * Initialize the animation engine
   */
  init() {
    this.setupAnimationStyles();
    this.setupIntersectionObserver();
    console.log('AnimationEngine: Initialized');
  }

  /**
   * Setup CSS animation styles
   */
  setupAnimationStyles() {
    if (document.querySelector('#animation-engine-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'animation-engine-styles';
    style.textContent = `
      /* Fade Animations */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fadeInLeft {
        from { opacity: 0; transform: translateX(-30px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes fadeInRight {
        from { opacity: 0; transform: translateX(30px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      /* Scale Animations */
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }
      
      @keyframes scaleOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.8); }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        14% { transform: scale(1.1); }
        28% { transform: scale(1); }
        42% { transform: scale(1.1); }
        70% { transform: scale(1); }
      }
      
      /* Rotation Animations */
      @keyframes rotateIn {
        from { opacity: 0; transform: rotate(-180deg); }
        to { opacity: 1; transform: rotate(0deg); }
      }
      
      @keyframes rotateOut {
        from { opacity: 1; transform: rotate(0deg); }
        to { opacity: 0; transform: rotate(180deg); }
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      /* Slide Animations */
      @keyframes slideInUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      
      @keyframes slideInDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
      
      @keyframes slideInLeft {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
      
      @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      
      /* Bounce Animations */
      @keyframes bounceIn {
        0% { opacity: 0; transform: scale(0.3); }
        50% { opacity: 1; transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1); }
      }
      
      @keyframes bounceOut {
        0% { transform: scale(1); }
        25% { transform: scale(0.95); }
        50% { opacity: 1; transform: scale(1.1); }
        100% { opacity: 0; transform: scale(0.3); }
      }
      
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
        40%, 43% { transform: translate3d(0, -30px, 0); }
        70% { transform: translate3d(0, -15px, 0); }
        90% { transform: translate3d(0, -4px, 0); }
      }
      
      /* Flip Animations */
      @keyframes flipInX {
        from { opacity: 0; transform: perspective(400px) rotateX(90deg); }
        40% { transform: perspective(400px) rotateX(-20deg); }
        60% { opacity: 1; transform: perspective(400px) rotateX(10deg); }
        80% { transform: perspective(400px) rotateX(-5deg); }
        to { opacity: 1; transform: perspective(400px) rotateX(0deg); }
      }
      
      @keyframes flipInY {
        from { opacity: 0; transform: perspective(400px) rotateY(90deg); }
        40% { transform: perspective(400px) rotateY(-20deg); }
        60% { opacity: 1; transform: perspective(400px) rotateY(10deg); }
        80% { transform: perspective(400px) rotateY(-5deg); }
        to { opacity: 1; transform: perspective(400px) rotateY(0deg); }
      }
      
      /* Shake and Wobble */
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
      }
      
      @keyframes wobble {
        0% { transform: translateX(0%); }
        15% { transform: translateX(-25%) rotate(-5deg); }
        30% { transform: translateX(20%) rotate(3deg); }
        45% { transform: translateX(-15%) rotate(-3deg); }
        60% { transform: translateX(10%) rotate(2deg); }
        75% { transform: translateX(-5%) rotate(-1deg); }
        100% { transform: translateX(0%); }
      }
      
      /* Glow and Highlight */
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
        50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6); }
      }
      
      @keyframes highlight {
        0%, 100% { background-color: transparent; }
        50% { background-color: rgba(255, 255, 0, 0.3); }
      }
      
      /* Typing Animation */
      @keyframes typing {
        from { width: 0; }
        to { width: 100%; }
      }
      
      @keyframes blink {
        0%, 50% { border-color: transparent; }
        51%, 100% { border-color: currentColor; }
      }
      
      /* Animation utilities */
      .animate-paused { animation-play-state: paused !important; }
      .animate-running { animation-play-state: running !important; }
      .animate-infinite { animation-iteration-count: infinite !important; }
      .animate-once { animation-iteration-count: 1 !important; }
      .animate-reverse { animation-direction: reverse !important; }
      .animate-alternate { animation-direction: alternate !important; }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Setup intersection observer for scroll-triggered animations
   */
  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        const animationConfig = element.dataset.scrollAnimation;
        
        if (animationConfig && entry.isIntersecting) {
          const config = JSON.parse(animationConfig);
          this.animate(element, config);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
  }

  /**
   * Register an animation configuration for an element
   */
  registerAnimation(element, config) {
    const animationId = this.generateAnimationId();
    
    const fullConfig = {
      ...this.globalOptions,
      ...config,
      id: animationId,
      element: element
    };
    
    this.animations.set(animationId, fullConfig);
    
    // Store animation ID on element for reference
    element.dataset.animationId = animationId;
    
    return animationId;
  }

  /**
   * Apply animation to an element
   */
  animate(element, config) {
    if (!element || !config) return null;
    
    const animationConfig = {
      ...this.globalOptions,
      ...config
    };
    
    // Handle different animation types
    switch (animationConfig.type) {
      case 'css':
        return this.applyCSSAnimation(element, animationConfig);
      case 'keyframes':
        return this.applyKeyframeAnimation(element, animationConfig);
      case 'timeline':
        return this.createTimeline(element, animationConfig);
      case 'sequence':
        return this.createSequence(element, animationConfig);
      default:
        return this.applyCSSAnimation(element, animationConfig);
    }
  }

  /**
   * Apply CSS-based animation
   */
  applyCSSAnimation(element, config) {
    const {
      name,
      duration,
      easing,
      delay,
      iterations,
      direction,
      fillMode
    } = config;
    
    // Build animation CSS
    const animationCSS = [
      name,
      `${duration}ms`,
      easing,
      `${delay}ms`,
      iterations === 'infinite' ? 'infinite' : iterations,
      direction,
      fillMode
    ].join(' ');
    
    // Apply animation
    element.style.animation = animationCSS;
    
    // Return promise that resolves when animation completes
    return new Promise((resolve) => {
      const handleAnimationEnd = () => {
        element.removeEventListener('animationend', handleAnimationEnd);
        if (config.onComplete) {
          config.onComplete(element);
        }
        resolve(element);
      };
      
      element.addEventListener('animationend', handleAnimationEnd);
      
      // Call onStart callback
      if (config.onStart) {
        config.onStart(element);
      }
    });
  }

  /**
   * Apply keyframe animation using Web Animations API
   */
  applyKeyframeAnimation(element, config) {
    const { keyframes, options } = config;
    
    const animationOptions = {
      duration: config.duration,
      easing: config.easing,
      delay: config.delay,
      iterations: config.iterations,
      direction: config.direction,
      fill: config.fillMode
    };
    
    const animation = element.animate(keyframes, animationOptions);
    
    // Add callbacks
    animation.addEventListener('finish', () => {
      if (config.onComplete) {
        config.onComplete(element);
      }
    });
    
    if (config.onStart) {
      config.onStart(element);
    }
    
    return animation;
  }

  /**
   * Create animation timeline
   */
  createTimeline(element, config) {
    const timelineId = this.generateTimelineId();
    const timeline = {
      id: timelineId,
      element: element,
      animations: config.animations || [],
      currentIndex: 0,
      paused: false
    };
    
    this.timelines.set(timelineId, timeline);
    
    return this.playTimeline(timelineId);
  }

  /**
   * Play animation timeline
   */
  async playTimeline(timelineId) {
    const timeline = this.timelines.get(timelineId);
    if (!timeline || timeline.paused) return;
    
    for (let i = timeline.currentIndex; i < timeline.animations.length; i++) {
      if (timeline.paused) break;
      
      timeline.currentIndex = i;
      const animConfig = timeline.animations[i];
      
      await this.animate(timeline.element, animConfig);
      
      // Wait for any specified delay before next animation
      if (animConfig.nextDelay) {
        await this.delay(animConfig.nextDelay);
      }
    }
    
    return timeline;
  }

  /**
   * Create animation sequence for multiple elements
   */
  async createSequence(elements, config) {
    const { animations, stagger = 0 } = config;
    
    const promises = elements.map((element, index) => {
      return new Promise(async (resolve) => {
        // Apply stagger delay
        if (stagger > 0) {
          await this.delay(stagger * index);
        }
        
        // Run animations for this element
        for (const animConfig of animations) {
          await this.animate(element, animConfig);
        }
        
        resolve(element);
      });
    });
    
    return Promise.all(promises);
  }

  /**
   * Pause animation
   */
  pauseAnimation(elementOrId) {
    if (typeof elementOrId === 'string') {
      // Timeline ID
      const timeline = this.timelines.get(elementOrId);
      if (timeline) {
        timeline.paused = true;
      }
    } else {
      // Element
      elementOrId.style.animationPlayState = 'paused';
    }
  }

  /**
   * Resume animation
   */
  resumeAnimation(elementOrId) {
    if (typeof elementOrId === 'string') {
      // Timeline ID
      const timeline = this.timelines.get(elementOrId);
      if (timeline) {
        timeline.paused = false;
        this.playTimeline(elementOrId);
      }
    } else {
      // Element
      elementOrId.style.animationPlayState = 'running';
    }
  }

  /**
   * Stop animation
   */
  stopAnimation(elementOrId) {
    if (typeof elementOrId === 'string') {
      // Timeline ID
      const timeline = this.timelines.get(elementOrId);
      if (timeline) {
        timeline.paused = true;
        timeline.currentIndex = 0;
      }
    } else {
      // Element
      elementOrId.style.animation = 'none';
    }
  }

  /**
   * Add scroll-triggered animation
   */
  addScrollAnimation(element, config) {
    element.dataset.scrollAnimation = JSON.stringify(config);
    this.observer.observe(element);
  }

  /**
   * Remove scroll-triggered animation
   */
  removeScrollAnimation(element) {
    delete element.dataset.scrollAnimation;
    this.observer.unobserve(element);
  }

  /**
   * Create delay promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique animation ID
   */
  generateAnimationId() {
    return `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique timeline ID
   */
  generateTimelineId() {
    return `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get available animation names
   */
  getAvailableAnimations() {
    return [
      'fadeIn', 'fadeOut', 'fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight',
      'scaleIn', 'scaleOut', 'pulse', 'heartbeat',
      'rotateIn', 'rotateOut', 'spin',
      'slideInUp', 'slideInDown', 'slideInLeft', 'slideInRight',
      'bounceIn', 'bounceOut', 'bounce',
      'flipInX', 'flipInY',
      'shake', 'wobble',
      'glow', 'highlight',
      'typing'
    ];
  }

  /**
   * Update global animation options
   */
  updateGlobalOptions(options) {
    this.globalOptions = { ...this.globalOptions, ...options };
  }

  /**
   * Clean up animation
   */
  cleanup(animationId) {
    this.animations.delete(animationId);
  }

  /**
   * Destroy the animation engine
   */
  destroy() {
    this.animations.clear();
    this.timelines.clear();
    
    if (this.observer) {
      this.observer.disconnect();
    }
    
    console.log('AnimationEngine: Destroyed');
  }
}

/**
 * Animation presets for common use cases
 */
export const animationPresets = {
  // Widget entrance animations
  widgetEntrance: {
    type: 'css',
    name: 'fadeInUp',
    duration: 800,
    easing: 'ease-out'
  },
  
  // Data update animations
  dataUpdate: {
    type: 'css',
    name: 'pulse',
    duration: 600,
    iterations: 2
  },
  
  // Error state animation
  error: {
    type: 'css',
    name: 'shake',
    duration: 500,
    iterations: 2
  },
  
  // Loading animation
  loading: {
    type: 'css',
    name: 'spin',
    duration: 1000,
    iterations: 'infinite'
  },
  
  // Success animation
  success: {
    type: 'css',
    name: 'bounceIn',
    duration: 600,
    easing: 'ease-out'
  },
  
  // Attention animation
  attention: {
    type: 'css',
    name: 'heartbeat',
    duration: 1000,
    iterations: 3
  },
  
  // Highlight animation
  highlight: {
    type: 'css',
    name: 'glow',
    duration: 2000,
    iterations: 2
  }
};

// Global instance
export const animationEngine = new AnimationEngine(); 