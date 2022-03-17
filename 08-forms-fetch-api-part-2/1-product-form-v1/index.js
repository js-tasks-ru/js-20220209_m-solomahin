import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {

  element;
  subElements;
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };

  constructor (productId) {
    this.productId = productId;
  }

  getTemplate(products, categories) {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" id="title" class="form-control" placeholder="Название товара" value = '${products.title}'>
          </fieldset>
        </div>

        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea
            required=""
            class="form-control"
            id="description"
            data-element="productDescription"
            placeholder="Описание товара">${products.description}</textarea>
        </div>

        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">

              ${this.getImages(products)}

          </div>
          <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>

        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          ${this.getSelectCategories(categories)}
        </div>

        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" id="price" class="form-control" placeholder="100" value = "${products.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" id="discount" class="form-control" placeholder="0" value = "${products.discount}">
          </fieldset>
        </div>

        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" id="quantity" placeholder="1" value = "${products.quantity}">
        </div>

        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" id="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>

        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            ${this.productId ? "Сохранить" : "Добавить"} товар
          </button>
        </div>

      </form>
  </div>
    `
  }

  getSelectCategories(categories) {
    return `
    <select class="form-control" id="subcategory">
      ${categories.map((item) => {
      return item.subcategories.map((j) => {
        return `
          <option
            value=${j.id}>${item.title} &gt; ${j.title}
          </option>`
      }).join("")
    }).join("")}
    </select>`
  }

  getImages (data) {
    if (!this.productId && data.images !== undefined)
    {
      return ''
    }
    return `
    <ul class="sortable-list">
      ${data.images.map((item) => {
      return `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${item.url}">
          <input type="hidden" name="source" value=${item.source}>
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
            <span>${item.source}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>
      `
    }).join("")}
    </ul>`
  }

  async render () {
    const categoriesPromise = this.loadDataCategories();

    const productPromise = this.productId
      ? this.loadDataProducts(this.productId)
      : Promise.resolve([this.defaultFormData]);

    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise])
    const [productData] = productResponse

    this.formData = productData
    this.categories = categoriesData

    this.renderForm()

    return this.element
  }

  renderForm () {
    const wrapper = document.createElement(`div`);
    wrapper.innerHTML = this.getTemplate(this.formData, this.categories);
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();



  }

  initEventListeners() {
    const {productForm} = this.subElements;
    productForm.addEventListener('submit', this.onSubmit);
  }

  onSubmit = event => {
    event.preventDefault();

    this.save ();
  }

  dispatchEvent () {
    const event = this.productId
    ? new CustomEvent("product-updated")
      : new CustomEvent("product-saved");
    this.element.dispatchEvent(event);
  }

  getFormData() {
    return {
      id: this.formData.id,
      title: this.formData.title,
      description: this.formData.description,
      subcategory: this.formData.subcategory,
      price: this.formData.price,
      quantity: this.formData.quantity,
      discount: this.formData.discount,
      status: this.formData.status,
      images: this.formData.images,
    }
  }


  async save () {
    const formData = this.getFormData()
    const json = JSON.stringify(formData);

    await fetch(BACKEND_URL + "/api/rest/products", {
      method: formData.id ? "PATCH" : "PUT",
      headers: {"Content-Type": "application/json"},
      body: json,
      referrer: ''
    });

    this.dispatchEvent()
  }

  async loadDataCategories() {
    const categories = new URL(BACKEND_URL + `/api/rest/categories`);
    categories.searchParams.set('_sort', 'weight');
    categories.searchParams.set('_refs', 'subcategory');
    return await fetchJson(categories);
  }

  async loadDataProducts(id) {
    const formData = new URL(BACKEND_URL + `/api/rest/products`);
    formData.searchParams.set('id', `${id}`);
    return await fetchJson(formData);
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
    this.subElements.productForm.removeEventListener('submit', this.onSubmit);
    this.remove();
    this.element = null;
    this.subElements = {}

  }

}

