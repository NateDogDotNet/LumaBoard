/**
 * Anti-burn-in Protection System for LumaBoard
 * Protects OLED and plasma displays from burn-in through various techniques
 */
export class BurnInProtection {
  constructor(lumaBoard) {
    this.lumaBoard = lumaBoard;
    this.isActive = false;
    this.config = {
      enabled: true,
      pixelShift: {
        enabled: true,
        interval: 30000, // 30 seconds
        maxShift: 3, // pixels
        duration: 1000 // shift animation duration
      },
      logoShift: {
        enabled: true,
        interval: 60000, // 1 minute
        maxShift: 10,
        duration: 2000
      },
      screenSaver: {
        enabled: true,
        activateAfter: 1800000, // 30 minutes
        type: 'geometric', // geometric, particles, waves
        duration: 300000 // 5 minutes
      },
      dimming: {
        enabled: true,
        nightMode: {
          startTime: '22:00',
          endTime: '06:00',
          dimLevel: 0.3
        },
        idleDimming: {
          enabled: true,
          activateAfter: 600000, // 10 minutes
          dimLevel: 0.7
        }
      },
      contentRotation: {
        enabled: true,
        staticElementDetection: true,
        rotateAfter: 3600000 // 1 hour
      }
    };
    
    this.timers = {
      pixelShift: null,
      logoShift: null,
      screenSaver: null,
      idleDimming: null,
      contentRotation: null
    };
    
    this.state = {
      lastActivity: Date.now(),
      currentShift: { x: 0, y: 0 },
      screenSaverActive: false,
      isDimmed: false,
      staticElements: new Set()
    };
    
    this.init();
  }

  /**
   * Initialize burn-in protection
   */
  init() {
    this.setupActivityTracking();
    this.setupPixelShift();
    this.setupLogoShift();
    this.setupScreenSaver();
    this.setupDimming();
    this.setupContentRotation();
    this.setupStyles();
    
    this.isActive = true;
    console.log('BurnInProtection: Initialized');
  }

  /**
   * Setup activity tracking
   */
  setupActivityTracking() {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    this.activityHandler = () => {
      this.state.lastActivity = Date.now();
      this.handleUserActivity();
    };
    
    events.forEach(event => {
      document.addEventListener(event, this.activityHandler, { passive: true });
    });
  }

  /**
   * Handle user activity
   */
  handleUserActivity() {
    // Disable screen saver if active
    if (this.state.screenSaverActive) {
      this.deactivateScreenSaver();
    }
    
    // Reset idle dimming
    if (this.state.isDimmed) {
      this.resetDimming();
    }
    
    // Reset timers
    this.resetIdleTimers();
  }

  /**
   * Setup pixel shift protection
   */
  setupPixelShift() {
    if (!this.config.pixelShift.enabled) return;
    
    this.timers.pixelShift = setInterval(() => {
      this.performPixelShift();
    }, this.config.pixelShift.interval);
  }

  /**
   * Perform pixel shift
   */
  performPixelShift() {
    const { maxShift, duration } = this.config.pixelShift;
    
    // Generate random shift within bounds
    const shiftX = (Math.random() - 0.5) * 2 * maxShift;
    const shiftY = (Math.random() - 0.5) * 2 * maxShift;
    
    this.state.currentShift = { x: shiftX, y: shiftY };
    
    // Apply shift to main container
    const container = document.body;
    if (container) {
      container.style.transition = `transform ${duration}ms ease-out`;
      container.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
      
      // Reset after a short time
      setTimeout(() => {
        if (container.style.transform.includes(`translate(${shiftX}px, ${shiftY}px)`)) {
          container.style.transform = 'translate(0px, 0px)';
        }
      }, duration + 1000);
    }
    
    console.log(`BurnInProtection: Pixel shift applied (${shiftX.toFixed(1)}, ${shiftY.toFixed(1)})`);
  }

