/**
 * Mounts widgets into a container based on config.
 * @param {Array} widgets - Array of widget configs
 * @param {HTMLElement} container - DOM element to mount into
 */
export function mountWidgets(widgets, container) {
  container.innerHTML = '';
  widgets.forEach(widgetConfig => {
    let el;
    switch (widgetConfig.type) {
      case 'clock':
        el = document.createElement('clock-widget');
        break;
      case 'weather':
        el = document.createElement('weather-widget');
        break;
      case 'news-ticker':
        el = document.createElement('news-ticker-widget');
        break;
      case 'stock-ticker':
        el = document.createElement('stock-ticker-widget');
        break;
      default:
        el = document.createElement('div');
        el.textContent = widgetConfig.type + ' (unknown widget)';
    }
    // Pass config as property
    el.config = widgetConfig.config || {};
    container.appendChild(el);
  });
} 