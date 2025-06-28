export class ClockWidget extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<div class="widget clock">🕒 Clock Widget</div>`;
  }
}
customElements.define('clock-widget', ClockWidget); 