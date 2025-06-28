// Entry point for LumaBoard
import './styles/main.css';
import { loadConfig } from './configLoader.js';
import { initSceneEngine, startSceneRotation } from './sceneEngine.js';
import { mountWidgets } from './widgetMount.js';

// Import all widget components
import './components/ClockWidget.js';
import './components/WeatherWidget.js';
import './components/NewsTickerWidget.js';
import './components/StockTickerWidget.js';

async function initApp() {
  const app = document.getElementById('app');
  
  try {
    // Try to load config from example file
    const response = await fetch('./config/example-config.json');
    if (!response.ok) throw new Error('Failed to load example config');
    const configText = await response.text();
    const config = JSON.parse(configText);
    
    // Initialize scene engine
    initSceneEngine(config.scenes, app);
    startSceneRotation(app);
    
    console.log('LumaBoard initialized successfully');
  } catch (error) {
    console.error('Failed to initialize LumaBoard:', error);
    app.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h1>LumaBoard</h1>
        <p>Failed to load configuration: ${error.message}</p>
        <p>Please check your config file and try again.</p>
      </div>
    `;
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
} 