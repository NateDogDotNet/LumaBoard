export class StockTickerWidget extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<div class="widget stock-ticker">💹 Stock Ticker Widget</div>`;
  }
}
customElements.define('stock-ticker-widget', StockTickerWidget); 