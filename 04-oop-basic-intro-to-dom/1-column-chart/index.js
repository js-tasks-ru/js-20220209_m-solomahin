export default class ColumnChart {
  chartHeight = 50;
  constructor({label, data = [], value = "", link, formatHeading} = "") {
    this.label = label;
    this.data = data;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
  }

  getTemplate() {
    const maxValue = Math.max.apply(null, this.data);
    const ratio = 50 / maxValue;
    return `
          <div class="column-chart__title">
            Total ${this.label}
            <a href=${this.link} class="column-chart__link"
              style = "${this.link === undefined ? `display: none"` : ''}">View all
            </a>
          </div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">${this.formatHeading !== undefined ? this.formatHeading(this.value) : this.value}</div>
            <div data-element="body" class="column-chart__chart">
              ${this.data.map((item) =>
                {return `
                  <div
                    style= "--value: ${String(Math.floor(item * ratio))}"
                    data-tooltip="${(item / maxValue * 100).toFixed(0)}%"></div>`}).join("")}
            </div>
          </div>`;
  }

  update (arr = []){
    this.data = arr;
    this.render()
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  render(){
    const dashboardChart = document.createElement(`div`);
    dashboardChart.className = `column-chart ${this.data.length === 0 ? "column-chart_loading" : ""}`
    dashboardChart.style.display = "--chart-height: 50";
    dashboardChart.innerHTML = this.getTemplate();
    this.element = dashboardChart;
  }
}










