//import SortableList from '../../2-sortable-list/src/index.js';
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

  constructor(productId) {
    this.productId = productId;
  }

  getTemplate(products, categories) {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">

        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" class="form-control" placeholder="Название товара" value = '${products.title}'>
          </fieldset>
        </div>

        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea
            required=""
            class="form-control"
            name="description"
            data-element="productDescription"
            placeholder="Описание товара">${products.description}</textarea>
        </div>

        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">

              ${this.getImages(products)}

          </div>
          <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          <input type="file" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></input>
        </div>

        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          ${this.getSelectCategories(categories)}
        </div>

        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" class="form-control" placeholder="100" value = "${products.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" class="form-control" placeholder="0" value = "${products.discount}">
          </fieldset>
        </div>

        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" placeholder="1" value = "${products.quantity}">
        </div>

        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status">
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

  getImages(data) {
    if (!this.productId && data.images !== undefined) {
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

  async render() {
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

  renderForm() {
    const wrapper = document.createElement(`div`);
    wrapper.innerHTML = this.getTemplate(this.formData, this.categories);
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
  }

  onSubmit = event => {
    event.preventDefault();

    this.save();
  }

  async save() {

    const formData = this.getFormData()
    const json = JSON.stringify(formData);
    formData.images = this.prepareImagesData()


    console.log(formData)
    const resolve = await fetch(BACKEND_URL + "/api/rest/products", {
      method: this.productId ? "PATCH" : "POST",
      headers: {"Content-Type": "application/json"},
      body: json,
      referrer: ''
    });

    const temp = await resolve.json()
    console.log()
    this.dispatchEvent()
  }

  dispatchEvent() {
    const event = this.productId
      ? new CustomEvent("product-updated")
      : new CustomEvent("product-saved");
    this.element.dispatchEvent(event);
  }

  getFormData = () => {

    const {productForm} = this.subElements
    const temp = productForm.elements

    return {
      id: this.productId,
      title: temp.title.value,
      description: temp.description.value,
      subcategory: temp.subcategory.value,
      price: parseInt(temp.price.value,10),
      quantity: parseInt(temp.quantity.value,10),
      discount: parseInt(temp.discount.value,10),
      status: parseInt(temp.status.value,10),
      images: []
    }
  }

  prepareImagesData() {
    const arrayOfURL = [];
    const currentArray = []

    const formData = new FormData(this.subElements.productForm)
    for(const [name,value] of formData) {
      if (name === "url" || name === "source") {
        arrayOfURL.push({name,value})
      }
    }

    for (let i = 0; i < arrayOfURL.length; i++) {
      const w = {
        url: arrayOfURL[i].value,
        source: arrayOfURL[i + 1].value
      }
      currentArray.push(w)
      i++;
    }
    return currentArray
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

//
//   class a {
//     constructor(e) {
//       return l(this, "elem", void 0), l(this, "elems", {}), this.productId = e, this
//     }
//
//     async render() {
//       this.elem = Object(r.a)(`\n      <div class="product-form">\n        <form data-elem="productForm" class="form-grid">\n        <div class="form-group form-group__half_left">\n          <fieldset>\n            <label class="form-label">Название товара</label>\n            <input required type="text" name="title" class="form-control" placeholder="Название товара">\n          </fieldset>\n        </div>\n        <div class="form-group form-group__wide">\n          <label class="form-label">Описание</label>\n          <textarea required\n            class="form-control"\n            name="description"\n            placeholder="Описание товара"></textarea>\n        </div>\n        <div class="form-group form-group__wide" data-elem="sortable-list-container">\n          <label class="form-label">Фото</label>\n          <div data-elem="imageListContainer"></div>\n          <button type="button" name="uploadImage" class="button-primary-outline fit-content"><span>Загрузить</span></button>\n        </div>\n        <div class="form-group form-group__half_left">\n          <label class="form-label">Категория</label>\n          <select class="form-control" name="category"></select>\n        </div>\n        <div class="form-group form-group__half_left form-group__two-col">\n          <fieldset>\n            <label class="form-label">Цена ($)</label>\n            <input required type="number" name="price" class="form-control" placeholder="100">\n          </fieldset>\n          <fieldset>\n            <label class="form-label">Скидка ($)</label>\n            <input required type="number" name="discount" class="form-control" placeholder="0">\n          </fieldset>\n        </div>\n        <div class="form-group form-group__part-half">\n          <label class="form-label">Количество</label>\n          <input required type="number" class="form-control" name="quantity" placeholder="1">\n        </div>\n        <div class="form-group form-group__part-half">\n          <label class="form-label">Статус</label>\n          <select class="form-control" name="status">\n            <option value="1">Активен</option>\n            <option value="0">Неактивен</option>\n          </select>\n        </div>\n        <div class="form-buttons">\n          <button type="submit" name="save" class="button-primary-outline is-loading">\n            ${this.productId ? "Сохранить" : "Добавить"} товар\n          </button>\n        </div>\n      </form>\n      </div>\n    `);
//       for (let e of this.elem.querySelectorAll("[data-elem]")) this.elems[e.dataset.elem] = e;
//       if (this.productId) {
//         let e = await Object(n.a)(`https://course-js.javascript.ru/api/rest/products?id=${this.productId}`);
//         if (!e || 0 === e.length) return this.elem.innerHTML = '<h1 class="page-title">Страница не найдена</h1>\n        <p>Извините, данный товар не существует</p>', this.elem;
//         this.product = e[0]
//       }
//       if (this.product) {
//         const {title: e, description: t, price: i, discount: s, quantity: r, status: n} = this.product;
//         this.elems.productForm.title.value = e, this.elems.productForm.description.value = t, this.elems.productForm.price.value = i, this.elems.productForm.discount.value = s, this.elems.productForm.quantity.value = r, this.elems.productForm.status.value = n
//       } else this.elems.productForm.price.value = 100, this.elems.productForm.discount.value = 0, this.elems.productForm.quantity.value = 1;
//       let e = this.renderImageListItems();
//       this.imageList = new s.a({items: e}), this.elems.imageListContainer.append(this.imageList.elem), this.elems.productForm.uploadImage.onclick = e => this.uploadImage(e);
//       let t = await Object(n.a)("https://course-js.javascript.ru/api/rest/categories?_sort=weight&_refs=subcategory"),
//         i = [];
//       for (let e of t) for (let t of e.subcategories) i.push(new Option(e.title + " > " + t.title, t.id));
//       return this.elems.productForm.category.append(...i), this.product && (this.elems.productForm.category.value = this.product.subcategory), this.elems.productForm.save.classList.remove("is-loading"), this.elems.productForm.addEventListener("submit", e => this.onSubmit(e)), this.elem
//     }
//
//     onSubmit(e) {
//       e.preventDefault(), this.save()
//     }
//
//     getFormData() {
//       const {productForm: e} = this.elems, {
//         title: t,
//         description: i,
//         category: s,
//         price: r,
//         quantity: n,
//         discount: o,
//         status: l
//       } = e;
//       return {
//         id: this.productId,
//         title: t.value,
//         description: i.value,
//         subcategory: s.value,
//         price: parseInt(r.value, 10),
//         quantity: parseInt(n.value, 10),
//         discount: parseInt(o.value, 10),
//         status: parseInt(l.value, 10),
//         images: []
//       }
//     }
//
//     prepareImagesData() {
//       const e = [],
//         t = Array.from(new FormData(this.elems.productForm)).filter(e => "url" === e[0] || "source" === e[0]);
//       for (let i = 0; i < t.length; i++) e.push({url: t[i][1], source: t[i + 1][1]}), i++;
//       return e
//     }
//
//     async save() {
//       const e = this.getFormData();
//       e.images = this.prepareImagesData();
//       let t = await Object(n.a)("https://course-js.javascript.ru/api/rest/products", {
//         method: e.id ? "PATCH" : "PUT",
//         headers: {"Content-Type": "application/json"},
//         body: JSON.stringify(e)
//       });
//       const i = this.productId ? new CustomEvent("product-saved") : new CustomEvent("product-updated", {detail: t.id});
//       this.elem.dispatchEvent(i)
//     }
//
//     destroy() {
//       this.elem.remove()
//     }
//

