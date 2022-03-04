class Tooltip {

  element;
  distanceFromCursor = 10;

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
  }

  showTooltip = event => {
    if (event.target.dataset.tooltip === undefined) return;
    if (Tooltip.currentTooltip) Tooltip.currentTooltip.remove();

    document.addEventListener('mousemove', this.moveTooltip);

    this.element.style.left = (event.pageX + this.distanceFromCursor) + "px";
    this.element.style.top = (event.pageY + this.distanceFromCursor) + "px";
    this.element.style.display = "block"
    this.element.innerHTML = event.target.dataset.tooltip;

    Tooltip.currentTooltip = this.element
    document.body.append(this.element)
  }

  moveTooltip = event => {
      if (Tooltip.currentTooltip) {
        this.element.style.left = (event.pageX + this.distanceFromCursor) + "px";
        this.element.style.top = (event.pageY + this.distanceFromCursor) + "px";
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
