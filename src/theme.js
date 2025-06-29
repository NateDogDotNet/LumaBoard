/**
 * Theme Engine for LumaBoard
 * Handles theme loading, CSS variable generation, and dynamic theme application
 */
export class ThemeEngine {
  constructor() {
    this.currentTheme = null;
    this.cssVariables = new Map();
    this.styleSheet = null;
    this.presets = new Map();
    this.listeners = new Set();
    
    this.init();
  }

  /**
   * Initialize the theme engine
   */
  init() {
    this.loadBuiltinPresets();
    this.createStyleSheet();
    this.setupMediaQueryListeners();
    console.log('ThemeEngine: Initialized');
  }

  /**
   * Load built-in theme presets
   */
  loadBuiltinPresets() {
    // Light Theme
    this.presets.set('light', {
      name: 'Light Theme',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#0ea5e9',
        background: '#ffffff',
        surface: '#f8fafc',
        text: {
          primary: '#1e293b',
          secondary: '#64748b',
          muted: '#94a3b8'
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        }
      },
      typography: {
        fontFamily: {
          primary: "'Inter', system-ui, sans-serif",
          secondary: "'JetBrains Mono', monospace",
          display: "'Poppins', sans-serif"
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
      },
      animations: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms'
        },
        easing: {
          linear: 'linear',
          ease: 'ease',
          easeIn: 'ease-in',
          easeOut: 'ease-out',
          easeInOut: 'ease-in-out'
        }
      }
    });

    // Dark Theme
    this.presets.set('dark', {
      name: 'Dark Theme',
      extends: 'light',
      colors: {
        primary: '#3b82f6',
        secondary: '#6b7280',
        accent: '#06b6d4',
        background: '#0f172a',
        surface: '#1e293b',
        text: {
          primary: '#f1f5f9',
          secondary: '#cbd5e1',
          muted: '#64748b'
        },
        status: {
          success: '#22c55e',
          warning: '#eab308',
          error: '#f87171',
          info: '#60a5fa'
        }
      }
    });

    // Corporate Theme
    this.presets.set('corporate', {
      name: 'Corporate',
      extends: 'light',
      colors: {
        primary: '#1f2937',
        secondary: '#374151',
        accent: '#059669',
        background: '#ffffff',
        surface: '#f9fafb',
        text: {
          primary: '#111827',
          secondary: '#4b5563',
          muted: '#6b7280'
        }
      },
      typography: {
        fontFamily: {
          primary: "'Source Sans Pro', system-ui, sans-serif",
          display: "'Merriweather', serif"
        }
      }
    });

    // Vibrant Theme
    this.presets.set('vibrant', {
      name: 'Vibrant',
      extends: 'light',
      colors: {
        primary: '#7c3aed',
        secondary: '#ec4899',
        accent: '#f59e0b',
        background: '#fefefe',
        surface: '#faf5ff',
        text: {
          primary: '#581c87',
          secondary: '#7c2d92',
          muted: '#a855f7'
        }
      }
    });

    // High Contrast Theme
    this.presets.set('high-contrast', {
      name: 'High Contrast',
      colors: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#0066cc',
        background: '#ffffff',
        surface: '#f0f0f0',
        text: {
          primary: '#000000',
          secondary: '#333333',
          muted: '#666666'
        },
        status: {
          success: '#008000',
          warning: '#ff8800',
          error: '#cc0000',
          info: '#0066cc'
        }
      },
      typography: {
        fontFamily: {
          primary: 'Arial, sans-serif',
          secondary: 'Courier New, monospace'
        },
        fontWeight: {
          light: 400,
          normal: 600,
          medium: 700,
          semibold: 800,
          bold: 900
        }
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        md: '4px',
        lg: '6px',
        xl: '8px',
        full: '50%'
      }
    });

    // Minimal Theme
    this.presets.set('minimal', {
      name: 'Minimal',
      colors: {
        primary: '#000000',
        secondary: '#808080',
        accent: '#000000',
        background: '#ffffff',
        surface: '#ffffff',
        text: {
          primary: '#000000',
          secondary: '#404040',
          muted: '#808080'
        },
        status: {
          success: '#000000',
          warning: '#000000',
          error: '#000000',
          info: '#000000'
        }
      },
      typography: {
        fontFamily: {
          primary: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          secondary: "'Courier New', monospace"
        }
      },
      spacing: {
        xs: '0.125rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem'
      },
      borderRadius: {
        none: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        full: '0'
      },
      shadows: {
        sm: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none'
      }
    });

    console.log(`ThemeEngine: Loaded ${this.presets.size} built-in presets`);
  }

  /**
   * Create CSS stylesheet for theme variables
   */
  createStyleSheet() {
    this.styleSheet = document.createElement('style');
    this.styleSheet.id = 'lumaboard-theme-variables';
    document.head.appendChild(this.styleSheet);
  }

  /**
   * Setup media query listeners for responsive theming
   */
  setupMediaQueryListeners() {
    // Dark mode preference
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addListener((e) => {
      this.emit('system-theme-change', { prefersDark: e.matches });
    });

    // Reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addListener((e) => {
      this.emit('accessibility-change', { reducedMotion: e.matches });
    });
  }

  /**
   * Load and apply a theme
   */
  async loadTheme(themeConfig) {
    try {
      // Validate theme configuration
      const validatedTheme = this.validateTheme(themeConfig);
      
      // Resolve theme inheritance
      const resolvedTheme = this.resolveThemeInheritance(validatedTheme);
      
      // Generate CSS variables
      this.generateCSSVariables(resolvedTheme);
      
      // Apply theme to DOM
      this.applyTheme();
      
      // Update current theme
      this.currentTheme = resolvedTheme;
      
      // Emit theme change event
      this.emit('theme-changed', { theme: resolvedTheme });
      
      console.log(`ThemeEngine: Applied theme "${resolvedTheme.name || 'Custom'}"`);
      return resolvedTheme;
      
    } catch (error) {
      console.error('ThemeEngine: Failed to load theme:', error);
      throw error;
    }
  }

  /**
   * Load a built-in preset theme
   */
  async loadPreset(presetName) {
    const preset = this.presets.get(presetName);
    if (!preset) {
      throw new Error(`Theme preset "${presetName}" not found`);
    }
    
    return this.loadTheme(preset);
  }

  /**
   * Validate theme configuration
   */
  validateTheme(theme) {
    if (!theme || typeof theme !== 'object') {
      throw new Error('Theme must be an object');
    }

    // Ensure required sections exist
    const validated = {
      name: theme.name || 'Custom Theme',
      extends: theme.extends || null,
      colors: theme.colors || {},
      typography: theme.typography || {},
      spacing: theme.spacing || {},
      borderRadius: theme.borderRadius || {},
      shadows: theme.shadows || {},
      animations: theme.animations || {}
    };

    return validated;
  }

  /**
   * Resolve theme inheritance
   */
  resolveThemeInheritance(theme) {
    if (!theme.extends) {
      return theme;
    }

    const baseTheme = this.presets.get(theme.extends);
    if (!baseTheme) {
      console.warn(`ThemeEngine: Base theme "${theme.extends}" not found, ignoring inheritance`);
      return theme;
    }

    // Deep merge base theme with current theme
    return this.deepMerge(this.resolveThemeInheritance(baseTheme), theme);
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Generate CSS variables from theme
   */
  generateCSSVariables(theme) {
    this.cssVariables.clear();
    
    // Generate variables for each theme section
    this.generateVariablesFromObject(theme.colors, 'color');
    this.generateVariablesFromObject(theme.typography.fontFamily, 'font-family');
    this.generateVariablesFromObject(theme.typography.fontSize, 'font-size');
    this.generateVariablesFromObject(theme.typography.fontWeight, 'font-weight');
    this.generateVariablesFromObject(theme.typography.lineHeight, 'line-height');
    this.generateVariablesFromObject(theme.spacing, 'spacing');
    this.generateVariablesFromObject(theme.borderRadius, 'border-radius');
    this.generateVariablesFromObject(theme.shadows, 'shadow');
    this.generateVariablesFromObject(theme.animations.duration, 'duration');
    this.generateVariablesFromObject(theme.animations.easing, 'easing');
  }

  /**
   * Generate CSS variables from nested object
   */
  generateVariablesFromObject(obj, prefix, path = []) {
    for (const [key, value] of Object.entries(obj || {})) {
      const currentPath = [...path, key];
      const variableName = `--${prefix}-${currentPath.join('-')}`;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively handle nested objects
        this.generateVariablesFromObject(value, prefix, currentPath);
      } else {
        // Store the variable
        this.cssVariables.set(variableName, value);
      }
    }
  }

  /**
   * Apply theme variables to DOM
   */
  applyTheme() {
    if (!this.styleSheet) {
      this.createStyleSheet();
    }

    // Generate CSS text
    const cssText = `:root {\n${Array.from(this.cssVariables.entries())
      .map(([name, value]) => `  ${name}: ${value};`)
      .join('\n')}\n}`;

    // Apply to stylesheet
    this.styleSheet.textContent = cssText;
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Get available presets
   */
  getPresets() {
    return Array.from(this.presets.entries()).map(([key, theme]) => ({
      key,
      name: theme.name,
      description: this.getPresetDescription(key)
    }));
  }

  /**
   * Get preset description
   */
  getPresetDescription(presetKey) {
    const descriptions = {
      light: 'Clean, minimal design with light backgrounds',
      dark: 'Modern dark mode with high contrast',
      corporate: 'Professional business theme with muted colors',
      vibrant: 'Colorful, energetic theme for creative displays',
      'high-contrast': 'Accessibility-focused theme with high contrast',
      minimal: 'Ultra-clean design with minimal visual elements'
    };
    
    return descriptions[presetKey] || 'Custom theme preset';
  }

  /**
   * Get CSS variable value
   */
  getCSSVariable(name) {
    return this.cssVariables.get(name);
  }

  /**
   * Set CSS variable value
   */
  setCSSVariable(name, value) {
    this.cssVariables.set(name, value);
    this.applyTheme();
  }

  /**
   * Export current theme configuration
   */
  exportTheme() {
    if (!this.currentTheme) {
      throw new Error('No theme currently loaded');
    }
    
    return JSON.stringify(this.currentTheme, null, 2);
  }

  /**
   * Import theme from JSON string
   */
  async importTheme(jsonString) {
    try {
      const theme = JSON.parse(jsonString);
      return this.loadTheme(theme);
    } catch (error) {
      throw new Error(`Failed to import theme: ${error.message}`);
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    this.listeners.add({ event, callback });
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    this.listeners.forEach(listener => {
      if (listener.event === event && listener.callback === callback) {
        this.listeners.delete(listener);
      }
    });
  }

  /**
   * Emit event
   */
  emit(event, data) {
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        try {
          listener.callback(data);
        } catch (error) {
          console.error(`ThemeEngine: Error in event listener for "${event}":`, error);
        }
      }
    });
  }

  /**
   * Destroy theme engine
   */
  destroy() {
    // Remove stylesheet
    if (this.styleSheet && this.styleSheet.parentNode) {
      this.styleSheet.parentNode.removeChild(this.styleSheet);
    }

    // Clear data
    this.cssVariables.clear();
    this.presets.clear();
    this.listeners.clear();
    this.currentTheme = null;

    console.log('ThemeEngine: Destroyed');
  }
}

// Global theme engine instance
export const themeEngine = new ThemeEngine(); 