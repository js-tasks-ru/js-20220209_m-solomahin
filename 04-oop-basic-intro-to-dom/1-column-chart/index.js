export default class ColumnChart {
  chartHeight = 50;

  constructor({label = "",
               data = [],
               value = 0,
               link = "",
               formatHeading = item => item} = "") {
    this.label = label;
    this.data = data;
    this.value = formatHeading(value);
    this.link = link;
 
    this.render();
  }

  getTemplate() {
    const maxValue = Math.max.apply(null, this.data);
    const ratio = this.chartHeight / maxValue;
    return `
    <div class="column-chart ${this.data.length === 0 ? "column-chart_loading" : ""}" style="--chart-height: ${this.chartHeight}">
          <div class="column-chart__title">
            Total ${this.label}
            <a href=${this.link} class="column-chart__link"
              style = "${this.link === "" ? `display: none` : ''}">View all
            </a>
          </div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">
              ${this.value}</div>
            <div data-element="body" class="column-chart__chart">
              ${this.data.map((item) =>
                {return `
                  <div
                    style= "--value: ${String(Math.floor(item * ratio))}"
                    data-tooltip="${(item / maxValue * 100).toFixed(0)}%"></div>`}).join("")}
            </div>
          </div>
      </div>`;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
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
    dashboardChart.innerHTML = this.getTemplate();
    this.dashboardChart = dashboardChart.firstElementChild
    this.element = this.dashboardChart;
  }
}
