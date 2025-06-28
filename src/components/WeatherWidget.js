export class WeatherWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      location: 'Minneapolis',
      latitude: null,
      longitude: null,
      units: 'fahrenheit', // 'celsius' or 'fahrenheit'
      refreshInterval: 30, // minutes
      showForecast: false,
      ...this.config
    };
    this.weatherData = null;
    this.refreshTimer = null;
    this.lastUpdate = null;
  }

  connectedCallback() {
    // Override config with any passed configuration
    if (this.hasAttribute('config')) {
      try {
        const configAttr = JSON.parse(this.getAttribute('config'));
        this.config = { ...this.config, ...configAttr };
      } catch (e) {
        console.warn('WeatherWidget: Invalid config attribute');
      }
    }

    this.loadWeatherData();
    this.startRefreshTimer();
  }

  disconnectedCallback() {
    this.stopRefreshTimer();
  }

  async loadWeatherData() {
    try {
      // Try to get coordinates if not provided
      if (!this.config.latitude || !this.config.longitude) {
        await this.getCoordinates();
      }

      // Try to fetch fresh data
      const freshData = await this.fetchWeatherData();
      if (freshData) {
        this.weatherData = freshData;
        this.lastUpdate = new Date();
        this.cacheWeatherData(freshData);
      } else {
        // Fall back to cached data
        this.weatherData = this.getCachedWeatherData();
      }
    } catch (error) {
      console.warn('WeatherWidget: Failed to load weather data', error);
      // Try cached data as fallback
      this.weatherData = this.getCachedWeatherData();
    }

    this.render();
  }

  async getCoordinates() {
    if (this.config.latitude && this.config.longitude) return;

    try {
      // Use a simple geocoding service (Open-Meteo also provides this)
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(this.config.location)}&count=1`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        this.config.latitude = data.results[0].latitude;
        this.config.longitude = data.results[0].longitude;
      }
    } catch (error) {
      console.warn('WeatherWidget: Failed to get coordinates', error);
    }
  }

  async fetchWeatherData() {
    if (!this.config.latitude || !this.config.longitude) {
      throw new Error('No coordinates available');
    }

    const tempUnit = this.config.units === 'celsius' ? 'celsius' : 'fahrenheit';
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.config.latitude}&longitude=${this.config.longitude}&current_weather=true&temperature_unit=${tempUnit}&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      temperature: Math.round(data.current_weather.temperature),
      weatherCode: data.current_weather.weathercode,
      windSpeed: data.current_weather.windspeed,
      windDirection: data.current_weather.winddirection,
      time: data.current_weather.time,
      units: tempUnit
    };
  }

  cacheWeatherData(data) {
    try {
      const cacheKey = `weather_${this.config.latitude}_${this.config.longitude}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('WeatherWidget: Failed to cache data', error);
    }
  }

  getCachedWeatherData() {
    try {
      const cacheKey = `weather_${this.config.latitude}_${this.config.longitude}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Use cached data if less than 2 hours old
        if (Date.now() - timestamp < 2 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.warn('WeatherWidget: Failed to load cached data', error);
    }
    return null;
  }

  getWeatherIcon(weatherCode) {
    // WMO Weather interpretation codes
    const iconMap = {
      0: '☀️', // Clear sky
      1: '🌤️', // Mainly clear
      2: '⛅', // Partly cloudy
      3: '☁️', // Overcast
      45: '🌫️', // Fog
      48: '🌫️', // Depositing rime fog
      51: '🌦️', // Light drizzle
      53: '🌦️', // Moderate drizzle
      55: '🌦️', // Dense drizzle
      61: '🌧️', // Slight rain
      63: '🌧️', // Moderate rain
      65: '🌧️', // Heavy rain
      71: '🌨️', // Slight snow
      73: '🌨️', // Moderate snow
      75: '🌨️', // Heavy snow
      77: '❄️', // Snow grains
      80: '🌦️', // Slight rain showers
      81: '🌧️', // Moderate rain showers
      82: '🌧️', // Violent rain showers
      85: '🌨️', // Slight snow showers
      86: '🌨️', // Heavy snow showers
      95: '⛈️', // Thunderstorm
      96: '⛈️', // Thunderstorm with slight hail
      99: '⛈️'  // Thunderstorm with heavy hail
    };
    return iconMap[weatherCode] || '🌤️';
  }

  getWeatherDescription(weatherCode) {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light drizzle',
      53: 'Drizzle',
      55: 'Heavy drizzle',
      61: 'Light rain',
      63: 'Rain',
      65: 'Heavy rain',
      71: 'Light snow',
      73: 'Snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Rain showers',
      81: 'Rain showers',
      82: 'Heavy rain',
      85: 'Snow showers',
      86: 'Heavy snow',
      95: 'Thunderstorm',
      96: 'Thunderstorm',
      99: 'Severe thunderstorm'
    };
    return descriptions[weatherCode] || 'Unknown';
  }

  render() {
    const hasData = this.weatherData;
    const isStale = this.lastUpdate && (Date.now() - this.lastUpdate.getTime()) > (this.config.refreshInterval * 60 * 1000);
    
    this.shadowRoot.innerHTML = `
      <style>
        .weather-widget {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
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
        
        .weather-widget::before {
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
        
        .weather-icon {
          font-size: clamp(2.5rem, 5vw, 4rem);
          margin-bottom: 0.8rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        
        .temperature {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 300;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .location {
          font-size: clamp(1rem, 2vw, 1.2rem);
          opacity: 0.9;
          font-weight: 400;
          margin-bottom: 0.3rem;
        }
        
        .description {
          font-size: clamp(0.9rem, 1.5vw, 1rem);
          opacity: 0.8;
          font-weight: 300;
          text-transform: capitalize;
        }
        
        .error-state {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        }
        
        .loading-state {
          background: linear-gradient(135deg, #a8a8a8 0%, #6c757d 100%);
        }
        
        .freshness-indicator {
          position: absolute;
          top: 0.5rem;
          right: 0.8rem;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${isStale ? '#ff6b6b' : '#00b894'};
        }
        
        .last-update {
          position: absolute;
          bottom: 0.5rem;
          right: 0.8rem;
          font-size: 0.7rem;
          opacity: 0.6;
          font-weight: 300;
        }
      </style>
      <div class="weather-widget ${!hasData ? 'loading-state' : ''}">
        <div class="content">
          ${hasData ? `
            <div class="weather-icon">${this.getWeatherIcon(this.weatherData.weatherCode)}</div>
            <div class="temperature">${this.weatherData.temperature}°${this.weatherData.units === 'celsius' ? 'C' : 'F'}</div>
            <div class="location">${this.config.location}</div>
            <div class="description">${this.getWeatherDescription(this.weatherData.weatherCode)}</div>
          ` : `
            <div class="weather-icon">🌤️</div>
            <div class="temperature">--°</div>
            <div class="location">${this.config.location}</div>
            <div class="description">Loading...</div>
          `}
        </div>
        ${hasData ? `<div class="freshness-indicator"></div>` : ''}
        ${this.lastUpdate ? `<div class="last-update">${this.lastUpdate.toLocaleTimeString()}</div>` : ''}
      </div>
    `;
  }

  startRefreshTimer() {
    this.refreshTimer = setInterval(() => {
      this.loadWeatherData();
    }, this.config.refreshInterval * 60 * 1000);
  }

  stopRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Widget contract methods
  init(config) {
    this.config = { ...this.config, ...config };
  }

  async refresh() {
    await this.loadWeatherData();
  }

  destroy() {
    this.stopRefreshTimer();
  }
}

customElements.define('weather-widget', WeatherWidget); 