  /**
   * Setup logo/static element shift
   */
  setupLogoShift() {
    if (!this.config.logoShift.enabled) return;
    
    this.timers.logoShift = setInterval(() => {
      this.performLogoShift();
    }, this.config.logoShift.interval);
  }

  /**
   * Perform logo/static element shift
   */
  performLogoShift() {
    const staticElements = document.querySelectorAll('[data-static="true"], .logo, .brand, .watermark');
    const { maxShift, duration } = this.config.logoShift;
    
    staticElements.forEach(element => {
      const shiftX = (Math.random() - 0.5) * 2 * maxShift;
      const shiftY = (Math.random() - 0.5) * 2 * maxShift;
      
      element.style.transition = `transform ${duration}ms ease-out`;
      element.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
      
      // Reset after duration
      setTimeout(() => {
        element.style.transform = 'translate(0px, 0px)';
      }, duration);
    });
    
    if (staticElements.length > 0) {
      console.log(`BurnInProtection: Logo shift applied to ${staticElements.length} elements`);
    }
  }

  /**
   * Setup screen saver
   */
  setupScreenSaver() {
    if (!this.config.screenSaver.enabled) return;
    
    this.resetScreenSaverTimer();
  }

  /**
   * Reset screen saver timer
   */
  resetScreenSaverTimer() {
    if (this.timers.screenSaver) {
      clearTimeout(this.timers.screenSaver);
    }
    
    this.timers.screenSaver = setTimeout(() => {
      this.activateScreenSaver();
    }, this.config.screenSaver.activateAfter);
  }

  /**
   * Activate screen saver
   */
  activateScreenSaver() {
    if (this.state.screenSaverActive) return;
    
    this.state.screenSaverActive = true;
    this.createScreenSaver();
    
    console.log('BurnInProtection: Screen saver activated');
    
    // Auto-deactivate after duration
    setTimeout(() => {
      this.deactivateScreenSaver();
    }, this.config.screenSaver.duration);
  }

  /**
   * Create screen saver overlay
   */
  createScreenSaver() {
    this.screenSaverOverlay = document.createElement('div');
    this.screenSaverOverlay.className = 'burn-in-screensaver';
    this.screenSaverOverlay.innerHTML = this.getScreenSaverHTML();
    
    document.body.appendChild(this.screenSaverOverlay);
    
    // Start animation based on type
    switch (this.config.screenSaver.type) {
      case 'geometric':
        this.startGeometricScreenSaver();
        break;
      case 'particles':
        this.startParticleScreenSaver();
        break;
      case 'waves':
        this.startWaveScreenSaver();
        break;
      default:
        this.startGeometricScreenSaver();
    }
  }

  /**
   * Get screen saver HTML
   */
  getScreenSaverHTML() {
    return `
      <div class="screensaver-content">
        <canvas id="screensaver-canvas"></canvas>
        <div class="screensaver-info">
          <div class="screensaver-title">🛡️ Display Protection Active</div>
          <div class="screensaver-subtitle">Move mouse or press any key to continue</div>
          <div class="screensaver-time" id="screensaver-time"></div>
        </div>
      </div>
    `;
  }

  /**
   * Start geometric screen saver
   */
  startGeometricScreenSaver() {
    const canvas = this.screenSaverOverlay.querySelector('#screensaver-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const shapes = [];
    const numShapes = 15;
    
    // Create shapes
    for (let i = 0; i < numShapes; i++) {
      shapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 50 + 20,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        type: Math.floor(Math.random() * 3) // 0: circle, 1: square, 2: triangle
      });
    }
    
