export class ClockWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.updateInterval = null;
    this.config = {
      format: '12', // 12 or 24 hour
      showDate: true,
      showSeconds: true,
      timezone: 'local', // 'local' or specific timezone
      dateFormat: 'short', // 'short', 'long', 'numeric'
      ...this.config
    };
  }

  connectedCallback() {
    // Override config with any passed configuration
    if (this.hasAttribute('config')) {
      try {
        const configAttr = JSON.parse(this.getAttribute('config'));
        this.config = { ...this.config, ...configAttr };
      } catch (e) {
        console.warn('ClockWidget: Invalid config attribute');
      }
    }
    
    this.render();
    this.startClock();
  }

  disconnectedCallback() {
    this.stopClock();
  }

  render() {
    const now = new Date();
    const timeString = this.formatTime(now);
    const dateString = this.formatDate(now);
    const dayString = now.toLocaleDateString('en-US', { weekday: 'long' });

    this.shadowRoot.innerHTML = `
      <style>
        .clock-widget {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          height: 100%;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
          font-weight: 300;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .date {
          font-size: clamp(1rem, 2vw, 1.3rem);
          opacity: 0.9;
          font-weight: 400;
          margin-bottom: 0.3rem;
        }
        
        .day {
          font-size: clamp(0.9rem, 1.5vw, 1.1rem);
          opacity: 0.8;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .timezone {
          position: absolute;
          bottom: 0.5rem;
          right: 0.8rem;
          font-size: 0.7rem;
          opacity: 0.6;
          font-weight: 300;
        }
      </style>
      <div class="clock-widget">
        <div class="content">
          <div class="time">${timeString}</div>
          ${this.config.showDate ? `<div class="date">${dateString}</div>` : ''}
          <div class="day">${dayString}</div>
        </div>
        ${this.config.timezone !== 'local' ? `<div class="timezone">${this.config.timezone}</div>` : ''}
      </div>
    `;
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

  startClock() {
    this.updateInterval = setInterval(() => {
      this.render();
    }, 1000);
  }

  stopClock() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Widget contract methods
  init(config) {
    this.config = { ...this.config, ...config };
  }

  refresh() {
    this.render();
  }

  destroy() {
    this.stopClock();
  }
}

customElements.define('clock-widget', ClockWidget); 