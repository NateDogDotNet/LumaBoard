/**
 * CSS Customizer for LumaBoard
 * Handles custom CSS injection with security sanitization and validation
 * Enhanced with comprehensive sanitization from sanitize.js module
 */

import { sanitizeCSS, LumaSanitizer } from '../sanitize.js';

export class CSSCustomizer {
  constructor() {
    this.customStyles = new Map();
    this.sanitizedCSS = '';
    this.styleSheet = null;
    this.allowedProperties = new Set();
    this.allowedValues = new Map();
    this.blockedSelectors = new Set();
    this.validators = new Map();
    
    // Initialize enhanced sanitizer
    this.sanitizer = new LumaSanitizer({
      level: 'moderate',
      logSanitization: true,
      cacheResults: true
    });
    
    this.init();
  }

  init() {
    this.setupAllowedProperties();
    this.setupValidators();
    this.createStyleSheet();
    console.log('CSSCustomizer: Initialized');
  }

  setupAllowedProperties() {
    // Layout properties
    this.allowedProperties.add('display');
    this.allowedProperties.add('position');
    this.allowedProperties.add('width');
    this.allowedProperties.add('height');
    this.allowedProperties.add('margin');
    this.allowedProperties.add('padding');
    this.allowedProperties.add('overflow');

    // Typography properties
    this.allowedProperties.add('font-family');
    this.allowedProperties.add('font-size');
    this.allowedProperties.add('font-weight');
    this.allowedProperties.add('color');
    this.allowedProperties.add('text-align');

    // Visual properties
    this.allowedProperties.add('background');
    this.allowedProperties.add('background-color');
    this.allowedProperties.add('border');
    this.allowedProperties.add('border-radius');
    this.allowedProperties.add('opacity');
    this.allowedProperties.add('box-shadow');

    // Animation properties
    this.allowedProperties.add('transition');
    this.allowedProperties.add('transform');

    // Blocked selectors for security
    this.blockedSelectors.add('*');
    this.blockedSelectors.add('html');
    this.blockedSelectors.add('body');
    this.blockedSelectors.add('script');
  }

