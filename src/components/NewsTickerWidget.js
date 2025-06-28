export class NewsTickerWidget extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<div class="widget news-ticker">📰 News Ticker Widget</div>`;
  }
}
customElements.define('news-ticker-widget', NewsTickerWidget); 