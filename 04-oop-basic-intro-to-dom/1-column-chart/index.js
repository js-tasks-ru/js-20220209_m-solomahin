export default class ColumnChart {
  constructor({data, label, value, link, formatHeading}) {
    this.label = label;
    this.data = data;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
  }

  getTemplate() {
    return `<div class="column-chart" style="--chart-height: 50">
      <div class="column-chart__title">
        Total ${this.label}
        <a href=${this.link} class="column-chart__link">View all</a>
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
            ${this.data.map((item) => {
              return `<div style= "--value: ${item * 0.5}" data-tooltip=${item}></div>`;
            }).join("")}
        </div>
      </div>
    </div>
  </div>`;
  }

  render() {
    const dashboardChart = document.createElement(`div`);

    dashboardChart.innerHTML = this.getTemplate();

    this.element = dashboardChart;
  }
}



