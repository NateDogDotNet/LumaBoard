export class WeatherWidget extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<div class="widget weather">☀️ Weather Widget</div>`;
  }
}
customElements.define('weather-widget', WeatherWidget); 