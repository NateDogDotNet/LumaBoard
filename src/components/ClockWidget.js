export class ClockWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.updateInterval = null;
  }

  connectedCallback() {
    this.render();
    this.startClock();
  }

  disconnectedCallback() {
    this.stopClock();
  }

  render() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();

    this.shadowRoot.innerHTML = `
      <style>
        .clock-widget {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          height: 100%;
          box-sizing: border-box;
        }
        .time {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        .date {
          font-size: 1.2rem;
          opacity: 0.9;
        }
      </style>
      <div class="clock-widget">
        <div class="time">${timeString}</div>
        <div class="date">${dateString}</div>
      </div>
    `;
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
}

customElements.define('clock-widget', ClockWidget); 