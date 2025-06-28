export class VideoPlayerWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      videoUrl: '', // Single video URL
      playlist: [], // Array of video objects {url, title, poster}
      autoplay: false,
      loop: false,
      muted: true,
      controls: true,
      poster: '', // Poster image URL
      currentIndex: 0,
      playlistAutoAdvance: true,
      ...this.config
    };
    this.videoElement = null;
  }

  connectedCallback() {
    // Override config with any passed configuration
    if (this.hasAttribute('config')) {
      try {
        const configAttr = JSON.parse(this.getAttribute('config'));
        this.config = { ...this.config, ...configAttr };
      } catch (e) {
        console.warn('VideoPlayerWidget: Invalid config attribute');
      }
    }

    this.render();
    this.setupVideoEvents();
  }

  disconnectedCallback() {
    this.cleanupVideoEvents();
  }

  getCurrentVideo() {
    if (this.config.playlist.length > 0) {
      return this.config.playlist[this.config.currentIndex];
    }
    return {
      url: this.config.videoUrl,
      title: 'Video',
      poster: this.config.poster
    };
  }

  nextVideo() {
    if (this.config.playlist.length > 0) {
      this.config.currentIndex = (this.config.currentIndex + 1) % this.config.playlist.length;
      this.updateVideo();
    }
  }

  previousVideo() {
    if (this.config.playlist.length > 0) {
      this.config.currentIndex = this.config.currentIndex === 0 
        ? this.config.playlist.length - 1 
        : this.config.currentIndex - 1;
      this.updateVideo();
    }
  }

  goToVideo(index) {
    if (index >= 0 && index < this.config.playlist.length) {
      this.config.currentIndex = index;
      this.updateVideo();
    }
  }

  updateVideo() {
    const currentVideo = this.getCurrentVideo();
    if (this.videoElement && currentVideo.url) {
      this.videoElement.src = currentVideo.url;
      if (currentVideo.poster) {
        this.videoElement.poster = currentVideo.poster;
      }
      this.videoElement.load();
    }
    this.updatePlaylistDisplay();
  }

  updatePlaylistDisplay() {
    const playlistItems = this.shadowRoot.querySelectorAll('.playlist-item');
    playlistItems.forEach((item, index) => {
      item.classList.toggle('active', index === this.config.currentIndex);
    });

    const playlistInfo = this.shadowRoot.querySelector('.playlist-info');
    if (playlistInfo && this.config.playlist.length > 0) {
      playlistInfo.textContent = `${this.config.currentIndex + 1}/${this.config.playlist.length}`;
    }
  }

  setupVideoEvents() {
    this.videoElement = this.shadowRoot.querySelector('.video-element');
    if (this.videoElement) {
      this.videoElement.addEventListener('ended', () => {
        if (this.config.playlistAutoAdvance && this.config.playlist.length > 1) {
          this.nextVideo();
        }
      });

      this.videoElement.addEventListener('error', (e) => {
        console.warn('VideoPlayerWidget: Video error', e);
        this.showError('Video failed to load');
      });
    }
  }

  cleanupVideoEvents() {
    if (this.videoElement) {
      this.videoElement.removeEventListener('ended', this.handleVideoEnded);
      this.videoElement.removeEventListener('error', this.handleVideoError);
    }
  }

  showError(message) {
    const errorDiv = this.shadowRoot.querySelector('.error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }

  render() {
    const currentVideo = this.getCurrentVideo();
    const hasPlaylist = this.config.playlist.length > 1;
    
    this.shadowRoot.innerHTML = `
      <style>
        .video-player-widget {
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #2d3436 0%, #636e72 100%);
          color: white;
          border-radius: 12px;
          padding: 1rem;
          height: 100%;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        .video-player-widget::before {
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
        
        .playlist-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .control-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          transition: background 0.2s;
        }
        
        .control-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .playlist-info {
          font-size: 0.8rem;
          opacity: 0.9;
        }
        
        .video-container {
          flex: 1;
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #000;
          display: flex;
          flex-direction: column;
        }
        
        .video-element {
          width: 100%;
          flex: 1;
          border-radius: 8px;
          background: #000;
        }
        
        .video-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          font-size: 1rem;
          text-align: center;
        }
        
        .error-message {
          display: none;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 0, 0, 0.8);
          color: white;
          padding: 1rem;
          border-radius: 4px;
          font-size: 0.9rem;
          text-align: center;
        }
        
        .playlist-sidebar {
          width: 200px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 0.5rem;
          margin-left: 1rem;
          overflow-y: auto;
        }
        
        .playlist-item {
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          margin-bottom: 0.3rem;
          transition: background 0.2s;
          border: 1px solid transparent;
        }
        
        .playlist-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .playlist-item.active {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }
        
        .playlist-item-title {
          font-weight: 500;
          margin-bottom: 0.2rem;
        }
        
        .playlist-item-duration {
          font-size: 0.7rem;
          opacity: 0.7;
        }
        
        .video-main {
          display: flex;
          flex: 1;
        }
        
        .video-content {
          flex: 1;
        }
      </style>
      <div class="video-player-widget">
        <div class="content">
          <div class="header">
            <div class="title">
              🎬 Video Player
            </div>
            ${hasPlaylist ? `
              <div class="playlist-controls">
                <button class="control-btn" onclick="this.getRootNode().host.previousVideo()">⏮️</button>
                <div class="playlist-info">${this.config.currentIndex + 1}/${this.config.playlist.length}</div>
                <button class="control-btn" onclick="this.getRootNode().host.nextVideo()">⏭️</button>
              </div>
            ` : ''}
          </div>
          <div class="video-main">
            <div class="video-content">
              <div class="video-container">
                ${currentVideo.url ? `
                  <video 
                    class="video-element"
                    ${this.config.controls ? 'controls' : ''}
                    ${this.config.autoplay ? 'autoplay' : ''}
                    ${this.config.loop ? 'loop' : ''}
                    ${this.config.muted ? 'muted' : ''}
                    ${currentVideo.poster ? `poster="${currentVideo.poster}"` : ''}
                    preload="metadata">
                    <source src="${currentVideo.url}" type="video/mp4">
                    <source src="${currentVideo.url}" type="video/webm">
                    <source src="${currentVideo.url}" type="video/ogg">
                    Your browser does not support the video tag.
                  </video>
                ` : `
                  <div class="video-placeholder">
                    <div>
                      <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎬</div>
                      <div>No video configured</div>
                    </div>
                  </div>
                `}
                <div class="error-message"></div>
              </div>
            </div>
            ${hasPlaylist ? `
              <div class="playlist-sidebar">
                ${this.config.playlist.map((video, index) => `
                  <div class="playlist-item ${index === this.config.currentIndex ? 'active' : ''}" 
                       onclick="this.getRootNode().host.goToVideo(${index})">
                    <div class="playlist-item-title">${video.title || `Video ${index + 1}`}</div>
                    <div class="playlist-item-duration">Click to play</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Widget contract methods
  init(config) {
    this.config = { ...this.config, ...config };
    this.render();
    this.setupVideoEvents();
  }

  refresh() {
    this.render();
    this.setupVideoEvents();
  }

  destroy() {
    this.cleanupVideoEvents();
  }
}

customElements.define('video-widget', VideoPlayerWidget); 