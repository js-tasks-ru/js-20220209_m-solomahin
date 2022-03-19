import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL("api/dashboard/bestsellers", BACKEND_URL);

  get template() {
    return `
        <div class="dashboard">
            <div class="content__top-panel">
                <h2 class="page-title">Панель управления</h2>
                <div data-element ="rangePicker"></div>
            </div>
        
            <div class="dashboard__charts" data-element = "chartRoot">
                <div data-element = "ordersChart" class="dashboard__chart_orders"></div>
                <div data-element = "salesChart" class="dashboard__chart_sales"></div>
                <div data-element = "customersChart" class="dashboard__chart_customers"></div>
            </div>
        
            <h3 class="block-title">Лидеры продаж</h3>
            <div data-element="sortableTable"></div>
        </div>
        `;
  }

  render() {
    const wrapper = document.createElement(`div`);
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponent();
    this.renderComponent();
    this.initEventListeners();

    return this.element;
  }

  initComponent() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=20&form=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true,
    });

    const rangePicker = new RangePicker({
      from,
      to,
    });

    const ordersChart = new ColumnChart({
      url: "api/dashboard/orders",
      range: {
        from,
        to,
      },
      label: "orders",
      link: "#",
    });

    const salesChart = new ColumnChart({
      url: "api/dashboard/sales",
      range: {
        from,
        to,
      },
      label: "sales",
      formatHeading: (data) => `$${data}`,
    });

    const customersChart = new ColumnChart({
      url: "api/dashboard/customers",
      range: {
        from,
        to,
      },
      label: "customers",
    });

    this.components = {
      sortableTable,
      ordersChart,
      salesChart,
      customersChart,
      rangePicker,
    };
  }

  renderComponent() {
    Object.keys(this.components).forEach((component) => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener(
      "date-select",
      (event) => {
        const { from, to } = event.detail;

        this.updataCompanent(from, to);
      }
    );
  }

  async updataCompanent(from, to) {
    const data = await this.loadData(from, to);

    this.components.sortableTable.update(data);
    this.components.ordersChart.update(from, to);
    this.components.customersChart.update(from, to);
    this.components.salesChart.update(from, to);
  }

  loadData(from, to) {
    this.url.searchParams.set("_start", "1");
    this.url.searchParams.set("_end", "21");
    this.url.searchParams.set("_sort", "title");
    this.url.searchParams.set("_order", "asc");
    this.url.searchParams.set("_from", from.toISOString());
    this.url.searchParams.set("_to", to.toISOString());

    return fetchJson(this.url);
  }

  getSubElements(element) {
    const result = [];
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.elenents = null;

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