  setupValidators() {
    this.validators.set('url', (value) => {
      const urlPattern = /url\(['"]?([^'"]+)['"]?\)/g;
      return value.replace(urlPattern, (match, url) => {
        if (url.startsWith('data:') || (!url.includes('://') && !url.startsWith('//'))) {
          return match;
        }
        return 'url("")';
      });
    });

    this.validators.set('color', (value) => {
      const colorPatterns = [
        /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
        /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
        /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[01]?\.?\d*\s*\)$/
      ];
      
      if (colorPatterns.some(pattern => pattern.test(value))) {
        return value;
      }
      return 'inherit';
    });
  }

  createStyleSheet() {
    this.styleSheet = document.createElement('style');
    this.styleSheet.id = 'lumaboard-custom-css';
    document.head.appendChild(this.styleSheet);
  }

  sanitizeCSS(cssString) {
    try {
      // Use enhanced sanitizer first for comprehensive security
      const preSanitized = this.sanitizer.sanitizeCSS(cssString, { level: 'moderate' });
      
      // Apply additional LumaBoard-specific sanitization
      const rules = this.parseCSS(preSanitized);
      const sanitizedRules = rules.map(rule => this.sanitizeRule(rule)).filter(Boolean);
      
      const result = sanitizedRules.join('\n');
      console.log('CSSCustomizer: CSS sanitized', { 
        original: cssString.length, 
        sanitized: result.length,
        stats: this.sanitizer.getStats()
      });
      
      return result;
    } catch (error) {
      console.error('CSSCustomizer: Failed to sanitize CSS:', error);
      return '';
    }
  }

  parseCSS(cssString) {
    const rules = [];
    const rulePattern = /([^{]+)\{([^}]+)\}/g;
    let match;

    while ((match = rulePattern.exec(cssString)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2].trim();
      
      rules.push({
        selector,
        declarations: this.parseDeclarations(declarations)
      });
    }

    return rules;
  }

  parseDeclarations(declarationsString) {
    const declarations = [];
    const parts = declarationsString.split(';');

    for (const part of parts) {
      const colonIndex = part.indexOf(':');
      if (colonIndex > 0) {
        const property = part.substring(0, colonIndex).trim();
        const value = part.substring(colonIndex + 1).trim();
        
        if (property && value) {
          declarations.push({ property, value });
        }
      }
    }

    return declarations;
  }

  sanitizeRule(rule) {
    if (!this.isSelectorSafe(rule.selector)) {
      console.warn(`CSSCustomizer: Blocked unsafe selector: ${rule.selector}`);
      return null;
    }

    const sanitizedDeclarations = rule.declarations
      .map(decl => this.sanitizeDeclaration(decl))
      .filter(Boolean);

    if (sanitizedDeclarations.length === 0) {
      return null;
    }

    const scopedSelector = this.scopeSelector(rule.selector);
    const declarationsString = sanitizedDeclarations
      .map(decl => `  ${decl.property}: ${decl.value};`)
      .join('\n');

    return `${scopedSelector} {\n${declarationsString}\n}`;
  }

  isSelectorSafe(selector) {
    for (const blocked of this.blockedSelectors) {
      if (selector.includes(blocked)) {
        return false;
      }
    }

    if (/\[data-|onclick|onload|javascript:/i.test(selector)) {
      return false;
    }

    return true;
  }

  scopeSelector(selector) {
    if (selector.startsWith('.lumaboard') || selector.startsWith('#lumaboard')) {
      return selector;
    }
    return `.lumaboard-container ${selector}`;
  }

  sanitizeDeclaration(declaration) {
    const { property, value } = declaration;

    if (!this.allowedProperties.has(property)) {
      console.warn(`CSSCustomizer: Blocked property: ${property}`);
      return null;
    }

    let sanitizedValue = this.sanitizeValue(property, value);

    if (property.includes('color') || property === 'background') {
      sanitizedValue = this.validators.get('color')(sanitizedValue);
    } else if (value.includes('url(')) {
      sanitizedValue = this.validators.get('url')(sanitizedValue);
    }

    return { property, value: sanitizedValue };
  }

  sanitizeValue(property, value) {
    let sanitized = value
      .replace(/javascript:/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/@import/gi, '')
      .replace(/<[^>]*>/g, '');

    return sanitized;
  }

  applyCustomCSS(cssString, id = 'default') {
    try {
      const sanitizedCSS = this.sanitizeCSS(cssString);
      this.customStyles.set(id, sanitizedCSS);
      this.updateStyleSheet();
      
      console.log(`CSSCustomizer: Applied custom CSS with ID "${id}"`);
      return { success: true, sanitizedCSS };
      
    } catch (error) {
      console.error('CSSCustomizer: Failed to apply custom CSS:', error);
      return { success: false, error: error.message };
    }
  }

  removeCustomCSS(id) {
    if (this.customStyles.has(id)) {
      this.customStyles.delete(id);
      this.updateStyleSheet();
      console.log(`CSSCustomizer: Removed custom CSS with ID "${id}"`);
      return true;
    }
    return false;
  }

  updateStyleSheet() {
    if (!this.styleSheet) {
      this.createStyleSheet();
    }

    const allCSS = Array.from(this.customStyles.values()).join('\n\n');
    this.styleSheet.textContent = allCSS;
    this.sanitizedCSS = allCSS;
  }

  applyWidgetStyles(widgetId, styles) {
    const selector = `.widget-container[data-widget-id="${widgetId}"]`;
    const declarations = Object.entries(styles)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');

    const cssString = `${selector} {\n${declarations}\n}`;
    return this.applyCustomCSS(cssString, `widget-${widgetId}`);
  }

  destroy() {
    if (this.styleSheet && this.styleSheet.parentNode) {
      this.styleSheet.parentNode.removeChild(this.styleSheet);
    }

    this.customStyles.clear();
    this.allowedProperties.clear();
    this.blockedSelectors.clear();
    this.validators.clear();

    console.log('CSSCustomizer: Destroyed');
  }
}

export const cssCustomizer = new CSSCustomizer();