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
    this.render();
  }

  static countNotification = 0;
  static notificationId = 0

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

  show(targetTag) {
    if (NotificationMessage.notificationId && NotificationMessage.countNotification) {
      document.getElementById((NotificationMessage.notificationId-1).toString()).remove();
    }
    this.element.id = NotificationMessage.notificationId++;

    if (targetTag) {
      targetTag.append(this.element);
    }
    else {
      document.body.append(this.element);
    }


    NotificationMessage.countNotification++;
    if (this.duration !== 0) {
    setTimeout(() => {
      this.remove();
      NotificationMessage.countNotification--;
      }
      , this.duration)}
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }

  render () {
    const element = document.createElement(`div`);
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

  }
}
