import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  element;
  subElements;

  constructor({label = "",
                url = '',
                range = {
                  from: new Date(),
                  to: new Date()
                },
                link = "",
                formatHeading = item => item} = "") {
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading
    this.url = url
    this.range = range;
    this.render();
    this.update(this.range.from, this.range.to)
  }

  async getFetch() {
    return await fetchJson(BACKEND_URL + '/' + this.url)
  }

  getTemplate() {
    return `
    <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        <a href=${this.link} class="column-chart__link"
          style = "${this.link === "" ? `display: none` : ''}">View all
        </a>
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header"></div>
        <div data-element="body" class="column-chart__chart">
      </div>
    </div>`;
  }

  getChartHeader (currentData) {
    return `${this.formatHeading(Object.values(currentData).reduce((sum, item) => sum + item, 0))}`
  }

  getChartBody (currentData) {
    const maxValue = Math.max.apply(null, Object.values(currentData));
    return `${this.getBody(Object.entries(currentData), maxValue)}`
  }

  getBody (currentArray, maxValue) {
    const ratio = this.chartHeight / maxValue;
    return `
      ${currentArray.map(([key, value]) => {
          return `
            <div
              style= "--value: ${String(Math.floor(value * ratio))}"
              data-tooltip="${(value / maxValue * 100).toFixed(0)}%">
            </div>`
      }).join("")}
    `
  }

  async update(dateFrom, dateTo) {
    this.element.classList.add("column-chart_loading")

    const data = await this.getFetch()

    const currentData = this.getCurrentData(dateFrom, dateTo, data)

    this.subElements.header.textContent = this.getChartHeader(currentData)
    this.subElements.body.innerHTML = this.getChartBody(currentData)

    this.element.classList.remove("column-chart_loading")

    return currentData;
  }

  getCurrentData (dateFrom, dateTo, data) {
    const currentData = {}

    for (const key in data) {
      if (dateFrom < new Date(key) && new Date(key) < dateTo) {
        currentData[key] = data[key]
      }
    }

    if (Object.keys(currentData).length === 0) {
      return data
    }

    return currentData;
  }

  render(){
    const element = document.createElement(`div`);
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
