import { mountWidgets } from './widgetMount.js';

let currentSceneIndex = 0;
let scenes = [];
let rotationTimer = null;

/**
 * Initialize the scene engine with config.scenes and mount point.
 * @param {Array} sceneList - Array of scene configs
 * @param {HTMLElement} mount - DOM element to render into
 */
export function initSceneEngine(sceneList, mount) {
  scenes = sceneList;
  currentSceneIndex = 0;
  if (scenes.length > 0) {
    renderScene(mount, scenes[currentSceneIndex]);
  }
}

/**
 * Start scene rotation based on duration in config.
 * @param {HTMLElement} mount
 */
export function startSceneRotation(mount) {
  if (!scenes.length) return;
  clearInterval(rotationTimer);
  
  const currentScene = scenes[currentSceneIndex];
  const duration = (currentScene.duration || 10) * 1000;
  
  rotationTimer = setInterval(() => {
    currentSceneIndex = (currentSceneIndex + 1) % scenes.length;
    renderScene(mount, scenes[currentSceneIndex]);
  }, duration);
}

/**
 * Render a scene with proper widget mounting.
 * @param {HTMLElement} mount
 * @param {Object} scene
 */
function renderScene(mount, scene) {
  mount.innerHTML = '';
  
  // Create scene container
  const sceneContainer = document.createElement('div');
  sceneContainer.className = 'scene-container';
  sceneContainer.setAttribute('data-scene', scene.name || 'unnamed');
  
  // Apply layout based on scene config
  applyLayout(sceneContainer, scene.layout || 'grid-2x2');
  
  // Mount widgets using the widget mounting system
  if (scene.widgets && scene.widgets.length > 0) {
    mountWidgets(scene.widgets, sceneContainer);
  }
  
  mount.appendChild(sceneContainer);
}

/**
 * Apply layout styles to scene container.
 * @param {HTMLElement} container
 * @param {string} layout
 */
function applyLayout(container, layout) {
  container.style.display = 'grid';
  container.style.height = '100vh';
  container.style.width = '100vw';
  container.style.gap = '1rem';
  container.style.padding = '1rem';
  container.style.boxSizing = 'border-box';
  
  switch (layout) {
    case 'grid-2x2':
      container.style.gridTemplateColumns = '1fr 1fr';
      container.style.gridTemplateRows = '1fr 1fr';
      break;
    case 'grid-3x3':
      container.style.gridTemplateColumns = '1fr 1fr 1fr';
      container.style.gridTemplateRows = '1fr 1fr 1fr';
      break;
    case 'single':
      container.style.gridTemplateColumns = '1fr';
      container.style.gridTemplateRows = '1fr';
      break;
    default:
      // Default to 2x2 grid
      container.style.gridTemplateColumns = '1fr 1fr';
      container.style.gridTemplateRows = '1fr 1fr';
  }
} 