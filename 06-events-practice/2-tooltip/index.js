class Tooltip {
  element;
  static currentTooltip = null;
  constructor(){
    if(!Tooltip.currentTooltip){
      Tooltip.currentTooltip = this;
    } else {
      return Tooltip.currentTooltip;
    }
  }

  render() {
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip")
    this.element = tooltip;
    document.body.append(this.element);
  }

  initialize () {
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip")
    this.element = tooltip;

    document.addEventListener('pointerover', this.showTooltip)
    document.addEventListener('pointerout', this.deleteTooltip)
    document.addEventListener('mousemove', this.moveTooltip)
  }

  showTooltip = e => {
    if (e.target.dataset.tooltip === undefined) return;
    if (Tooltip.currentTooltip) Tooltip.currentTooltip.remove();

    this.element.style.left = (e.pageX + 10) + "px";
    this.element.style.top = (e.pageY + 10) + "px";
    this.element.style.display = "block"
    this.element.innerHTML = e.target.dataset.tooltip;

    Tooltip.currentTooltip = this.element
    document.body.append(this.element)
  }

  moveTooltip = e => {
      if (Tooltip.currentTooltip) {
        this.element.style.left = (e.pageX + 10) + "px";
        this.element.style.top = (e.pageY + 10) + "px";
      }
  }

  deleteTooltip () {
    if (Tooltip.currentTooltip) {
      Tooltip.currentTooltip.remove()
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
  }

}

export default Tooltip;