    const animate = () => {
      if (!this.state.screenSaverActive) return;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      shapes.forEach(shape => {
        // Update position
        shape.x += shape.vx;
        shape.y += shape.vy;
        
        // Bounce off walls
        if (shape.x < 0 || shape.x > canvas.width) shape.vx *= -1;
        if (shape.y < 0 || shape.y > canvas.height) shape.vy *= -1;
        
        // Draw shape
        ctx.fillStyle = shape.color;
        ctx.beginPath();
        
        if (shape.type === 0) {
          // Circle
          ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2);
        } else if (shape.type === 1) {
          // Square
          ctx.rect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
        } else {
          // Triangle
          ctx.moveTo(shape.x, shape.y - shape.size / 2);
          ctx.lineTo(shape.x - shape.size / 2, shape.y + shape.size / 2);
          ctx.lineTo(shape.x + shape.size / 2, shape.y + shape.size / 2);
        }
        
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    this.updateScreenSaverTime();
  }

  /**
   * Start particle screen saver
   */
  startParticleScreenSaver() {
    // Similar to geometric but with more particles and different behavior
    console.log('BurnInProtection: Particle screen saver started');
  }

  /**
   * Start wave screen saver
   */
  startWaveScreenSaver() {
    // Wave-based animation
    console.log('BurnInProtection: Wave screen saver started');
  }

  /**
   * Update screen saver time display
   */
  updateScreenSaverTime() {
    const timeElement = this.screenSaverOverlay?.querySelector('#screensaver-time');
    if (!timeElement) return;
    
    const updateTime = () => {
      if (!this.state.screenSaverActive) return;
      
      timeElement.textContent = new Date().toLocaleTimeString();
      setTimeout(updateTime, 1000);
    };
    
    updateTime();
  }

  /**
   * Deactivate screen saver
   */
  deactivateScreenSaver() {
    if (!this.state.screenSaverActive) return;
    
    this.state.screenSaverActive = false;
    
    if (this.screenSaverOverlay && this.screenSaverOverlay.parentNode) {
      this.screenSaverOverlay.parentNode.removeChild(this.screenSaverOverlay);
    }
    
    this.resetScreenSaverTimer();
    console.log('BurnInProtection: Screen saver deactivated');
  }

  /**
   * Setup dimming protection
   */
  setupDimming() {
    if (!this.config.dimming.enabled) return;
    
    // Setup night mode
    this.setupNightMode();
    
    // Setup idle dimming
    if (this.config.dimming.idleDimming.enabled) {
      this.resetIdleDimmingTimer();
    }
  }

  /**
   * Setup night mode dimming
   */
  setupNightMode() {
    const checkNightMode = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const { startTime, endTime } = this.config.dimming.nightMode;
      const startMinutes = this.parseTime(startTime);
      const endMinutes = this.parseTime(endTime);
      
      let isNightTime = false;
      
      if (startMinutes > endMinutes) {
        // Crosses midnight
        isNightTime = currentTime >= startMinutes || currentTime < endMinutes;
      } else {
        isNightTime = currentTime >= startMinutes && currentTime < endMinutes;
      }
      
      if (isNightTime && !this.state.isDimmed) {
        this.applyDimming(this.config.dimming.nightMode.dimLevel, 'night');
      } else if (!isNightTime && this.state.isDimmed && this.state.dimReason === 'night') {
        this.resetDimming();
      }
    };
    
    // Check immediately and then every minute
    checkNightMode();
    setInterval(checkNightMode, 60000);
  }

  /**
   * Parse time string to minutes
   */
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Reset idle dimming timer
   */
  resetIdleDimmingTimer() {
    if (this.timers.idleDimming) {
      clearTimeout(this.timers.idleDimming);
    }
    
    this.timers.idleDimming = setTimeout(() => {
      this.applyDimming(this.config.dimming.idleDimming.dimLevel, 'idle');
    }, this.config.dimming.idleDimming.activateAfter);
  }

