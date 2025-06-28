export class QRCodeWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      data: 'https://example.com',
      size: 200,
      errorCorrectionLevel: 'M', // L, M, Q, H
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      title: 'QR Code',
      showTitle: true,
      showData: true,
      dataType: 'url', // 'url', 'text', 'wifi', 'email', 'phone', 'sms'
      ...this.config
    };
  }

  connectedCallback() {
    // Override config with any passed configuration
    if (this.hasAttribute('config')) {
      try {
        const configAttr = JSON.parse(this.getAttribute('config'));
        this.config = { ...this.config, ...configAttr };
      } catch (e) {
        console.warn('QRCodeWidget: Invalid config attribute');
      }
    }

    this.render();
  }

  generateQRCode() {
    // Simple QR code generation using a library-free approach
    // In a real implementation, you'd use a QR code library like qrcode.js
    // For demo purposes, we'll create a placeholder pattern
    
    const canvas = this.shadowRoot.querySelector('.qr-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = this.config.size;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = this.config.backgroundColor;
    ctx.fillRect(0, 0, size, size);

    // Generate a simple pattern (not a real QR code)
    // In production, use a proper QR code library
    this.generateQRPattern(ctx, size);
  }

  generateQRPattern(ctx, size) {
    const moduleSize = Math.floor(size / 25); // 25x25 grid
    ctx.fillStyle = this.config.foregroundColor;

    // Create a simple pattern that looks like a QR code
    const pattern = this.createQRPattern();
    
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        if (pattern[row] && pattern[row][col]) {
          ctx.fillRect(
            col * moduleSize,
            row * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  }

  createQRPattern() {
    // Create a pattern that resembles a QR code
    const pattern = Array(25).fill().map(() => Array(25).fill(false));
    
    // Add finder patterns (corners)
    this.addFinderPattern(pattern, 0, 0);
    this.addFinderPattern(pattern, 0, 18);
    this.addFinderPattern(pattern, 18, 0);
    
    // Add timing patterns
    for (let i = 8; i < 17; i++) {
      pattern[6][i] = i % 2 === 0;
      pattern[i][6] = i % 2 === 0;
    }
    
    // Add some data pattern based on the input
    const dataHash = this.simpleHash(this.config.data);
    for (let row = 9; row < 17; row++) {
      for (let col = 9; col < 17; col++) {
        pattern[row][col] = ((row + col + dataHash) % 3) === 0;
      }
    }
    
    return pattern;
  }

  addFinderPattern(pattern, startRow, startCol) {
    // 7x7 finder pattern
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const r = startRow + row;
        const c = startCol + col;
        if (r < 25 && c < 25) {
          // Outer border
          if (row === 0 || row === 6 || col === 0 || col === 6) {
            pattern[r][c] = true;
          }
          // Inner square
          else if (row >= 2 && row <= 4 && col >= 2 && col <= 4) {
            pattern[r][c] = true;
          }
        }
      }
    }
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  formatDataForDisplay() {
    const data = this.config.data;
    
    switch (this.config.dataType) {
      case 'url':
        return data.length > 40 ? data.substring(0, 37) + '...' : data;
      case 'email':
        return `📧 ${data}`;
      case 'phone':
        return `📞 ${data}`;
      case 'wifi':
        return `📶 WiFi Network`;
      case 'sms':
        return `💬 SMS`;
      default:
        return data.length > 50 ? data.substring(0, 47) + '...' : data;
    }
  }

  getDataTypeIcon() {
    switch (this.config.dataType) {
      case 'url': return '🌐';
      case 'email': return '📧';
      case 'phone': return '📞';
      case 'wifi': return '📶';
      case 'sms': return '💬';
      case 'text': return '📝';
      default: return '📱';
    }
  }

  render() {
    const displayData = this.formatDataForDisplay();
    const icon = this.getDataTypeIcon();
    
    this.shadowRoot.innerHTML = `
      <style>
        .qr-code-widget {
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
          color: white;
          border-radius: 12px;
          padding: 1.5rem;
          height: 100%;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        .qr-code-widget::before {
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
          align-items: center;
        }
        
        .header {
          text-align: center;
          margin-bottom: 1.5rem;
          width: 100%;
        }
        
        .title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .qr-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .qr-code-display {
          background: white;
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          position: relative;
        }
        
        .qr-canvas {
          display: block;
          border-radius: 4px;
        }
        
        .qr-placeholder {
          width: 200px;
          height: 200px;
          background: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          color: #666;
          text-align: center;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .data-display {
          text-align: center;
          width: 100%;
        }
        
        .data-type {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 0.3rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
        }
        
        .data-content {
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          word-break: break-all;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .controls {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
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
        }
        
        .control-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .size-info {
          position: absolute;
          top: -0.5rem;
          right: -0.5rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.7rem;
        }
      </style>
      <div class="qr-code-widget">
        <div class="content">
          ${this.config.showTitle ? `
            <div class="header">
              <div class="title">
                ${icon} ${this.config.title}
              </div>
            </div>
          ` : ''}
          
          <div class="qr-container">
            <div class="qr-code-display">
              <canvas class="qr-canvas"></canvas>
              <div class="size-info">${this.config.size}×${this.config.size}</div>
            </div>
          </div>
          
          ${this.config.showData ? `
            <div class="data-display">
              <div class="data-type">${this.config.dataType}</div>
              <div class="data-content">${displayData}</div>
            </div>
          ` : ''}
          
          <div class="controls">
            <button class="control-btn" onclick="this.getRootNode().host.regenerateQRCode()">
              🔄 Regenerate
            </button>
            <button class="control-btn" onclick="this.getRootNode().host.downloadQRCode()">
              💾 Download
            </button>
          </div>
        </div>
      </div>
    `;

    // Generate QR code after rendering
    setTimeout(() => this.generateQRCode(), 0);
  }

  regenerateQRCode() {
    this.generateQRCode();
  }

  downloadQRCode() {
    const canvas = this.shadowRoot.querySelector('.qr-canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  }

  // Widget contract methods
  init(config) {
    this.config = { ...this.config, ...config };
    this.render();
  }

  refresh() {
    this.generateQRCode();
  }

  destroy() {
    // No cleanup needed for QR code
  }
}

customElements.define('qrcode-widget', QRCodeWidget); 