export class ImageSlideshowWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      images: [
        { url: 'https://picsum.photos/800/600?random=1', caption: 'Beautiful Landscape 1' },
        { url: 'https://picsum.photos/800/600?random=2', caption: 'Beautiful Landscape 2' },
        { url: 'https://picsum.photos/800/600?random=3', caption: 'Beautiful Landscape 3' }
      ],
      interval: 5, // seconds
      showCaptions: true,
      showControls: true,
      showIndicators: true,
      transition: 'fade', // 'fade', 'slide', 'none'
      autoplay: true,
      pauseOnHover: true,
      currentIndex: 0,
      ...this.config
    };
    this.slideshowTimer = null;
    this.isPaused = false;
  }

  connectedCallback() {
    // Override config with any passed configuration
    if (this.hasAttribute('config')) {
      try {
        const configAttr = JSON.parse(this.getAttribute('config'));
        this.config = { ...this.config, ...configAttr };
      } catch (e) {
        console.warn('ImageSlideshowWidget: Invalid config attribute');
      }
    }

    this.render();
    if (this.config.autoplay) {
      this.startSlideshow();
    }
  }

  disconnectedCallback() {
    this.stopSlideshow();
  }

  nextSlide() {
    if (this.config.images.length > 0) {
      this.config.currentIndex = (this.config.currentIndex + 1) % this.config.images.length;
      this.updateSlide();
    }
  }

  previousSlide() {
    if (this.config.images.length > 0) {
      this.config.currentIndex = this.config.currentIndex === 0 
        ? this.config.images.length - 1 
        : this.config.currentIndex - 1;
      this.updateSlide();
    }
  }

  goToSlide(index) {
    if (index >= 0 && index < this.config.images.length) {
      this.config.currentIndex = index;
      this.updateSlide();
    }
  }

  updateSlide() {
    const slideContainer = this.shadowRoot.querySelector('.slide-container');
    const indicators = this.shadowRoot.querySelectorAll('.indicator');
    const caption = this.shadowRoot.querySelector('.caption');
    
    if (!slideContainer) return;

    // Update slide position based on transition type
    if (this.config.transition === 'slide') {
      const translateX = -this.config.currentIndex * 100;
      slideContainer.style.transform = `translateX(${translateX}%)`;
    } else if (this.config.transition === 'fade') {
      const slides = slideContainer.querySelectorAll('.slide');
      slides.forEach((slide, index) => {
        slide.style.opacity = index === this.config.currentIndex ? '1' : '0';
      });
    }

    // Update indicators
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.config.currentIndex);
    });

    // Update caption
    if (caption && this.config.showCaptions) {
      const currentImage = this.config.images[this.config.currentIndex];
      caption.textContent = currentImage?.caption || '';
    }
  }

  startSlideshow() {
    if (this.config.images.length <= 1) return;
    
    this.slideshowTimer = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, this.config.interval * 1000);
  }

  stopSlideshow() {
    if (this.slideshowTimer) {
      clearInterval(this.slideshowTimer);
      this.slideshowTimer = null;
    }
  }

  pauseSlideshow() {
    this.isPaused = true;
  }

  resumeSlideshow() {
    this.isPaused = false;
  }

  render() {
    const hasImages = this.config.images && this.config.images.length > 0;
    const currentImage = hasImages ? this.config.images[this.config.currentIndex] : null;
    
    this.shadowRoot.innerHTML = `
      <style>
        .image-slideshow-widget {
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #6c5ce7 0%, #5f3dc4 100%);
          color: white;
          border-radius: 12px;
          padding: 1rem;
          height: 100%;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        .slideshow-container {
          flex: 1;
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #000;
        }
        
        .slide-container {
          display: flex;
          height: 100%;
          transition: transform 0.5s ease-in-out;
        }
        
        .slide {
          min-width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s ease-in-out;
        }
        
        .slide img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 4px;
        }
        
        .slide-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
          text-align: center;
        }
        
        .controls {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .slideshow-container:hover .controls {
          opacity: 1;
        }
        
        .controls:hover {
          background: rgba(0, 0, 0, 0.7);
        }
        
        .prev-btn {
          left: 1rem;
        }
        
        .next-btn {
          right: 1rem;
        }
        
        .indicators {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.5rem;
        }
        
        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .indicator.active {
          background: white;
        }
        
        .indicator:hover {
          background: rgba(255, 255, 255, 0.8);
        }
        
        .caption {
          position: absolute;
          bottom: 3rem;
          left: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.9rem;
          text-align: center;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .slideshow-container:hover .caption {
          opacity: 1;
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
        
        .slide-counter {
          font-size: 0.9rem;
          opacity: 0.8;
        }
      </style>
      <div class="image-slideshow-widget">
        <div class="header">
          <div class="title">
            🖼️ Slideshow
          </div>
          ${hasImages ? `
            <div class="slide-counter">${this.config.currentIndex + 1}/${this.config.images.length}</div>
          ` : ''}
        </div>
        <div class="slideshow-container" 
             ${this.config.pauseOnHover ? 'onmouseenter="this.getRootNode().host.pauseSlideshow()" onmouseleave="this.getRootNode().host.resumeSlideshow()"' : ''}>
          ${hasImages ? `
            <div class="slide-container">
              ${this.config.images.map((image, index) => `
                <div class="slide" style="opacity: ${index === this.config.currentIndex ? '1' : '0'}">
                  <img src="${image.url}" alt="${image.caption || 'Slide ' + (index + 1)}" loading="lazy">
                </div>
              `).join('')}
            </div>
            ${this.config.showControls && this.config.images.length > 1 ? `
              <button class="controls prev-btn" onclick="this.getRootNode().host.previousSlide()">‹</button>
              <button class="controls next-btn" onclick="this.getRootNode().host.nextSlide()">›</button>
            ` : ''}
            ${this.config.showIndicators && this.config.images.length > 1 ? `
              <div class="indicators">
                ${this.config.images.map((_, index) => `
                  <div class="indicator ${index === this.config.currentIndex ? 'active' : ''}" 
                       onclick="this.getRootNode().host.goToSlide(${index})"></div>
                `).join('')}
              </div>
            ` : ''}
            ${this.config.showCaptions && currentImage?.caption ? `
              <div class="caption">${currentImage.caption}</div>
            ` : ''}
          ` : `
            <div class="slide-placeholder">
              <div>
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🖼️</div>
                <div>No images configured</div>
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  }

  // Widget contract methods
  init(config) {
    this.config = { ...this.config, ...config };
    this.render();
    if (this.config.autoplay) {
      this.startSlideshow();
    }
  }

  refresh() {
    this.render();
  }

  destroy() {
    this.stopSlideshow();
  }
}

customElements.define('image-slideshow-widget', ImageSlideshowWidget); 