  /**
   * Apply dimming
   */
  applyDimming(level, reason) {
    if (this.state.isDimmed) return;
    
    this.state.isDimmed = true;
    this.state.dimReason = reason;
    
    // Create dimming overlay
    this.dimmingOverlay = document.createElement('div');
    this.dimmingOverlay.className = 'burn-in-dimming';
    this.dimmingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, ${1 - level});
      z-index: 9999;
      pointer-events: none;
      transition: opacity 2s ease;
      opacity: 0;
    `;
    
    document.body.appendChild(this.dimmingOverlay);
    
    // Fade in
    requestAnimationFrame(() => {
      this.dimmingOverlay.style.opacity = '1';
    });
    
    console.log(`BurnInProtection: Dimming applied (${reason}, level: ${level})`);
  }

  /**
   * Reset dimming
   */
  resetDimming() {
    if (!this.state.isDimmed) return;
    
    this.state.isDimmed = false;
    this.state.dimReason = null;
    
    if (this.dimmingOverlay) {
      this.dimmingOverlay.style.opacity = '0';
      setTimeout(() => {
        if (this.dimmingOverlay && this.dimmingOverlay.parentNode) {
          this.dimmingOverlay.parentNode.removeChild(this.dimmingOverlay);
        }
      }, 2000);
    }
    
    // Reset idle dimming timer if it was idle dimming
    if (this.config.dimming.idleDimming.enabled) {
      this.resetIdleDimmingTimer();
    }
    
    console.log('BurnInProtection: Dimming reset');
  }

  /**
   * Setup content rotation
   */
  setupContentRotation() {
    if (!this.config.contentRotation.enabled) return;
    
    this.timers.contentRotation = setInterval(() => {
      this.rotateContent();
    }, this.config.contentRotation.rotateAfter);
  }

  /**
   * Rotate content to prevent static elements
   */
  rotateContent() {
    // Force scene rotation if available
    if (this.lumaBoard.sceneEngine && this.lumaBoard.sceneEngine.scenes.length > 1) {
      this.lumaBoard.sceneEngine.nextScene();
      console.log('BurnInProtection: Content rotated via scene change');
    }
    
    // Refresh widgets to prevent static content
    if (this.lumaBoard.widgetMount) {
      this.lumaBoard.widgetMount.refreshAllWidgets();
      console.log('BurnInProtection: Widgets refreshed');
    }
  }

  /**
   * Reset idle timers
   */
  resetIdleTimers() {
    if (this.config.dimming.idleDimming.enabled) {
      this.resetIdleDimmingTimer();
    }
    
    this.resetScreenSaverTimer();
  }

  /**
   * Setup CSS styles
   */
  setupStyles() {
    if (document.querySelector('#burn-in-protection-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'burn-in-protection-styles';
    style.textContent = `
      .burn-in-screensaver {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #000;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Segoe UI', sans-serif;
      }
      
      .screensaver-content {
        position: relative;
        width: 100%;
        height: 100%;
      }
      
      #screensaver-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      
      .screensaver-info {
        position: absolute;
        bottom: 50px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        color: rgba(255, 255, 255, 0.8);
      }
      
      .screensaver-title {
        font-size: 2rem;
        font-weight: 300;
        margin-bottom: 0.5rem;
      }
      
      .screensaver-subtitle {
        font-size: 1rem;
        opacity: 0.7;
        margin-bottom: 1rem;
      }
      
      .screensaver-time {
        font-size: 3rem;
        font-weight: 200;
        font-family: 'Consolas', monospace;
      }
      
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Restart with new config
    this.stop();
    this.init();
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      active: this.isActive,
      screenSaverActive: this.state.screenSaverActive,
      isDimmed: this.state.isDimmed,
      dimReason: this.state.dimReason,
      lastActivity: this.state.lastActivity,
      currentShift: this.state.currentShift,
      timeSinceActivity: Date.now() - this.state.lastActivity
    };
  }

  /**
   * Stop burn-in protection
   */
  stop() {
    this.isActive = false;
    
    // Clear all timers
    Object.values(this.timers).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    
    // Remove event listeners
    if (this.activityHandler) {
      const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.removeEventListener(event, this.activityHandler);
      });
    }
    
    // Deactivate screen saver
    this.deactivateScreenSaver();
    
    // Reset dimming
    this.resetDimming();
    
    console.log('BurnInProtection: Stopped');
  }

  /**
   * Destroy burn-in protection
   */
  destroy() {
    this.stop();
    this.lumaBoard = null;
  }
} 