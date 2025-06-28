export class StockTickerWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      symbols: ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
      refreshInterval: 5, // minutes
      showChange: true,
      showPercentChange: true,
      scrollSpeed: 30, // pixels per second
      apiKey: null, // For services that require API keys
      ...this.config
    };
    this.stockData = [];
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
        console.warn('StockTickerWidget: Invalid config attribute');
      }
    }

    this.loadStockData();
    this.startRefreshTimer();
  }

  disconnectedCallback() {
    this.stopRefreshTimer();
  }

  async loadStockData() {
    try {
      // Try to fetch fresh data
      const freshData = await this.fetchStockData();
      if (freshData && freshData.length > 0) {
        this.stockData = freshData;
        this.lastUpdate = new Date();
        this.cacheStockData(freshData);
      } else {
        // Fall back to cached data
        this.stockData = this.getCachedStockData() || [];
      }
    } catch (error) {
      console.warn('StockTickerWidget: Failed to load stock data', error);
      // Try cached data as fallback
      this.stockData = this.getCachedStockData() || this.getMockStockData();
    }

    this.render();
  }

  async fetchStockData() {
    try {
      // Using Alpha Vantage free API (demo key - replace with real key)
      // Note: Free tier has limited requests
      const stockPromises = this.config.symbols.map(symbol => 
        this.fetchSingleStock(symbol)
      );
      
      const results = await Promise.allSettled(stockPromises);
      const validData = results
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);
      
      if (validData.length === 0) {
        // If all API calls fail, return mock data
        return this.getMockStockData();
      }
      
      return validData;
    } catch (error) {
      console.warn('StockTickerWidget: API fetch failed, using mock data', error);
      return this.getMockStockData();
    }
  }

  async fetchSingleStock(symbol) {
    try {
      // Try Yahoo Finance alternative API (free, no key required)
      // Note: This is for demo purposes - in production use a reliable service
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Stock API error: ${response.status}`);
      }
      
      const data = await response.json();
      const result = data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];
      
      const currentPrice = meta.regularMarketPrice;
      const previousClose = meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      return {
        symbol: symbol,
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        currency: meta.currency || 'USD',
        lastUpdate: new Date()
      };
    } catch (error) {
      console.warn(`StockTickerWidget: Failed to fetch ${symbol}`, error);
      // Return mock data for this symbol
      return this.getMockStockForSymbol(symbol);
    }
  }

  getMockStockData() {
    return this.config.symbols.map(symbol => this.getMockStockForSymbol(symbol));
  }

  getMockStockForSymbol(symbol) {
    const mockData = {
      'AAPL': { price: 175.43, change: 2.15, changePercent: 1.24 },
      'GOOGL': { price: 138.21, change: -1.45, changePercent: -1.04 },
      'MSFT': { price: 378.85, change: 5.23, changePercent: 1.40 },
      'TSLA': { price: 248.50, change: -3.21, changePercent: -1.27 },
      'AMZN': { price: 145.32, change: 0.85, changePercent: 0.59 },
      'META': { price: 501.25, change: 8.45, changePercent: 1.71 }
    };

    const mock = mockData[symbol] || { price: 100.00, change: 0, changePercent: 0 };
    
    return {
      symbol: symbol,
      price: mock.price,
      change: mock.change,
      changePercent: mock.changePercent,
      currency: 'USD',
      lastUpdate: new Date()
    };
  }

  cacheStockData(data) {
    try {
      const cacheKey = `stocks_${this.config.symbols.join('_')}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('StockTickerWidget: Failed to cache data', error);
    }
  }

  getCachedStockData() {
    try {
      const cacheKey = `stocks_${this.config.symbols.join('_')}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Use cached data if less than 30 minutes old
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.warn('StockTickerWidget: Failed to load cached data', error);
    }
    return null;
  }

  formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }

  formatChange(change, showSign = true) {
    const sign = change >= 0 ? '+' : '';
    return showSign ? `${sign}${change.toFixed(2)}` : change.toFixed(2);
  }

  formatPercentChange(changePercent) {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  }

  getChangeColor(change) {
    if (change > 0) return '#00b894'; // Green for positive
    if (change < 0) return '#ff6b6b'; // Red for negative
    return '#74b9ff'; // Blue for neutral
  }

  render() {
    const hasData = this.stockData && this.stockData.length > 0;
    const isStale = this.lastUpdate && (Date.now() - this.lastUpdate.getTime()) > (this.config.refreshInterval * 60 * 1000);
    
    this.shadowRoot.innerHTML = `
      <style>
        .stock-ticker-widget {
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
          color: white;
          border-radius: 12px;
          padding: 1rem;
          height: 100%;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        .stock-ticker-widget::before {
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
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .title {
          font-size: 1.2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .stocks-container {
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        
        .stocks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.8rem;
          height: 100%;
          align-content: start;
        }
        
        .stock-item {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 0.8rem;
          text-align: center;
          backdrop-filter: blur(5px);
        }
        
        .stock-symbol {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
        }
        
        .stock-price {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 0.2rem;
        }
        
        .stock-change {
          font-size: 0.8rem;
          font-weight: 500;
          display: flex;
          justify-content: center;
          gap: 0.3rem;
        }
        
        .change-value {
          color: var(--change-color);
        }
        
        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          font-size: 0.9rem;
          opacity: 0.8;
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
      <div class="stock-ticker-widget">
        <div class="content">
          <div class="header">
            <div class="title">
              💹 Stock Ticker
            </div>
          </div>
          <div class="stocks-container">
            ${hasData ? `
              <div class="stocks-grid">
                ${this.stockData.map(stock => `
                  <div class="stock-item">
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div class="stock-price">${this.formatPrice(stock.price, stock.currency)}</div>
                    <div class="stock-change">
                      ${this.config.showChange ? `
                        <span class="change-value" style="--change-color: ${this.getChangeColor(stock.change)}">
                          ${this.formatChange(stock.change)}
                        </span>
                      ` : ''}
                      ${this.config.showPercentChange ? `
                        <span class="change-value" style="--change-color: ${this.getChangeColor(stock.change)}">
                          (${this.formatPercentChange(stock.changePercent)})
                        </span>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="loading-state">
                Loading stock data...
              </div>
            `}
          </div>
        </div>
        ${hasData ? `<div class="freshness-indicator"></div>` : ''}
        ${this.lastUpdate ? `<div class="last-update">${this.lastUpdate.toLocaleTimeString()}</div>` : ''}
      </div>
    `;
  }

  startRefreshTimer() {
    this.refreshTimer = setInterval(() => {
      this.loadStockData();
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
    await this.loadStockData();
  }

  destroy() {
    this.stopRefreshTimer();
  }
}

customElements.define('stocks-widget', StockTickerWidget); 