export class ClockWidget extends HTMLElement {
  constructor() {
    super();
    
    // Create shadow root
    this.attachShadow({ mode: 'closed' });
    
    // Default configuration
    this.config = {
      format: '12', // 12 or 24 hour
      showDate: true,
      showSeconds: true,
      timezone: 'local', // 'local' or specific timezone
      dateFormat: 'short', // 'short', 'long', 'numeric'
      updateInterval: 1, // Update every second
    };
    
    this.updateTimer = null;
    this.elements = {};
    this.isDestroyed = false;
  }

  connectedCallback() {
    // Parse config from attribute if provided
    const configAttr = this.getAttribute('config');
    if (configAttr) {
      try {
        const parsedConfig = JSON.parse(configAttr);
        this.config = { ...this.config, ...parsedConfig };
      } catch (error) {
        console.warn('ClockWidget: Invalid config attribute:', error);
      }
    }
    
    this.init();
  }

  disconnectedCallback() {
    this.destroy();
  }

  init() {
    this.createStyles();
    this.createStructure();
    this.startUpdateTimer();
    this.update();
  }

  createStyles() {
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadowRoot.appendChild(style);
  }

  startUpdateTimer() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    this.updateTimer = setInterval(() => {
      this.update();
    }, this.config.updateInterval * 1000);
  }

  destroy() {
    this.isDestroyed = true;
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  getStyles() {
    return `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      
      .clock-widget {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--secondary-color, #764ba2) 100%);
        color: var(--text-color-inverse, white);
        border-radius: var(--border-radius, 12px);
        padding: var(--spacing-lg, 24px);
        text-align: center;
        height: 100%;
        box-sizing: border-box;
        font-family: var(--font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
        position: relative;
        overflow: hidden;
      }
      
      .clock-widget::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        z-index: 0;
      }
      
      .content {
        position: relative;
        z-index: 1;
      }
      
      .time {
        font-size: clamp(1.8rem, 4vw, 3rem);
        font-weight: var(--font-weight-light, 300);
        letter-spacing: 0.05em;
        margin-bottom: var(--spacing-sm, 8px);
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      
      .date {
        font-size: clamp(1rem, 2vw, 1.3rem);
        opacity: 0.9;
        font-weight: var(--font-weight-normal, 400);
        margin-bottom: var(--spacing-xs, 4px);
      }
      
      .day {
        font-size: clamp(0.9rem, 1.5vw, 1.1rem);
        opacity: 0.8;
        font-weight: var(--font-weight-light, 300);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      
      .timezone {
        position: absolute;
        bottom: var(--spacing-sm, 8px);
        right: var(--spacing-sm, 8px);
        font-size: var(--font-size-xs, 12px);
        opacity: 0.6;
        font-weight: var(--font-weight-light, 300);
      }
    `;
  }

  createStructure() {
    const container = document.createElement('div');
    container.className = 'clock-widget';
    
    const content = document.createElement('div');
    content.className = 'content';
    
    const timeEl = document.createElement('div');
    timeEl.className = 'time';
    content.appendChild(timeEl);
    
    if (this.config.showDate) {
      const dateEl = document.createElement('div');
      dateEl.className = 'date';
      content.appendChild(dateEl);
    }
    
    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    content.appendChild(dayEl);
    
    container.appendChild(content);
    
    if (this.config.timezone !== 'local') {
      const timezoneEl = document.createElement('div');
      timezoneEl.className = 'timezone';
      timezoneEl.textContent = this.config.timezone;
      container.appendChild(timezoneEl);
    }
    
    this.shadowRoot.appendChild(container);
    
    // Store references
    this.elements = {
      container,
      content,
      time: timeEl,
      date: content.querySelector('.date'),
      day: dayEl,
      timezone: container.querySelector('.timezone')
    };
  }

  update() {
    if (this.isDestroyed) return;
    
    const now = new Date();
    const timeString = this.formatTime(now);
    const dateString = this.formatDate(now);
    const dayString = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (this.elements.time) {
      this.elements.time.textContent = timeString;
    }
    
    if (this.elements.date && this.config.showDate) {
      this.elements.date.textContent = dateString;
    }
    
    if (this.elements.day) {
      this.elements.day.textContent = dayString;
    }
  }

  formatTime(date) {
    const options = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: this.config.format === '12'
    };
    
    if (this.config.showSeconds) {
      options.second = '2-digit';
    }
    
    if (this.config.timezone !== 'local') {
      options.timeZone = this.config.timezone;
    }
    
    return date.toLocaleTimeString('en-US', options);
  }

  formatDate(date) {
    const options = {};
    
    switch (this.config.dateFormat) {
      case 'long':
        options.weekday = 'long';
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        break;
      case 'numeric':
        options.year = 'numeric';
        options.month = '2-digit';
        options.day = '2-digit';
        break;
      default: // 'short'
        options.year = 'numeric';
        options.month = 'short';
        options.day = 'numeric';
    }
    
    if (this.config.timezone !== 'local') {
      options.timeZone = this.config.timezone;
    }
    
    return date.toLocaleDateString('en-US', options);
  }

  // Legacy methods for compatibility
  updateConfig(config) {
    if (config) {
      this.config = { ...this.config, ...config };
      if (this.updateTimer) {
        this.startUpdateTimer();
      }
    }
  }

  refresh() {
    this.update();
  }
}

// Register the custom element
customElements.define('clock-widget', ClockWidget);

// Export for use with widget mounting system
export default ClockWidget; 