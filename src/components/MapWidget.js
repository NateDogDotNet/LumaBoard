export class MapWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      latitude: 44.9778, // Minneapolis default
      longitude: -93.2650,
      zoom: 12,
      mapType: 'roadmap', // roadmap, satellite, hybrid, terrain
      showMarker: true,
      markerTitle: 'Location',
      showControls: true,
      showStreetView: false,
      markers: [], // Array of {lat, lng, title, description}
      apiKey: null, // Google Maps API key
      useOpenStreetMap: true, // Fallback to OSM if no API key
      ...this.config
    };
    this.mapContainer = null;
  }

  connectedCallback() {
    // Override config with any passed configuration
    if (this.hasAttribute('config')) {
      try {
        const configAttr = JSON.parse(this.getAttribute('config'));
        this.config = { ...this.config, ...configAttr };
      } catch (e) {
        console.warn('MapWidget: Invalid config attribute');
      }
    }

    this.render();
    this.initializeMap();
  }

  disconnectedCallback() {
    // Cleanup map resources if needed
  }

  async initializeMap() {
    if (this.config.apiKey && !this.config.useOpenStreetMap) {
      await this.initializeGoogleMaps();
    } else {
      this.initializeOpenStreetMap();
    }
  }

  async initializeGoogleMaps() {
    try {
      // Load Google Maps API
      if (!window.google) {
        await this.loadGoogleMapsAPI();
      }

      const mapContainer = this.shadowRoot.querySelector('.map-container');
      const map = new google.maps.Map(mapContainer, {
        center: { lat: this.config.latitude, lng: this.config.longitude },
        zoom: this.config.zoom,
        mapTypeId: this.config.mapType,
        disableDefaultUI: !this.config.showControls,
        streetViewControl: this.config.showStreetView
      });

      // Add main marker
      if (this.config.showMarker) {
        new google.maps.Marker({
          position: { lat: this.config.latitude, lng: this.config.longitude },
          map: map,
          title: this.config.markerTitle
        });
      }

      // Add additional markers
      this.config.markers.forEach(marker => {
        const mapMarker = new google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
          map: map,
          title: marker.title
        });

        if (marker.description) {
          const infoWindow = new google.maps.InfoWindow({
            content: `<div><strong>${marker.title}</strong><br>${marker.description}</div>`
          });

          mapMarker.addListener('click', () => {
            infoWindow.open(map, mapMarker);
          });
        }
      });

    } catch (error) {
      console.warn('MapWidget: Google Maps failed, falling back to OpenStreetMap', error);
      this.initializeOpenStreetMap();
    }
  }

  loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.config.apiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;

      window.initMap = () => {
        resolve();
        delete window.initMap;
      };

      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  initializeOpenStreetMap() {
    // Create a simple OpenStreetMap implementation
    const mapContainer = this.shadowRoot.querySelector('.map-container');
    
    // For demo purposes, we'll create a static map image using OpenStreetMap tile service
    // In a real implementation, you'd use Leaflet.js or similar
    this.createStaticMap(mapContainer);
  }

  createStaticMap(container) {
    const { latitude, longitude, zoom } = this.config;
    
    // Calculate tile coordinates
    const tileSize = 256;
    const scale = Math.pow(2, zoom);
    const worldSize = tileSize * scale;
    
    const x = Math.floor((longitude + 180) / 360 * scale);
    const y = Math.floor((1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2 * scale);
    
    // Create a grid of tiles
    const tilesPerRow = 2;
    const tilesPerCol = 2;
    
    container.innerHTML = `
      <div class="osm-map" style="position: relative; width: 100%; height: 100%; background: #aadaff;">
        <div class="map-tiles" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: grid; grid-template-columns: repeat(${tilesPerRow}, 1fr); grid-template-rows: repeat(${tilesPerCol}, 1fr);">
          ${Array.from({ length: tilesPerRow * tilesPerCol }, (_, i) => {
            const row = Math.floor(i / tilesPerRow);
            const col = i % tilesPerRow;
            const tileX = x + col - Math.floor(tilesPerRow / 2);
            const tileY = y + row - Math.floor(tilesPerCol / 2);
            
            return `
              <div class="map-tile" style="background: #f0f0f0; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #666;">
                <img src="https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png" 
                     style="width: 100%; height: 100%; object-fit: cover;" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     loading="lazy">
                <div style="display: none; flex-direction: column; align-items: center; text-align: center;">
                  <div>🗺️</div>
                  <div>Map Tile</div>
                  <div>${zoom}/${tileX}/${tileY}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${this.config.showMarker ? `
          <div class="marker" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); font-size: 1.5rem; z-index: 10;">
            📍
          </div>
        ` : ''}
        <div class="map-overlay" style="position: absolute; bottom: 0.5rem; left: 0.5rem; background: rgba(0,0,0,0.7); color: white; padding: 0.3rem 0.5rem; border-radius: 4px; font-size: 0.7rem;">
          ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
        </div>
      </div>
    `;
  }

  updateLocation(lat, lng) {
    this.config.latitude = lat;
    this.config.longitude = lng;
    this.initializeMap();
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.updateLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('MapWidget: Geolocation failed', error);
          this.showLocationError();
        }
      );
    } else {
      this.showLocationError();
    }
  }

  showLocationError() {
    const errorDiv = this.shadowRoot.querySelector('.location-error');
    if (errorDiv) {
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 3000);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .map-widget {
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #00cec9 0%, #00b894 100%);
          color: white;
          border-radius: 12px;
          padding: 1rem;
          height: 100%;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        .map-widget::before {
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
        
        .map-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .control-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          padding: 0.4rem 0.8rem;
          color: white;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .control-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .coordinates {
          font-size: 0.8rem;
          opacity: 0.9;
          font-family: monospace;
        }
        
        .map-container {
          flex: 1;
          border-radius: 8px;
          overflow: hidden;
          background: #f0f0f0;
          position: relative;
        }
        
        .map-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #e0e0e0;
          color: #666;
          font-size: 1rem;
          text-align: center;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .location-error {
          display: none;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 0, 0, 0.9);
          color: white;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          z-index: 100;
        }
        
        .map-info {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.3rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          z-index: 10;
        }
        
        .markers-info {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          opacity: 0.8;
        }
      </style>
      <div class="map-widget">
        <div class="content">
          <div class="header">
            <div class="title">
              🗺️ Map
            </div>
            <div class="map-controls">
              <div class="coordinates">${this.config.latitude.toFixed(4)}, ${this.config.longitude.toFixed(4)}</div>
              <button class="control-btn" onclick="this.getRootNode().host.getCurrentLocation()">
                📍 My Location
              </button>
            </div>
          </div>
          <div class="map-container">
            <div class="map-info">
              Zoom: ${this.config.zoom} | ${this.config.useOpenStreetMap ? 'OpenStreetMap' : 'Google Maps'}
            </div>
            <div class="location-error">
              <div>📍 Location access failed</div>
              <div style="font-size: 0.8rem; margin-top: 0.5rem;">Using default location</div>
            </div>
          </div>
          ${this.config.markers.length > 0 ? `
            <div class="markers-info">
              📍 ${this.config.markers.length} marker${this.config.markers.length !== 1 ? 's' : ''} on map
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Widget contract methods
  init(config) {
    this.config = { ...this.config, ...config };
    this.render();
    this.initializeMap();
  }

  refresh() {
    this.initializeMap();
  }

  destroy() {
    // Cleanup map resources
  }
}

customElements.define('map-widget', MapWidget); 