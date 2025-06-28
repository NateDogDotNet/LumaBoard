export class YouTubeEmbedWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      videoId: 'dQw4w9WgXcQ', // Default video
      playlist: [], // Array of video IDs
      autoplay: false,
      loop: false,
      mute: true, // Muted by default for autoplay
      controls: true,
      showInfo: false,
      currentIndex: 0,
      playlistInterval: 300, // seconds between videos
      ...this.config
    };
    this.playlistTimer = null;
  }

  connectedCallback() {
    // Override config with any passed configuration
    if (this.hasAttribute('config')) {
      try {
        const configAttr = JSON.parse(this.getAttribute('config'));
        this.config = { ...this.config, ...configAttr };
      } catch (e) {
        console.warn('YouTubeEmbedWidget: Invalid config attribute');
      }
    }

    this.render();
    if (this.config.playlist.length > 0 && this.config.autoplay) {
      this.startPlaylistRotation();
    }
  }

  disconnectedCallback() {
    this.stopPlaylistRotation();
  }

  getCurrentVideoId() {
    if (this.config.playlist.length > 0) {
      return this.config.playlist[this.config.currentIndex];
    }
    return this.config.videoId;
  }

  getEmbedUrl() {
    const videoId = this.getCurrentVideoId();
    const params = new URLSearchParams({
      autoplay: this.config.autoplay ? '1' : '0',
      loop: this.config.loop ? '1' : '0',
      mute: this.config.mute ? '1' : '0',
      controls: this.config.controls ? '1' : '0',
      showinfo: this.config.showInfo ? '1' : '0',
      rel: '0', // Don't show related videos
      modestbranding: '1', // Modest branding
      iv_load_policy: '3' // Hide annotations
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  nextVideo() {
    if (this.config.playlist.length > 0) {
      this.config.currentIndex = (this.config.currentIndex + 1) % this.config.playlist.length;
      this.render();
    }
  }

  previousVideo() {
    if (this.config.playlist.length > 0) {
      this.config.currentIndex = this.config.currentIndex === 0 
        ? this.config.playlist.length - 1 
        : this.config.currentIndex - 1;
      this.render();
    }
  }

  startPlaylistRotation() {
    if (this.config.playlist.length <= 1) return;
    
    this.playlistTimer = setInterval(() => {
      this.nextVideo();
    }, this.config.playlistInterval * 1000);
  }

  stopPlaylistRotation() {
    if (this.playlistTimer) {
      clearInterval(this.playlistTimer);
      this.playlistTimer = null;
    }
  }

  render() {
    const embedUrl = this.getEmbedUrl();
    const hasPlaylist = this.config.playlist.length > 1;
    const currentVideoId = this.getCurrentVideoId();
    
    this.shadowRoot.innerHTML = `
      <style>
        .youtube-embed-widget {
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
          color: white;
          border-radius: 12px;
          padding: 1rem;
          height: 100%;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        .youtube-embed-widget::before {
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
        }
        
        .video-iframe {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 8px;
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
        
        .video-info {
          position: absolute;
          bottom: 0.5rem;
          left: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.3rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .video-container:hover .video-info {
          opacity: 1;
        }
      </style>
      <div class="youtube-embed-widget">
        <div class="content">
          <div class="header">
            <div class="title">
              📺 YouTube
            </div>
            ${hasPlaylist ? `
              <div class="playlist-controls">
                <button class="control-btn" onclick="this.getRootNode().host.previousVideo()">⏮️</button>
                <div class="playlist-info">${this.config.currentIndex + 1}/${this.config.playlist.length}</div>
                <button class="control-btn" onclick="this.getRootNode().host.nextVideo()">⏭️</button>
              </div>
            ` : ''}
          </div>
          <div class="video-container">
            ${currentVideoId ? `
              <iframe 
                class="video-iframe"
                src="${embedUrl}"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen>
              </iframe>
              <div class="video-info">
                Video ID: ${currentVideoId}
              </div>
            ` : `
              <div class="video-placeholder">
                <div>
                  <div style="font-size: 2rem; margin-bottom: 0.5rem;">📺</div>
                  <div>No video configured</div>
                </div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  // Widget contract methods
  init(config) {
    this.config = { ...this.config, ...config };
    this.render();
  }

  refresh() {
    this.render();
  }

  destroy() {
    this.stopPlaylistRotation();
  }
}

customElements.define('youtube-widget', YouTubeEmbedWidget); 