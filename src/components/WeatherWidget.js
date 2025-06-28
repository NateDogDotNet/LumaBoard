export class WeatherWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {};
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const location = this.config?.location || 'Unknown Location';
    
    this.shadowRoot.innerHTML = `
      <style>
        .weather-widget {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
          color: white;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          height: 100%;
          box-sizing: border-box;
        }
        .weather-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }
        .temperature {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        .location {
          font-size: 1rem;
          opacity: 0.9;
        }
        .status {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-top: 0.5rem;
        }
      </style>
      <div class="weather-widget">
        <div class="weather-icon">☀️</div>
        <div class="temperature">72°F</div>
        <div class="location">${location}</div>
        <div class="status">Sunny</div>
      </div>
    `;
  }

  // Future: implement actual weather API integration
  async fetchWeatherData() {
    // TODO: Implement weather API call
    // This would use Open-Meteo or WeatherAPI as specified in the documentation
  }
}

customElements.define('weather-widget', WeatherWidget); 