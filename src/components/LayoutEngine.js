/**
 * Layout Engine for LumaBoard
 * Handles responsive grid layouts, widget positioning, and layout DSL parsing
 */
export class LayoutEngine {
  constructor() {
    this.layouts = new Map();
    this.currentLayout = null;
    this.breakpoints = {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400
    };
    this.currentBreakpoint = 'xl';
    this.gridContainer = null;
    this.widgets = new Map();
    this.observers = new Set();
    this.resizeObserver = null;
    
    this.init();
  }

  init() {
    this.setupResizeObserver();
    this.setupBreakpointListeners();
    this.loadBuiltinLayouts();
    console.log('LayoutEngine: Initialized');
  }

  setupResizeObserver() {
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === document.body) {
            this.handleResize(entry.contentRect.width, entry.contentRect.height);
          }
        }
      });
      
      this.resizeObserver.observe(document.body);
    } else {
      window.addEventListener('resize', () => {
        this.handleResize(window.innerWidth, window.innerHeight);
      });
    }
  }

  setupBreakpointListeners() {
    Object.entries(this.breakpoints).forEach(([name, width]) => {
      const mediaQuery = window.matchMedia(`(min-width: ${width}px)`);
      mediaQuery.addListener(() => this.updateCurrentBreakpoint());
    });
    
    this.updateCurrentBreakpoint();
  }

  updateCurrentBreakpoint() {
    const width = window.innerWidth;
    let currentBreakpoint = 'xs';
    
    for (const [name, minWidth] of Object.entries(this.breakpoints)) {
      if (width >= minWidth) {
        currentBreakpoint = name;
      }
    }
    
    if (this.currentBreakpoint !== currentBreakpoint) {
      const oldBreakpoint = this.currentBreakpoint;
      this.currentBreakpoint = currentBreakpoint;
      this.emit('breakpoint-changed', { 
        from: oldBreakpoint, 
        to: currentBreakpoint,
        width 
      });
      
      if (this.currentLayout) {
        this.applyLayout(this.currentLayout);
      }
    }
  }

  loadBuiltinLayouts() {
    // Full Screen Layout
    this.layouts.set('fullscreen', {
      name: 'Full Screen',
      description: 'Single widget fills entire screen',
      dsl: `
        grid: 1x1
        widget main at 1,1 span 1,1
      `,
      config: {
        type: 'grid',
        columns: 1,
        rows: 1,
        gap: '0px',
        widgets: [{
          id: 'main',
          x: 0,
          y: 0,
          width: 1,
          height: 1
        }]
      }
    });

    // Dashboard Layout
    this.layouts.set('dashboard', {
      name: 'Dashboard',
      description: 'Classic dashboard with header and grid',
      dsl: `
        grid: 12x8 gap 16px
        
        # Header section
        widget header at 1,1 span 12,1
        
        # Main content area
        widget main-left at 1,2 span 6,4
        widget main-right at 7,2 span 6,4
        
        # Bottom widgets
        widget bottom-1 at 1,6 span 3,3
        widget bottom-2 at 4,6 span 3,3
        widget bottom-3 at 7,6 span 3,3
        widget bottom-4 at 10,6 span 3,3
      `,
      responsive: {
        md: `
          grid: 6x12 gap 12px
          widget header at 1,1 span 6,1
          widget main-left at 1,2 span 6,4
          widget main-right at 1,6 span 6,4
          widget bottom-1 at 1,10 span 3,3
          widget bottom-2 at 4,10 span 3,3
          widget bottom-3 at 1,13 span 3,3
          widget bottom-4 at 4,13 span 3,3
        `,
        sm: `
          grid: 2x20 gap 8px
          widget header at 1,1 span 2,1
          widget main-left at 1,2 span 2,4
          widget main-right at 1,6 span 2,4
          widget bottom-1 at 1,10 span 2,3
          widget bottom-2 at 1,13 span 2,3
          widget bottom-3 at 1,16 span 2,3
          widget bottom-4 at 1,19 span 2,3
        `
      }
    });

    // Sidebar Layout
    this.layouts.set('sidebar', {
      name: 'Sidebar',
      description: 'Layout with left sidebar and main content',
      dsl: `
        grid: 16x10 gap 16px
        
        # Sidebar
        widget sidebar at 1,1 span 4,10
        
        # Main content
        widget main at 5,1 span 12,6
        
        # Bottom bar
        widget bottom at 5,7 span 12,4
      `,
      responsive: {
        md: `
          grid: 1x16 gap 12px
          widget sidebar at 1,1 span 1,4
          widget main at 1,5 span 1,8
          widget bottom at 1,13 span 1,4
        `
      }
    });

    // Split Screen Layout
    this.layouts.set('split', {
      name: 'Split Screen',
      description: 'Two equal content areas',
      dsl: `
        grid: 2x1 gap 16px
        
        widget left at 1,1 span 1,1
        widget right at 2,1 span 1,1
      `,
      responsive: {
        md: `
          grid: 1x2 gap 16px
          widget left at 1,1 span 1,1
          widget right at 1,2 span 1,1
        `
      }
    });

    console.log(`LayoutEngine: Loaded ${this.layouts.size} built-in layouts`);
  }

  parseLayoutDSL(dsl) {
    const lines = dsl.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    const config = {
      type: 'grid',
      columns: 12,
      rows: 8,
      gap: '16px',
      widgets: []
    };

    for (const line of lines) {
      if (line.startsWith('grid:')) {
        this.parseGridDefinition(line, config);
      } else if (line.startsWith('widget')) {
        this.parseWidgetDefinition(line, config);
      }
    }

    return config;
  }

  parseGridDefinition(line, config) {
    const match = line.match(/grid:\s*(\d+)x(\d+)(?:\s+gap\s+([^$]+))?/);
    if (match) {
      config.columns = parseInt(match[1]);
      config.rows = parseInt(match[2]);
      if (match[3]) {
        config.gap = match[3].trim();
      }
    }
  }

  parseWidgetDefinition(line, config) {
    const match = line.match(/widget\s+([^\s]+)\s+at\s+(\d+),(\d+)\s+span\s+(\d+),(\d+)/);
    if (match) {
      config.widgets.push({
        id: match[1],
        x: parseInt(match[2]) - 1,
        y: parseInt(match[3]) - 1,
        width: parseInt(match[4]),
        height: parseInt(match[5])
      });
    }
  }

  async applyLayout(layoutId, options = {}) {
    try {
      let layout;
      
      if (typeof layoutId === 'string') {
        layout = this.layouts.get(layoutId);
        if (!layout) {
          throw new Error(`Layout "${layoutId}" not found`);
        }
      } else {
        layout = layoutId;
      }

      let config = layout.config;
      if (!config && layout.dsl) {
        if (layout.responsive && layout.responsive[this.currentBreakpoint]) {
          config = this.parseLayoutDSL(layout.responsive[this.currentBreakpoint]);
        } else {
          config = this.parseLayoutDSL(layout.dsl);
        }
      }

      await this.applyLayoutConfig(config, options);
      
      this.currentLayout = layoutId;
      this.emit('layout-applied', { layout: layoutId, config });
      
      console.log(`LayoutEngine: Applied layout "${layout.name || layoutId}"`);
      
    } catch (error) {
      console.error('LayoutEngine: Failed to apply layout:', error);
      throw error;
    }
  }

  async applyLayoutConfig(config, options = {}) {
    this.createGridContainer(config);
    await this.positionWidgets(config.widgets, options);
  }

  createGridContainer(config) {
    let container = document.getElementById('lumaboard-layout-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'lumaboard-layout-container';
      container.className = 'lumaboard-layout-container';
      
      const parent = document.querySelector('main') || document.body;
      parent.appendChild(container);
    }

    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${config.columns}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
    container.style.gap = config.gap || '16px';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.padding = config.padding || '0';
    container.style.margin = '0';
    container.style.boxSizing = 'border-box';

    this.gridContainer = container;
  }

  async positionWidgets(widgetConfigs, options = {}) {
    if (!this.gridContainer) {
      throw new Error('Grid container not initialized');
    }

    const existingWidgets = this.gridContainer.querySelectorAll('.widget-container');
    existingWidgets.forEach(widget => widget.remove());

    for (const widgetConfig of widgetConfigs) {
      const container = this.createWidgetContainer(widgetConfig);
      this.gridContainer.appendChild(container);
      
      this.widgets.set(widgetConfig.id, {
        config: widgetConfig,
        container: container,
        mounted: false
      });

      this.emit('widget-positioned', { 
        widgetId: widgetConfig.id, 
        config: widgetConfig,
        container 
      });
    }
  }

  createWidgetContainer(config) {
    const container = document.createElement('div');
    container.className = 'widget-container';
    container.id = `widget-${config.id}`;
    container.dataset.widgetId = config.id;

    container.style.gridColumn = `${config.x + 1} / span ${config.width}`;
    container.style.gridRow = `${config.y + 1} / span ${config.height}`;
    
    container.style.overflow = 'hidden';
    container.style.position = 'relative';
    container.style.backgroundColor = 'var(--color-surface, #f8fafc)';
    container.style.borderRadius = 'var(--border-radius-md, 0.5rem)';
    container.style.border = '1px solid var(--color-secondary, #e2e8f0)';

    if (config.resizable !== false) {
      this.addResizeHandle(container);
    }

    return container;
  }

  addResizeHandle(container) {
    const handle = document.createElement('div');
    handle.className = 'widget-resize-handle';
    handle.style.position = 'absolute';
    handle.style.bottom = '0';
    handle.style.right = '0';
    handle.style.width = '12px';
    handle.style.height = '12px';
    handle.style.cursor = 'nw-resize';
    handle.style.backgroundColor = 'var(--color-secondary, #64748b)';
    handle.style.opacity = '0.3';
    handle.style.transition = 'opacity 0.2s';
    
    container.addEventListener('mouseenter', () => {
      handle.style.opacity = '0.7';
    });
    
    container.addEventListener('mouseleave', () => {
      handle.style.opacity = '0.3';
    });

    container.appendChild(handle);
  }

  handleResize(width, height) {
    this.emit('resize', { width, height });
    this.updateCurrentBreakpoint();
  }

  getWidgetContainer(widgetId) {
    const widget = this.widgets.get(widgetId);
    return widget ? widget.container : null;
  }

  getCurrentLayout() {
    return this.currentLayout;
  }

  getAvailableLayouts() {
    return Array.from(this.layouts.entries()).map(([key, layout]) => ({
      key,
      name: layout.name,
      description: layout.description,
      hasResponsive: !!layout.responsive
    }));
  }

  createCustomLayout(name, dsl, options = {}) {
    const layout = {
      name,
      description: options.description || 'Custom layout',
      dsl,
      responsive: options.responsive || null
    };

    this.layouts.set(`custom-${name.toLowerCase().replace(/\s+/g, '-')}`, layout);
    
    console.log(`LayoutEngine: Created custom layout "${name}"`);
    return layout;
  }

  exportLayoutDSL(layoutId) {
    const layout = this.layouts.get(layoutId);
    if (!layout) {
      throw new Error(`Layout "${layoutId}" not found`);
    }
    
    return layout.dsl;
  }

  importLayoutDSL(name, dsl) {
    return this.createCustomLayout(name, dsl);
  }

  on(event, callback) {
    this.observers.add({ event, callback });
  }

  off(event, callback) {
    this.observers.forEach(observer => {
      if (observer.event === event && observer.callback === callback) {
        this.observers.delete(observer);
      }
    });
  }

  emit(event, data) {
    this.observers.forEach(observer => {
      if (observer.event === event) {
        try {
          observer.callback(data);
        } catch (error) {
          console.error(`LayoutEngine: Error in event listener for "${event}":`, error);
        }
      }
    });
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.gridContainer && this.gridContainer.parentNode) {
      this.gridContainer.parentNode.removeChild(this.gridContainer);
    }

    this.layouts.clear();
    this.widgets.clear();
    this.observers.clear();
    this.currentLayout = null;
    this.gridContainer = null;

    console.log('LayoutEngine: Destroyed');
  }
}

export const layoutEngine = new LayoutEngine();
