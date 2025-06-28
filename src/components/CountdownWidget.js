export class CountdownWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      targetDate: null, // ISO date string or Date object
      title: 'Countdown',
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      format: 'digital', // 'digital', 'analog', 'text'
      completedMessage: 'Time\'s up!',
      autoRefresh: true,
      timezone: 'local',
      ...this.config
    };
    this.updateInterval = null;
    this.isCompleted = false;
  }

  connectedCallback() {
    // Override config with any passed configuration
    if (this.hasAttribute('config')) {
      try {
        const configAttr = JSON.parse(this.getAttribute('config'));
        this.config = { ...this.config, ...configAttr };
      } catch (e) {
        console.warn('CountdownWidget: Invalid config attribute');
      }
    }

    // Set default target date if none provided (1 hour from now)
    if (!this.config.targetDate) {
      const defaultTarget = new Date();
      defaultTarget.setHours(defaultTarget.getHours() + 1);
      this.config.targetDate = defaultTarget.toISOString();
    }

    this.render();
    if (this.config.autoRefresh) {
      this.startCountdown();
    }
  }

  disconnectedCallback() {
    this.stopCountdown();
  }

  getTargetDate() {
    if (typeof this.config.targetDate === 'string') {
      return new Date(this.config.targetDate);
    }
    return new Date(this.config.targetDate);
  }

  calculateTimeRemaining() {
    const now = new Date();
    const target = this.getTargetDate();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      this.isCompleted = true;
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
      };
    }

    this.isCompleted = false;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      total: diff
    };
  }

  formatNumber(num) {
    return num.toString().padStart(2, '0');
  }

  formatTimeText(timeData) {
    const parts = [];
    
    if (this.config.showDays && timeData.days > 0) {
      parts.push(`${timeData.days} day${timeData.days !== 1 ? 's' : ''}`);
    }
    
    if (this.config.showHours && timeData.hours > 0) {
      parts.push(`${timeData.hours} hour${timeData.hours !== 1 ? 's' : ''}`);
    }
    
    if (this.config.showMinutes && timeData.minutes > 0) {
      parts.push(`${timeData.minutes} minute${timeData.minutes !== 1 ? 's' : ''}`);
    }
    
    if (this.config.showSeconds && timeData.seconds > 0) {
      parts.push(`${timeData.seconds} second${timeData.seconds !== 1 ? 's' : ''}`);
    }

    if (parts.length === 0) {
      return this.config.completedMessage;
    }

    return parts.join(', ');
  }

  renderDigitalFormat(timeData) {
    const segments = [];
    
    if (this.config.showDays) {
      segments.push(`
        <div class="time-segment">
          <div class="time-value">${this.formatNumber(timeData.days)}</div>
          <div class="time-label">Days</div>
        </div>
      `);
    }
    
    if (this.config.showHours) {
      segments.push(`
        <div class="time-segment">
          <div class="time-value">${this.formatNumber(timeData.hours)}</div>
          <div class="time-label">Hours</div>
        </div>
      `);
    }
    
    if (this.config.showMinutes) {
      segments.push(`
        <div class="time-segment">
          <div class="time-value">${this.formatNumber(timeData.minutes)}</div>
          <div class="time-label">Minutes</div>
        </div>
      `);
    }
    
    if (this.config.showSeconds) {
      segments.push(`
        <div class="time-segment">
          <div class="time-value">${this.formatNumber(timeData.seconds)}</div>
          <div class="time-label">Seconds</div>
        </div>
      `);
    }

    return `<div class="digital-display">${segments.join('<div class="separator">:</div>')}</div>`;
  }

  renderTextFormat(timeData) {
    return `
      <div class="text-display">
        <div class="time-text">${this.formatTimeText(timeData)}</div>
      </div>
    `;
  }

  startCountdown() {
    this.updateInterval = setInterval(() => {
      this.updateDisplay();
    }, 1000);
  }

  stopCountdown() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  updateDisplay() {
    const timeData = this.calculateTimeRemaining();
    const displayContainer = this.shadowRoot.querySelector('.countdown-display');
    
    if (!displayContainer) return;

    if (this.isCompleted) {
      displayContainer.innerHTML = `
        <div class="completed-message">
          <div class="completed-icon">🎉</div>
          <div class="completed-text">${this.config.completedMessage}</div>
        </div>
      `;
      this.stopCountdown();
      return;
    }

    // Update the display based on format
    if (this.config.format === 'digital') {
      displayContainer.innerHTML = this.renderDigitalFormat(timeData);
    } else if (this.config.format === 'text') {
      displayContainer.innerHTML = this.renderTextFormat(timeData);
    }
  }

  render() {
    const timeData = this.calculateTimeRemaining();
    const targetDate = this.getTargetDate();
    
    this.shadowRoot.innerHTML = `
      <style>
        .countdown-widget {
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #ff7675 0%, #d63031 100%);
          color: white;
          border-radius: 12px;
          padding: 1.5rem;
          height: 100%;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        .countdown-widget::before {
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
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .header {
          text-align: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .title {
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .target-date {
          font-size: 0.9rem;
          opacity: 0.8;
          font-weight: 300;
        }
        
        .countdown-display {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .digital-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .time-segment {
          text-align: center;
          min-width: 60px;
        }
        
        .time-value {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 300;
          line-height: 1;
          margin-bottom: 0.3rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          font-family: 'Courier New', monospace;
        }
        
        .time-label {
          font-size: 0.9rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
        }
        
        .separator {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 300;
          opacity: 0.6;
          animation: blink 2s infinite;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 0.6; }
          51%, 100% { opacity: 0.2; }
        }
        
        .text-display {
          text-align: center;
        }
        
        .time-text {
          font-size: clamp(1.2rem, 2.5vw, 1.8rem);
          font-weight: 400;
          line-height: 1.4;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .completed-message {
          text-align: center;
          animation: celebration 2s infinite;
        }
        
        .completed-icon {
          font-size: clamp(3rem, 6vw, 4rem);
          margin-bottom: 1rem;
          animation: bounce 1s infinite;
        }
        
        .completed-text {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        @keyframes celebration {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .countdown-widget.completed {
          background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
        }
      </style>
      <div class="countdown-widget ${this.isCompleted ? 'completed' : ''}">
        <div class="content">
          <div class="header">
            <div class="title">
              ⏰ ${this.config.title}
            </div>
            <div class="target-date">
              Until ${targetDate.toLocaleDateString()} ${targetDate.toLocaleTimeString()}
            </div>
          </div>
          <div class="countdown-display">
            ${this.isCompleted ? `
              <div class="completed-message">
                <div class="completed-icon">🎉</div>
                <div class="completed-text">${this.config.completedMessage}</div>
              </div>
            ` : (this.config.format === 'digital' ? this.renderDigitalFormat(timeData) : this.renderTextFormat(timeData))}
          </div>
        </div>
      </div>
    `;
  }

  // Widget contract methods
  init(config) {
    this.config = { ...this.config, ...config };
    this.render();
    if (this.config.autoRefresh) {
      this.startCountdown();
    }
  }

  refresh() {
    this.updateDisplay();
  }

  destroy() {
    this.stopCountdown();
  }
}

customElements.define('countdown-widget', CountdownWidget); 