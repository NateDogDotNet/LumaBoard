/**
 * Theme Manager for LumaBoard
 * Provides visual interface for theme customization, layout management, and CSS editing
 */
import { themeEngine } from '../theme.js';
import { layoutEngine } from './LayoutEngine.js';
import { cssCustomizer } from './CSSCustomizer.js';

export class ThemeManager {
  constructor() {
    this.isVisible = false;
    this.container = null;
    this.activeTab = 'themes';
    this.previewMode = false;
    this.originalTheme = null;
    this.listeners = new Set();
    this.initialized = false;
    
    // Don't initialize immediately - wait for explicit call
  }

  init() {
    if (this.initialized) return;
    
    // Only initialize if DOM is ready
    if (document.body) {
      this.createContainer();
      this.setupKeyboardShortcuts();
      this.setupEventListeners();
      this.initialized = true;
      console.log('ThemeManager: Initialized');
    } else {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.init();
        });
      } else {
        // DOM is ready but body doesn't exist yet, wait a bit
        setTimeout(() => {
          this.init();
        }, 100);
      }
    }
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'lumaboard-theme-manager';
    this.container.className = 'theme-manager';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(10px);
      border-left: 1px solid rgba(148, 163, 184, 0.2);
      z-index: 10000;
      transition: right 0.3s ease;
      font-family: 'Inter', system-ui, sans-serif;
      color: #f1f5f9;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    this.createHeader();
    this.createTabs();
    this.createContent();
    this.createFooter();

    document.body.appendChild(this.container);
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'theme-manager-header';
    header.style.cssText = `
      padding: 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
      background: rgba(30, 41, 59, 0.5);
    `;

    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Theme Manager</h2>
        <button id="theme-manager-close" style="
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 20px;
          padding: 4px;
        ">×</button>
      </div>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #cbd5e1;">
        Customize themes, layouts, and styles
      </p>
    `;

    this.container.appendChild(header);

    header.querySelector('#theme-manager-close').addEventListener('click', () => {
      this.hide();
    });
  }

  createTabs() {
    const tabContainer = document.createElement('div');
    tabContainer.className = 'theme-manager-tabs';
    tabContainer.style.cssText = `
      display: flex;
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    `;

    const tabs = [
      { id: 'themes', label: 'Themes', icon: '🎨' },
      { id: 'layouts', label: 'Layouts', icon: '📐' },
      { id: 'custom-css', label: 'Custom CSS', icon: '💅' },
      { id: 'export', label: 'Export', icon: '📤' }
    ];

    tabs.forEach(tab => {
      const tabButton = document.createElement('button');
      tabButton.className = 'theme-manager-tab';
      tabButton.dataset.tab = tab.id;
      tabButton.style.cssText = `
        flex: 1;
        padding: 12px 8px;
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
        border-bottom: 2px solid transparent;
      `;

      tabButton.innerHTML = `
        <div>${tab.icon}</div>
        <div style="margin-top: 4px;">${tab.label}</div>
      `;

      tabButton.addEventListener('click', () => {
        this.switchTab(tab.id);
      });

      tabContainer.appendChild(tabButton);
    });

    this.container.appendChild(tabContainer);
    this.updateTabStyles();
  }

  createContent() {
    const content = document.createElement('div');
    content.className = 'theme-manager-content';
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 0;
    `;

    const tabs = ['themes', 'layouts', 'custom-css', 'export'];
    tabs.forEach(tabId => {
      const tabContent = document.createElement('div');
      tabContent.id = `tab-${tabId}`;
      tabContent.className = 'tab-content';
      tabContent.style.cssText = `
        display: ${tabId === this.activeTab ? 'block' : 'none'};
        padding: 20px;
        height: 100%;
        box-sizing: border-box;
      `;

      content.appendChild(tabContent);
    });

    this.container.appendChild(content);
    this.initializeTabContent();
  }

  createFooter() {
    const footer = document.createElement('div');
    footer.className = 'theme-manager-footer';
    footer.style.cssText = `
      padding: 16px 20px;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      background: rgba(30, 41, 59, 0.5);
    `;

    footer.innerHTML = `
      <div style="display: flex; gap: 8px;">
        <button id="preview-toggle" style="
          flex: 1;
          padding: 8px 12px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60a5fa;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        ">Preview Mode</button>
        <button id="reset-theme" style="
          flex: 1;
          padding: 8px 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        ">Reset</button>
      </div>
    `;

    this.container.appendChild(footer);

    footer.querySelector('#preview-toggle').addEventListener('click', () => {
      this.togglePreviewMode();
    });

    footer.querySelector('#reset-theme').addEventListener('click', () => {
      this.resetToDefault();
    });
  }

  initializeTabContent() {
    this.initializeThemesTab();
    this.initializeLayoutsTab();
    this.initializeCustomCSSTab();
    this.initializeExportTab();
  }

  initializeThemesTab() {
    const container = document.getElementById('tab-themes');
    
    const currentThemeSection = document.createElement('div');
    currentThemeSection.innerHTML = `
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #f1f5f9;">Current Theme</h3>
      <div id="current-theme-display" style="
        padding: 12px;
        background: rgba(30, 41, 59, 0.5);
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid rgba(148, 163, 184, 0.2);
      ">
        <div style="font-weight: 500;">No theme selected</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Select a theme below</div>
      </div>
    `;

    const presetsSection = document.createElement('div');
    presetsSection.innerHTML = `
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #f1f5f9;">Theme Presets</h3>
      <div id="theme-presets-list"></div>
    `;

    container.appendChild(currentThemeSection);
    container.appendChild(presetsSection);

    this.loadThemePresets();
  }

  initializeLayoutsTab() {
    const container = document.getElementById('tab-layouts');
    
    const currentLayoutSection = document.createElement('div');
    currentLayoutSection.innerHTML = `
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #f1f5f9;">Current Layout</h3>
      <div id="current-layout-display" style="
        padding: 12px;
        background: rgba(30, 41, 59, 0.5);
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid rgba(148, 163, 184, 0.2);
      ">
        <div style="font-weight: 500;">No layout applied</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Select a layout below</div>
      </div>
    `;

    const layoutsSection = document.createElement('div');
    layoutsSection.innerHTML = `
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #f1f5f9;">Layout Presets</h3>
      <div id="layout-presets-list"></div>
    `;

    container.appendChild(currentLayoutSection);
    container.appendChild(layoutsSection);

    this.loadLayoutPresets();
  }

  initializeCustomCSSTab() {
    const container = document.getElementById('tab-custom-css');
    
    container.innerHTML = `
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #f1f5f9;">Custom CSS Editor</h3>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-size: 14px; color: #cbd5e1;">
          CSS Rules (automatically sanitized for security)
        </label>
        <textarea id="custom-css-editor" placeholder="/* Enter your custom CSS here */
.widget-container {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.clock-widget {
  font-size: 2rem;
  color: #3b82f6;
}" style="
          width: 100%;
          height: 200px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 8px;
          padding: 12px;
          color: #f1f5f9;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          line-height: 1.5;
          resize: vertical;
          box-sizing: border-box;
        "></textarea>
      </div>
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <button id="apply-custom-css" style="
          flex: 1;
          padding: 10px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
          border-radius: 6px;
          cursor: pointer;
        ">Apply CSS</button>
        <button id="clear-custom-css" style="
          flex: 1;
          padding: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          border-radius: 6px;
          cursor: pointer;
        ">Clear CSS</button>
      </div>
      <div id="css-validation-result" style="
        padding: 12px;
        background: rgba(30, 41, 59, 0.5);
        border-radius: 8px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        font-size: 12px;
        color: #94a3b8;
      ">
        CSS validation results will appear here
      </div>
    `;

    const editor = container.querySelector('#custom-css-editor');
    const applyBtn = container.querySelector('#apply-custom-css');
    const clearBtn = container.querySelector('#clear-custom-css');
    const resultDiv = container.querySelector('#css-validation-result');

    applyBtn.addEventListener('click', () => {
      const css = editor.value;
      const result = cssCustomizer.applyCustomCSS(css, 'theme-manager');
      
      if (result.success) {
        resultDiv.innerHTML = `
          <div style="color: #4ade80;">✓ CSS applied successfully</div>
          <div style="margin-top: 4px;">Sanitized and applied ${result.sanitizedCSS.split('\n').length} lines</div>
        `;
      } else {
        resultDiv.innerHTML = `
          <div style="color: #f87171;">✗ Failed to apply CSS</div>
          <div style="margin-top: 4px;">${result.error}</div>
        `;
      }
    });

    clearBtn.addEventListener('click', () => {
      editor.value = '';
      cssCustomizer.removeCustomCSS('theme-manager');
      resultDiv.innerHTML = `
        <div style="color: #94a3b8;">Custom CSS cleared</div>
      `;
    });
  }

  initializeExportTab() {
    const container = document.getElementById('tab-export');
    
    container.innerHTML = `
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #f1f5f9;">Export & Import</h3>
      
      <div style="margin-bottom: 20px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;">Export Current Configuration</h4>
        <div style="display: flex; gap: 8px;">
          <button id="export-theme" style="
            flex: 1;
            padding: 10px;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: #60a5fa;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
          ">Export Theme</button>
          <button id="export-layout" style="
            flex: 1;
            padding: 10px;
            background: rgba(59, 130, 246, 0.1);  
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: #60a5fa;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
          ">Export Layout</button>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;">Import Configuration</h4>
        <input type="file" id="import-file" accept=".json" style="
          width: 100%;
          padding: 10px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 6px;
          color: #f1f5f9;
          margin-bottom: 8px;
        ">
        <button id="import-config" style="
          width: 100%;
          padding: 10px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
          border-radius: 6px;
          cursor: pointer;
        ">Import Configuration</button>
      </div>

      <div id="export-result" style="
        padding: 12px;
        background: rgba(30, 41, 59, 0.5);
        border-radius: 8px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        font-size: 12px;
        color: #94a3b8;
      ">
        Export/import results will appear here
      </div>
    `;

    this.setupExportImportHandlers(container);
  }

  loadThemePresets() {
    const container = document.getElementById('theme-presets-list');
    const presets = themeEngine.getPresets();

    container.innerHTML = '';

    presets.forEach(preset => {
      const presetCard = document.createElement('div');
      presetCard.className = 'theme-preset-card';
      presetCard.style.cssText = `
        padding: 12px;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.2s;
      `;

      presetCard.innerHTML = `
        <div style="font-weight: 500; margin-bottom: 4px;">${preset.name}</div>
        <div style="font-size: 12px; color: #94a3b8;">${preset.description}</div>
      `;

      presetCard.addEventListener('click', async () => {
        try {
          await themeEngine.loadPreset(preset.key);
          this.updateCurrentThemeDisplay();
          this.showNotification(`Applied theme: ${preset.name}`, 'success');
        } catch (error) {
          this.showNotification(`Failed to apply theme: ${error.message}`, 'error');
        }
      });

      container.appendChild(presetCard);
    });
  }

  loadLayoutPresets() {
    const container = document.getElementById('layout-presets-list');
    const layouts = layoutEngine.getAvailableLayouts();

    container.innerHTML = '';

    layouts.forEach(layout => {
      const layoutCard = document.createElement('div');
      layoutCard.className = 'layout-preset-card';
      layoutCard.style.cssText = `
        padding: 12px;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.2s;
      `;

      layoutCard.innerHTML = `
        <div style="font-weight: 500; margin-bottom: 4px;">${layout.name}</div>
        <div style="font-size: 12px; color: #94a3b8;">${layout.description}</div>
        ${layout.hasResponsive ? '<div style="font-size: 10px; color: #60a5fa; margin-top: 4px;">📱 Responsive</div>' : ''}
      `;

      layoutCard.addEventListener('click', async () => {
        try {
          await layoutEngine.applyLayout(layout.key);
          this.updateCurrentLayoutDisplay();
          this.showNotification(`Applied layout: ${layout.name}`, 'success');
        } catch (error) {
          this.showNotification(`Failed to apply layout: ${error.message}`, 'error');
        }
      });

      container.appendChild(layoutCard);
    });
  }

  setupExportImportHandlers(container) {
    const exportThemeBtn = container.querySelector('#export-theme');
    const exportLayoutBtn = container.querySelector('#export-layout');
    const importFileInput = container.querySelector('#import-file');
    const importBtn = container.querySelector('#import-config');
    const resultDiv = container.querySelector('#export-result');

    exportThemeBtn.addEventListener('click', () => {
      try {
        const themeData = themeEngine.exportTheme();
        this.downloadFile('lumaboard-theme.json', themeData);
        resultDiv.innerHTML = '<div style="color: #4ade80;">✓ Theme exported successfully</div>';
      } catch (error) {
        resultDiv.innerHTML = `<div style="color: #f87171;">✗ Export failed: ${error.message}</div>`;
      }
    });

    exportLayoutBtn.addEventListener('click', () => {
      try {
        const currentLayout = layoutEngine.getCurrentLayout();
        if (currentLayout) {
          const layoutData = JSON.stringify({ layout: currentLayout }, null, 2);
          this.downloadFile('lumaboard-layout.json', layoutData);
          resultDiv.innerHTML = '<div style="color: #4ade80;">✓ Layout exported successfully</div>';
        } else {
          resultDiv.innerHTML = '<div style="color: #f59e0b;">⚠ No layout currently applied</div>';
        }
      } catch (error) {
        resultDiv.innerHTML = `<div style="color: #f87171;">✗ Export failed: ${error.message}</div>`;
      }
    });

    importBtn.addEventListener('click', async () => {
      const file = importFileInput.files[0];
      if (!file) {
        resultDiv.innerHTML = '<div style="color: #f59e0b;">⚠ Please select a file to import</div>';
        return;
      }

      try {
        const content = await this.readFile(file);
        const config = JSON.parse(content);

        if (config.theme || config.colors) {
          await themeEngine.importTheme(content);
          resultDiv.innerHTML = '<div style="color: #4ade80;">✓ Theme imported successfully</div>';
        } else if (config.layout) {
          await layoutEngine.applyLayout(config.layout);
          resultDiv.innerHTML = '<div style="color: #4ade80;">✓ Layout imported successfully</div>';
        } else {
          resultDiv.innerHTML = '<div style="color: #f87171;">✗ Invalid configuration file</div>';
        }
      } catch (error) {
        resultDiv.innerHTML = `<div style="color: #f87171;">✗ Import failed: ${error.message}</div>`;
      }
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.toggle();
      }
      
      if (e.key === 'Escape' && this.isVisible) {
        e.preventDefault();
        this.hide();
      }
    });
  }

  setupEventListeners() {
    themeEngine.on('theme-changed', () => {
      this.updateCurrentThemeDisplay();
    });

    layoutEngine.on('layout-applied', () => {
      this.updateCurrentLayoutDisplay();
    });
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.style.display = 'none';
    });
    
    document.getElementById(`tab-${tabId}`).style.display = 'block';
    this.updateTabStyles();
  }

  updateTabStyles() {
    document.querySelectorAll('.theme-manager-tab').forEach(tab => {
      if (tab.dataset.tab === this.activeTab) {
        tab.style.color = '#60a5fa';
        tab.style.borderBottomColor = '#60a5fa';
        tab.style.background = 'rgba(59, 130, 246, 0.1)';
      } else {
        tab.style.color = '#94a3b8';
        tab.style.borderBottomColor = 'transparent';
        tab.style.background = 'none';
      }
    });
  }

  updateCurrentThemeDisplay() {
    const display = document.getElementById('current-theme-display');
    if (display) {
      const currentTheme = themeEngine.getCurrentTheme();
      if (currentTheme) {
        display.innerHTML = `
          <div style="font-weight: 500;">${currentTheme.name}</div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Currently active theme</div>
        `;
      }
    }
  }

  updateCurrentLayoutDisplay() {
    const display = document.getElementById('current-layout-display');
    if (display) {
      const currentLayout = layoutEngine.getCurrentLayout();
      if (currentLayout) {
        const layouts = layoutEngine.getAvailableLayouts();
        const layoutInfo = layouts.find(l => l.key === currentLayout);
        display.innerHTML = `
          <div style="font-weight: 500;">${layoutInfo ? layoutInfo.name : currentLayout}</div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Currently active layout</div>
        `;
      }
    }
  }

  show() {
    if (!this.initialized) {
      this.init();
    }
    this.isVisible = true;
    this.container.style.right = '0';
    this.emit('theme-manager-shown');
  }

  hide() {
    this.isVisible = false;
    this.container.style.right = '-400px';
    this.emit('theme-manager-hidden');
  }

  toggle() {
    if (!this.initialized) {
      this.init();
    }
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  togglePreviewMode() {
    this.previewMode = !this.previewMode;
    const button = document.getElementById('preview-toggle');
    
    if (this.previewMode) {
      this.originalTheme = themeEngine.getCurrentTheme();
      button.textContent = 'Exit Preview';
      button.style.background = 'rgba(239, 68, 68, 0.1)';
      button.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      button.style.color = '#f87171';
      this.showNotification('Preview mode enabled', 'info');
    } else {
      if (this.originalTheme) {
        themeEngine.loadTheme(this.originalTheme);
      }
      button.textContent = 'Preview Mode';
      button.style.background = 'rgba(59, 130, 246, 0.1)';
      button.style.borderColor = 'rgba(59, 130, 246, 0.3)';
      button.style.color = '#60a5fa';
      this.showNotification('Preview mode disabled', 'info');
    }
  }

  resetToDefault() {
    themeEngine.loadPreset('light');
    cssCustomizer.clearAllCustomCSS();
    this.showNotification('Reset to default theme', 'success');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 420px;
      padding: 12px 16px;
      background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 
                   type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                   'rgba(59, 130, 246, 0.9)'};
      color: white;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10001;
      backdrop-filter: blur(10px);
      animation: slideIn 0.3s ease;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  on(event, callback) {
    this.listeners.add({ event, callback });
  }

  emit(event, data) {
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        try {
          listener.callback(data);
        } catch (error) {
          console.error(`ThemeManager: Error in event listener for "${event}":`, error);
        }
      }
    });
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.listeners.clear();
    this.container = null;

    console.log('ThemeManager: Destroyed');
  }
}

export const themeManager = new ThemeManager();