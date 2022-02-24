// import {logEntryPolyfills} from "@babel/preset-env/lib/debug";


export default class NotificationMessage {

  constructor(
    text = "",
    {
    duration = 0,
    type = ""
    } = {}) {
    this.text = text
    this.duration = duration
    this.type = type
  }

  getTemplate() {
    return `
    <div class="notification ${this.type}" style="--value:${this.duration /1000}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">${this.text}</div>
      </div>
    </div>`;
  }

  show() {
    const elem = document.querySelectorAll(".notification");
    if(elem)  {
      for(const item of elem) {
        item.style.display = "none";
      }
    }

    const element = document.createElement(`div`);
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    document.body.append(this.element);
    setTimeout(() => this.remove(), this.duration)
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}
