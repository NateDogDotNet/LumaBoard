/**
 * LumaBoard Sanitization Module
 * Comprehensive security sanitization for HTML, CSS, URLs and user inputs
 * Provides XSS prevention and configurable security levels
 */

class LumaSanitizer {
  constructor(options = {}) {
    this.options = {
      level: options.level || 'strict', // strict, moderate, permissive
      allowedProtocols: options.allowedProtocols || ['https', 'http', 'data'],
      allowedDomains: options.allowedDomains || [],
      logSanitization: options.logSanitization !== false,
      cacheResults: options.cacheResults !== false,
      ...options
    };
    
    this.cache = new Map();
    this.stats = {
      htmlSanitized: 0,
      cssSanitized: 0,
      urlsValidated: 0,
      threatsBlocked: 0
    };
    
    this.initializeAllowlists();
  }

  initializeAllowlists() {
    // HTML allowlists based on security level
    this.htmlAllowlists = {
      strict: {
        tags: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'strong', 'em', 'i', 'b', 'u'],
        attributes: ['class', 'id', 'title', 'data-*'],
        protocols: ['https']
      },
      moderate: {
        tags: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'strong', 'em', 'i', 'b', 'u', 
               'img', 'a', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody'],
        attributes: ['class', 'id', 'title', 'data-*', 'href', 'src', 'alt', 'width', 'height'],
        protocols: ['https', 'http']
      },
      permissive: {
        tags: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'strong', 'em', 'i', 'b', 'u',
               'img', 'a', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'video', 'audio'],
        attributes: ['class', 'id', 'title', 'data-*', 'href', 'src', 'alt', 'width', 'height', 'controls'],
        protocols: ['https', 'http', 'data']
      }
    };

    // CSS property allowlists
    this.cssAllowlists = {
      strict: [
        'color', 'background-color', 'font-size', 'font-family', 'font-weight', 'font-style',
        'text-align', 'text-decoration', 'margin', 'padding', 'border', 'border-radius',
        'width', 'height', 'display', 'visibility', 'opacity'
      ],
      moderate: [
        'color', 'background-color', 'background-image', 'font-size', 'font-family', 'font-weight', 'font-style',
        'text-align', 'text-decoration', 'text-shadow', 'margin', 'padding', 'border', 'border-radius',
        'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
        'display', 'position', 'top', 'left', 'right', 'bottom', 'z-index',
        'visibility', 'opacity', 'transform', 'transition', 'animation'
      ],
      permissive: [
        // Allow most CSS properties except dangerous ones
        'color', 'background', 'background-color', 'background-image', 'background-position', 'background-size',
        'font', 'font-size', 'font-family', 'font-weight', 'font-style', 'line-height',
        'text-align', 'text-decoration', 'text-shadow', 'text-transform',
        'margin', 'padding', 'border', 'border-radius', 'box-shadow',
        'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
        'display', 'position', 'top', 'left', 'right', 'bottom', 'z-index', 'float', 'clear',
        'visibility', 'opacity', 'overflow', 'transform', 'transition', 'animation',
        'flex', 'grid', 'align-items', 'justify-content'
      ]
    };

    // Blocked CSS properties (always dangerous)
    this.blockedCssProperties = [
      'behavior', 'binding', 'expression', 'filter', 'javascript', 'vbscript',
      'mozbinding', '-moz-binding', '-webkit-binding', 'content'
    ];

    // Blocked selectors
    this.blockedSelectors = [
      'body', 'html', 'head', 'script', 'style', 'link', 'meta', 'title'
    ];
  }

  /**
   * Sanitize HTML content with configurable security level
   */
  sanitizeHTML(html, options = {}) {
    if (!html || typeof html !== 'string') return '';
    
    const cacheKey = `html_${this.options.level}_${html}`;
    if (this.options.cacheResults && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const level = options.level || this.options.level;
    const allowlist = this.htmlAllowlists[level];
    
    try {
      // Create a temporary DOM element to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Recursively sanitize all elements
      const sanitized = this.sanitizeElement(tempDiv, allowlist);
      const result = sanitized.innerHTML;
      
      if (this.options.cacheResults) {
        this.cache.set(cacheKey, result);
      }
      
      this.stats.htmlSanitized++;
      if (result !== html) {
        this.stats.threatsBlocked++;
        this.log('HTML sanitized', { original: html, sanitized: result });
      }
      
      return result;
    } catch (error) {
      this.log('HTML sanitization error', error);
      return ''; // Return empty string on error
    }
  }

  /**
   * Recursively sanitize DOM elements
   */
  sanitizeElement(element, allowlist) {
    const sanitized = document.createElement('div');
    
    for (const child of Array.from(element.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        // Keep text nodes but escape HTML entities
        sanitized.appendChild(document.createTextNode(child.textContent));
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = child.tagName.toLowerCase();
        
        if (allowlist.tags.includes(tagName)) {
          const newElement = document.createElement(tagName);
          
          // Sanitize attributes
          for (const attr of Array.from(child.attributes)) {
            if (this.isAttributeAllowed(attr.name, attr.value, allowlist)) {
              newElement.setAttribute(attr.name, this.sanitizeAttributeValue(attr.value));
            }
          }
          
          // Recursively sanitize children
          const sanitizedChild = this.sanitizeElement(child, allowlist);
          newElement.innerHTML = sanitizedChild.innerHTML;
          
          sanitized.appendChild(newElement);
        } else {
          // Tag not allowed, but preserve children
          const sanitizedChild = this.sanitizeElement(child, allowlist);
          sanitized.innerHTML += sanitizedChild.innerHTML;
        }
      }
    }
    
    return sanitized;
  }

  /**
   * Check if attribute is allowed
   */
  isAttributeAllowed(name, value, allowlist) {
    const lowerName = name.toLowerCase();
    
    // Check for event handlers
    if (lowerName.startsWith('on')) return false;
    
    // Check for javascript: URLs
    if (lowerName === 'href' || lowerName === 'src') {
      if (value && value.toLowerCase().includes('javascript:')) return false;
    }
    
    // Check against allowlist
    return allowlist.attributes.some(allowed => {
      if (allowed.endsWith('*')) {
        return lowerName.startsWith(allowed.slice(0, -1));
      }
      return lowerName === allowed;
    });
  }

  /**
   * Sanitize attribute values
   */
  sanitizeAttributeValue(value) {
    if (!value) return value;
    
    // Remove potentially dangerous characters
    return value
      .replace(/[<>'"&]/g, match => {
        const entities = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
        return entities[match];
      })
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:text\/html/gi, '');
  }

  /**
   * Sanitize CSS content
   */
  sanitizeCSS(css, options = {}) {
    if (!css || typeof css !== 'string') return '';
    
    const cacheKey = `css_${this.options.level}_${css}`;
    if (this.options.cacheResults && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const level = options.level || this.options.level;
    const allowedProperties = this.cssAllowlists[level];
    
    try {
      let sanitized = css;
      
      // Remove dangerous CSS constructs
      sanitized = sanitized
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/expression\s*\(/gi, '')
        .replace(/@import\s+/gi, '')
        .replace(/behavior\s*:/gi, '')
        .replace(/binding\s*:/gi, '')
        .replace(/url\s*\(\s*javascript:/gi, '')
        .replace(/url\s*\(\s*data:text\/html/gi, '');
      
      // Parse and validate CSS rules
      sanitized = this.parseCSSRules(sanitized, allowedProperties);
      
      if (this.options.cacheResults) {
        this.cache.set(cacheKey, sanitized);
      }
      
      this.stats.cssSanitized++;
      if (sanitized !== css) {
        this.stats.threatsBlocked++;
        this.log('CSS sanitized', { original: css, sanitized });
      }
      
      return sanitized;
    } catch (error) {
      this.log('CSS sanitization error', error);
      return ''; // Return empty string on error
    }
  }

  /**
   * Parse and validate CSS rules
   */
  parseCSSRules(css, allowedProperties) {
    const rules = [];
    const ruleRegex = /([^{]+)\{([^}]*)\}/g;
    let match;
    
    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2].trim();
      
      // Validate selector
      if (!this.isValidSelector(selector)) continue;
      
      // Validate and sanitize declarations
      const sanitizedDeclarations = this.sanitizeDeclarations(declarations, allowedProperties);
      
      if (sanitizedDeclarations) {
        rules.push(`${selector} { ${sanitizedDeclarations} }`);
      }
    }
    
    return rules.join('\n');
  }

  /**
   * Validate CSS selector
   */
  isValidSelector(selector) {
    const cleanSelector = selector.toLowerCase().trim();
    
    // Block dangerous selectors
    for (const blocked of this.blockedSelectors) {
      if (cleanSelector.includes(blocked)) return false;
    }
    
    // Block selectors that could affect global scope
    if (cleanSelector.includes('*') && !cleanSelector.includes('.') && !cleanSelector.includes('#')) {
      return false;
    }
    
    return true;
  }

  /**
   * Sanitize CSS declarations
   */
  sanitizeDeclarations(declarations, allowedProperties) {
    const sanitizedDeclarations = [];
    const declarationRegex = /([^:]+):\s*([^;]+)/g;
    let match;
    
    while ((match = declarationRegex.exec(declarations)) !== null) {
      const property = match[1].trim().toLowerCase();
      const value = match[2].trim();
      
      // Check if property is blocked
      if (this.blockedCssProperties.includes(property)) continue;
      
      // Check if property is allowed
      if (!allowedProperties.includes(property)) continue;
      
      // Sanitize value
      const sanitizedValue = this.sanitizeCSSValue(value);
      if (sanitizedValue) {
        sanitizedDeclarations.push(`${property}: ${sanitizedValue}`);
      }
    }
    
    return sanitizedDeclarations.join('; ');
  }

  /**
   * Sanitize CSS property values
   */
  sanitizeCSSValue(value) {
    if (!value) return '';
    
    let sanitized = value;
    
    // Remove dangerous functions and URLs
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/url\s*\(\s*javascript:/gi, '')
      .replace(/url\s*\(\s*data:text\/html/gi, '');
    
    // Validate URLs in url() functions
    const urlRegex = /url\s*\(\s*['"]?([^'"]+)['"]?\s*\)/gi;
    sanitized = sanitized.replace(urlRegex, (match, url) => {
      if (this.isValidURL(url)) {
        return match;
      }
      return '';
    });
    
    return sanitized;
  }

  /**
   * Validate and sanitize URLs
   */
  sanitizeURL(url, options = {}) {
    if (!url || typeof url !== 'string') return '';
    
    const allowedProtocols = options.allowedProtocols || this.options.allowedProtocols;
    const allowedDomains = options.allowedDomains || this.options.allowedDomains;
    
    try {
      // Handle relative URLs
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        return url; // Allow relative URLs
      }
      
      // Handle data URLs
      if (url.startsWith('data:')) {
        return this.sanitizeDataURL(url);
      }
      
      // Parse absolute URLs
      const parsedURL = new URL(url);
      
      // Check protocol
      const protocol = parsedURL.protocol.slice(0, -1); // Remove trailing ':'
      if (!allowedProtocols.includes(protocol)) {
        this.log('Blocked URL with invalid protocol', { url, protocol });
        return '';
      }
      
      // Check domain if allowlist is specified
      if (allowedDomains.length > 0) {
        const hostname = parsedURL.hostname.toLowerCase();
        const isAllowed = allowedDomains.some(domain => 
          hostname === domain || hostname.endsWith(`.${domain}`)
        );
        
        if (!isAllowed) {
          this.log('Blocked URL with invalid domain', { url, hostname });
          return '';
        }
      }
      
      this.stats.urlsValidated++;
      return url;
    } catch (error) {
      this.log('Invalid URL format', { url, error: error.message });
      return '';
    }
  }

  /**
   * Validate URL (internal helper)
   */
  isValidURL(url) {
    return this.sanitizeURL(url) !== '';
  }

  /**
   * Sanitize data URLs
   */
  sanitizeDataURL(url) {
    const dataUrlRegex = /^data:([^;]+)(;base64)?,(.*)$/;
    const match = url.match(dataUrlRegex);
    
    if (!match) return '';
    
    const mimeType = match[1].toLowerCase();
    const isBase64 = match[2] === ';base64';
    
    // Allow only safe MIME types
    const allowedMimeTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml',
      'text/plain', 'application/json'
    ];
    
    if (!allowedMimeTypes.includes(mimeType)) {
      this.log('Blocked data URL with invalid MIME type', { url, mimeType });
      return '';
    }
    
    // Block HTML in data URLs
    if (mimeType.includes('html')) {
      this.log('Blocked HTML data URL', { url });
      return '';
    }
    
    return url;
  }

  /**
   * Validate configuration objects
   */
  validateConfig(config, schema = {}) {
    if (!config || typeof config !== 'object') return {};
    
    const validated = {};
    
    for (const [key, value] of Object.entries(config)) {
      if (schema[key]) {
        const fieldSchema = schema[key];
        
        // Type validation
        if (fieldSchema.type && typeof value !== fieldSchema.type) {
          this.log('Config validation: Invalid type', { key, expected: fieldSchema.type, actual: typeof value });
          continue;
        }
        
        // String sanitization
        if (typeof value === 'string') {
          if (fieldSchema.sanitize === 'html') {
            validated[key] = this.sanitizeHTML(value);
          } else if (fieldSchema.sanitize === 'css') {
            validated[key] = this.sanitizeCSS(value);
          } else if (fieldSchema.sanitize === 'url') {
            validated[key] = this.sanitizeURL(value);
          } else {
            validated[key] = this.escapeHTML(value);
          }
        } else {
          validated[key] = value;
        }
      } else {
        // Unknown field, apply basic sanitization if string
        if (typeof value === 'string') {
          validated[key] = this.escapeHTML(value);
        } else {
          validated[key] = value;
        }
      }
    }
    
    return validated;
  }

  /**
   * Escape HTML entities
   */
  escapeHTML(text) {
    if (!text || typeof text !== 'string') return text;
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Remove event handlers from elements
   */
  removeEventHandlers(element) {
    if (!element || !element.attributes) return element;
    
    const attributesToRemove = [];
    
    for (const attr of Array.from(element.attributes)) {
      if (attr.name.toLowerCase().startsWith('on')) {
        attributesToRemove.push(attr.name);
      }
    }
    
    attributesToRemove.forEach(attrName => {
      element.removeAttribute(attrName);
    });
    
    return element;
  }

  /**
   * Get sanitization statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Clear cache and reset stats
   */
  reset() {
    this.cache.clear();
    this.stats = {
      htmlSanitized: 0,
      cssSanitized: 0,
      urlsValidated: 0,
      threatsBlocked: 0
    };
  }

  /**
   * Log sanitization events
   */
  log(message, data = {}) {
    if (this.options.logSanitization) {
      console.log(`[LumaSanitizer] ${message}`, data);
    }
  }
}

// Create global sanitizer instance
const lumaSanitizer = new LumaSanitizer();

// Export functions for easy use
export const sanitizeHTML = (html, options) => lumaSanitizer.sanitizeHTML(html, options);
export const sanitizeCSS = (css, options) => lumaSanitizer.sanitizeCSS(css, options);
export const sanitizeURL = (url, options) => lumaSanitizer.sanitizeURL(url, options);
export const validateConfig = (config, schema) => lumaSanitizer.validateConfig(config, schema);
export const escapeHTML = (text) => lumaSanitizer.escapeHTML(text);
export const removeEventHandlers = (element) => lumaSanitizer.removeEventHandlers(element);

// Export class for advanced usage
export { LumaSanitizer };

// Export default instance
export default lumaSanitizer; 