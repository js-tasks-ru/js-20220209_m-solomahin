export default class SortableList {
  constructor({items} = {}) {
    this.items = items
    this.render()
  }

  render() {
    this.element = document.createElement("ul")
    this.element.className = "sortable-list"
    for (let item of this.items) {
      this.addItem(item);
    }
    this.element.addEventListener("pointerdown", event => this.onPointerDown(event))
  }
  addItem(item) {
    item.classList.add("sortable-list__item")
    this.element.append(item)
  }
  removeItem(item) {
    item.remove()
      this.element.dispatchEvent(new CustomEvent("sortable-list-delete",{
        bubbles: !0,
        details: {
          item: item
        }
      }))
  }
  onPointerDown(event) {
    if (1 !== event.which) return;
    let currentRow = event.target.closest(".sortable-list__item");
    if (currentRow && event.target.closest("[data-grab-handle]")) {
      event.preventDefault();
      this.dragStart(currentRow, event)
    }

    if (event.target.closest("[data-delete-handle]")) {
      event.preventDefault();
      this.removeItem(currentRow)
    }
  }

  dragStart(currentRow, {clientX, clientY}) {
    this.elementInitialIndex = [...this.element.children].indexOf(currentRow);
    this.pointerInitialShift = {
      x: clientX - currentRow.getBoundingClientRect().x,
      y: clientY - currentRow.getBoundingClientRect().y,
    };

    this.draggingElem = currentRow;
    this.placeholderElem = document.createElement("div");
    this.placeholderElem.className = "sortable-list__placeholder";
    currentRow.style.width = currentRow.offsetWidth + "px";
    currentRow.style.height = currentRow.offsetHeight + "px";
    this.placeholderElem.style.width = currentRow.style.width;
    this.placeholderElem.style.height = currentRow.style.height;
    currentRow.classList.add("sortable-list__item_dragging");
    currentRow.after(this.placeholderElem);
    this.element.append(currentRow);
    this.moveDraggingAt(clientX, clientY);
    document.addEventListener("pointermove", this.onDocumentPointerMove);
    document.addEventListener("pointerup", this.onDocumentPointerUp);
  }

  moveDraggingAt(clientX, clientY) {
    this.draggingElem.style.left = clientX - this.pointerInitialShift.x + "px";
    this.draggingElem.style.top = clientY - this.pointerInitialShift.y + "px";
  }

  onDocumentPointerMove = (event) => {
    this.moveDraggingAt(event.clientX, event.clientY)

    for (let ind = 0; ind < this.element.children.length; ind++) {
      let i = this.elem.children[ind];
      if (i !== this.draggingElem && (event.clientY > i.getBoundingClientRect().top && event.clientY < i.getBoundingClientRect().bottom)) {
        console.log(event.clientY, i.getBoundingClientRect().top + i.offsetHeight / 2);
        if (event.clientY < i.getBoundingClientRect().top + i.offsetHeight / 2) {
          this.movePlaceholderAt(ind);
          break
        }
        this.movePlaceholderAt(ind + 1);
        break
      }
    }
    this.scrollIfCloseToWindowEdge(event)
  }

  scrollIfCloseToWindowEdge(event) {
    event.clientY < 20 ? window.scrollBy(0, -10) : event.clientY > document.documentElement.clientHeight - 20 && window.scrollBy(0, 10)
  }

  movePlaceholderAt(changeRow) {
    if (this.element.children[changeRow] !== this.placeholderElem) {
      this.element.insertBefore(this.placeholderElem, this.element.children[changeRow]);
    }
  }

  onDocumentPointerUp = () => {
    this.dragStop()
  }

  dragStop() {
    let placeholder = [...this.element.children].indexOf(this.placeholderElem);
    this.placeholderElem.replaceWith(this.draggingElem)
    this.draggingElem.classList.remove("sortable-list__item_dragging")
    this.draggingElem.style.left = ""
    this.draggingElem.style.top = ""
    this.draggingElem.style.width = ""
    this.draggingElem.style.height = ""
    document.removeEventListener("pointermove", this.onDocumentPointerMove)
    document.removeEventListener("pointerup", this.onDocumentPointerUp)
    this.draggingElem = null
    if (placeholder !== this.elementInitialIndex) {
      this.element.dispatchEvent(new CustomEvent("sortable-list-reorder",{
        bubbles: true,
        details: {
          from: this.elementInitialIndex,
          to: placeholder
        }
      }))
    }
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


