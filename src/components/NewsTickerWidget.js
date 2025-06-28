export class NewsTickerWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      feedUrl: 'https://feeds.npr.org/1001/rss.xml',
      refreshInterval: 15, // minutes
      maxItems: 10,
      scrollSpeed: 50, // pixels per second
      pauseOnHover: true,
      showSource: true,
      ...this.config
    };
    this.newsItems = [];
    this.refreshTimer = null;
    this.scrollAnimation = null;
    this.lastUpdate = null;
    this.isPaused = false;
  }

  connectedCallback() {
    // Override config with any passed configuration
    if (this.hasAttribute('config')) {
      try {
        const configAttr = JSON.parse(this.getAttribute('config'));
        this.config = { ...this.config, ...configAttr };
      } catch (e) {
        console.warn('NewsTickerWidget: Invalid config attribute');
      }
    }

    this.loadNewsData();
    this.startRefreshTimer();
  }

  disconnectedCallback() {
    this.stopRefreshTimer();
    this.stopScrolling();
  }

  async loadNewsData() {
    try {
      // Try to fetch fresh data
      const freshData = await this.fetchNewsData();
      if (freshData && freshData.length > 0) {
        this.newsItems = freshData;
        this.lastUpdate = new Date();
        this.cacheNewsData(freshData);
      } else {
        // Fall back to cached data
        this.newsItems = this.getCachedNewsData() || [];
      }
    } catch (error) {
      console.warn('NewsTickerWidget: Failed to load news data', error);
      // Try cached data as fallback
      this.newsItems = this.getCachedNewsData() || [];
    }

    this.render();
    this.startScrolling();
  }

  async fetchNewsData() {
    try {
      // Note: Direct RSS fetching might be blocked by CORS
      // In a real implementation, you might need a proxy service
      // For demo purposes, we'll use a CORS proxy or fallback to mock data
      
      let response;
      try {
        // Try direct fetch first
        response = await fetch(this.config.feedUrl);
      } catch (corsError) {
        // If CORS fails, try with a CORS proxy (for demo)
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(this.config.feedUrl)}`;
        const proxyResponse = await fetch(proxyUrl);
        const proxyData = await proxyResponse.json();
        
        // Create a mock response with the contents
        response = {
          ok: true,
          text: () => Promise.resolve(proxyData.contents)
        };
      }

      if (!response.ok) {
        throw new Error(`RSS fetch error: ${response.status}`);
      }

      const xmlText = await response.text();
      return this.parseRSSFeed(xmlText);
    } catch (error) {
      console.warn('NewsTickerWidget: Fetch failed, using mock data', error);
      // Return mock data for demo purposes
      return this.getMockNewsData();
    }
  }

  parseRSSFeed(xmlText) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const items = xmlDoc.querySelectorAll('item');
      const newsItems = [];
      
      for (let i = 0; i < Math.min(items.length, this.config.maxItems); i++) {
        const item = items[i];
        const title = item.querySelector('title')?.textContent?.trim();
        const link = item.querySelector('link')?.textContent?.trim();
        const pubDate = item.querySelector('pubDate')?.textContent?.trim();
        const description = item.querySelector('description')?.textContent?.trim();
        
        if (title) {
          newsItems.push({
            title,
            link,
            pubDate: pubDate ? new Date(pubDate) : new Date(),
            description: this.stripHtml(description || '').substring(0, 200)
          });
        }
      }
      
      return newsItems;
    } catch (error) {
      console.warn('NewsTickerWidget: RSS parsing failed', error);
      return this.getMockNewsData();
    }
  }

  getMockNewsData() {
    return [
      {
        title: 'Technology News: Latest Developments in AI and Machine Learning',
        link: '#',
        pubDate: new Date(),
        description: 'Recent advances in artificial intelligence continue to shape the technology landscape.'
      },
      {
        title: 'Global Markets Show Strong Performance Amid Economic Recovery',
        link: '#',
        pubDate: new Date(Date.now() - 60000),
        description: 'Stock markets worldwide are experiencing positive trends as economies recover.'
      },
      {
        title: 'Climate Change Summit Reaches New International Agreements',
        link: '#',
        pubDate: new Date(Date.now() - 120000),
        description: 'World leaders commit to ambitious new targets for carbon emission reductions.'
      },
      {
        title: 'Sports Update: Championship Finals Draw Record Viewership',
        link: '#',
        pubDate: new Date(Date.now() - 180000),
        description: 'The latest championship games have attracted millions of viewers worldwide.'
      }
    ];
  }

  stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  cacheNewsData(data) {
    try {
      const cacheKey = `news_${this.config.feedUrl}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('NewsTickerWidget: Failed to cache data', error);
    }
  }

  getCachedNewsData() {
    try {
      const cacheKey = `news_${this.config.feedUrl}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Use cached data if less than 1 hour old
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.warn('NewsTickerWidget: Failed to load cached data', error);
    }
    return null;
  }

  render() {
    const hasData = this.newsItems && this.newsItems.length > 0;
    const isStale = this.lastUpdate && (Date.now() - this.lastUpdate.getTime()) > (this.config.refreshInterval * 60 * 1000);
    
    this.shadowRoot.innerHTML = `
      <style>
        .news-ticker-widget {
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
          color: white;
          border-radius: 12px;
          padding: 1rem;
          height: 100%;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        .news-ticker-widget::before {
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
        
        .ticker-container {
          flex: 1;
          overflow: hidden;
          position: relative;
          mask: linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
        }
        
        .ticker-content {
          display: flex;
          white-space: nowrap;
          animation: scroll-left 60s linear infinite;
          animation-play-state: ${this.isPaused ? 'paused' : 'running'};
        }
        
        .ticker-content:hover {
          animation-play-state: ${this.config.pauseOnHover ? 'paused' : 'running'};
        }
        
        .news-item {
          display: inline-flex;
          align-items: center;
          margin-right: 3rem;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .news-item::before {
          content: "📰";
          margin-right: 0.5rem;
          font-size: 1rem;
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
        
        @keyframes scroll-left {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        .no-data {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          font-size: 0.9rem;
          opacity: 0.7;
          text-align: center;
        }
      </style>
      <div class="news-ticker-widget">
        <div class="content">
          <div class="header">
            <div class="title">
              📰 News Ticker
            </div>
          </div>
          <div class="ticker-container">
            ${hasData ? `
              <div class="ticker-content">
                ${this.newsItems.map(item => `
                  <div class="news-item" title="${item.description}">
                    ${item.title}
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="loading-state">
                Loading news...
              </div>
            `}
          </div>
        </div>
        ${hasData ? `<div class="freshness-indicator"></div>` : ''}
        ${this.lastUpdate ? `<div class="last-update">${this.lastUpdate.toLocaleTimeString()}</div>` : ''}
      </div>
    `;

    // Add event listeners for hover pause
    if (this.config.pauseOnHover) {
      const tickerContent = this.shadowRoot.querySelector('.ticker-content');
      if (tickerContent) {
        tickerContent.addEventListener('mouseenter', () => {
          this.isPaused = true;
        });
        tickerContent.addEventListener('mouseleave', () => {
          this.isPaused = false;
        });
      }
    }
  }

  startScrolling() {
    // Scrolling is handled by CSS animation
    // This method can be used for future enhancements
  }

  stopScrolling() {
    // Stop any JavaScript-based scrolling if implemented
  }

  startRefreshTimer() {
    this.refreshTimer = setInterval(() => {
      this.loadNewsData();
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
    await this.loadNewsData();
  }

  destroy() {
    this.stopRefreshTimer();
    this.stopScrolling();
  }
}

customElements.define('news-widget', NewsTickerWidget); 