
export default class SortableTable {
  constructor(headerConfig = [], {
                data = [],
                sorted = {
                  id: headerConfig.find(item => item.sortable).id,
                  order: 'asc'
                }
              } = {}
  ) {
    this.data = data
    this.headerConfig = headerConfig
    this.sorted = sorted

    this.isSortLocally = true
    this.render();
  }

  element;
  subElements = {}

  getTemplate(data) {
    return `
    <div class="sortable-table">

      ${this.getHeader()}
      ${this.getBody(data)};

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

  getBody(data) {
    return `
   <div data-element="body" class="sortable-table__body">
     ${this.getTableRows(data)}
   </div>`
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

  render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement(`div`);
    const sortedData = this.sortData(id, order);
    wrapper.innerHTML = this.getTemplate(sortedData);

    const element = wrapper.firstElementChild;
    this.element = element;

    this.subElements = this.getSubElements(element);

    this.initEventListeners()
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.handleClick);
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

    if (currentColumn.dataset.sortable === 'true') {

      const { id, order } = currentColumn.dataset;

      const newOrder = toggleOrder(order);

      const sortedData = this.sortData(id, newOrder);
      const arrow = currentColumn.querySelector('.sortable-table__sort-arrow');
      currentColumn.dataset.order = newOrder;

      if (!arrow) {
        currentColumn.append(this.subElements.arrow);
      }

      this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === field)
    const { sortType } = column

    const direction = {
      asc: 1,
      desc: -1
    };

    const dem = direction[order];

    return arr.sort((a, b) => {
      switch (sortType) {
        case "string":
          return dem * a[field].localeCompare(b[field], 'ru-en-u-kf-upper');
        case "number":
          return dem * (a[field] - b[field]);
        default:
          return dem * (a[field] - b[field]);
      }
    })
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
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {}
  }

}

