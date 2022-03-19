import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  element;
  subElements = {};
  start = 0;
  end = 30;
  delta = 30;
  distanceToBorder = 1;

  constructor(
    headerConfig = [],
    {url = '',
     data = [],
     sorted = {
        id: headerConfig.find(item => item.sortable).id,
        order: 'asc'},
     isSortLocally = false
     } = {}) {

    this.headerConfig = headerConfig
    this.isSortLocally = isSortLocally
    this.url = url
    this.data = data
    this.sorted = sorted
    this.render();

  }

  getTemplate(data = []) {
    return `
    <div class="sortable-table">
      ${this.getHeader()}
      <div data-element="body" class="sortable-table__body"></div>
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    </div>`
  }

  getHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderRow()}
      </div>`
  }

  getHeaderRow(){
    return `
        ${this.headerConfig.map((item) => {
      return `${this.getHeaderColumn(item)}`
    }).join("")}`
  }

  getHeaderColumn (item){
    const order = this.sorted.id === item.id ? this.sorted.order : 'asc';
    return `
      <div class="sortable-table__cell" data-id=${item.id} data-sortable=${item.sortable} data-order=${order}>
        <span>${item.title}</span>
        ${this.getHeaderArrow(item.id)}
      </div>`
  }

  getHeaderArrow (id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';
    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getTableRows (data) {
    return data.map((item) => {
      return `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${this.getTableRow(item)}
          </a>`
    }).join("")
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id,template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`
    }).join("")
  }

  async render() {
    const {id, order} = this.sorted;

    const wrapper = document.createElement(`div`);
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners()
    this.subElements.body.style.display = "none"
    this.subElements.loading.style.display = "block"
    await this.sort(this.sorted.id, this.sorted.order);
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.handleClick);
    if (!this.isSortLocally) {
    window.addEventListener("scroll", this.addProduct)}
  }

  addProduct = async () => {
    let windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;

    if (windowRelativeBottom < document.documentElement.clientHeight + this.distanceToBorder) {
      this.subElements.loading.style.display = "block"
      this.increaseBorders()

      const additionalData = await this.loadData()

      this.subElements.body.insertAdjacentHTML("beforeend", this.getTableRows(additionalData))
      this.subElements.loading.style.display = "none"
    }
  }

  increaseBorders () {
    this.start += this.delta
    this.end += this.delta
  }

  handleClick = event => {
    const currentColumn = event.target.closest(".sortable-table__cell")

    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };
      return orders[order];
    };

    if (currentColumn.dataset.sortable) {
      const { id, order } = currentColumn.dataset;
      const newOrder = toggleOrder(order);
      this.sorted.id = id
      this.sorted.order = newOrder

      const arrow = currentColumn.querySelector('.sortable-table__sort-arrow');
      currentColumn.dataset.order = newOrder;

      if (!arrow) {
        currentColumn.append(this.subElements.arrow);
      }
      this.sort(id,newOrder)
    }
  }

  async sort(id, order) {

    this.subElements.body.style.display = "none"
    this.subElements.loading.style.display = "block"

    const sortedData = this.isSortLocally ? this.sortOnClient(id, order) : await this.sortOnServer(id, order);

    if (sortedData.length === 0) {
      this.subElements.emptyPlaceholder.style.display = "block"
    }

    this.subElements.body.innerHTML = this.getTableRows(sortedData)

    this.subElements.body.style.display = "block"
    this.subElements.loading.style.display = "none"

  }

  async sortOnServer(id,order) {
    return await this.loadData(id,order)
  }

  async loadData(id = this.sorted.id,order = this.sorted.order) {
    return await fetchJson(BACKEND_URL + '/' + this.url +
      `?_sort=${id}&_order=${order}&_start=${this.start}&_end=${this.end}`)
  }

  sortOnClient(id, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === id)
    const { sortType } = column

    const direction = {
      asc: 1,
      desc: -1
    };

    const dem = direction[order];

    return arr.sort((a, b) => {
      switch (sortType) {
        case "string":
          return dem * a[id].localeCompare(b[id], 'ru-en-u-kf-upper');
        case "number":
          return dem * (a[id] - b[id]);
        default:
          return dem * (a[id] - b[id]);
      }
    })
  }

  getSubElements(element) {
    const result = [];
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {}
    document.removeEventListener('scroll', window);
  }

}


