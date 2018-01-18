import {IoBase, html} from "./io-base.js"

class IoObjectConstructor extends IoBase {
  static get is() { return 'io-object-constructor'; }
  static get template() {
    return html`
      <style>
      :host {
        display: inline-block;
        cursor: pointer;
        line-height: 1em;
      }
      ::slotted(.hidden) {
        display: none;
      }
      ::slotted(.io-label):after {
        content: ":";
      }
      </style><slot></slot>
    `;
  }
  static get properties() {
    return {
      object: {
        type: Object,
        observer: '_updateJob',
      },
      label: {
        value: '',
        type: String,
        observer: '_updateJob'
      },
      expanded: {
        type: Boolean,
        observer: '_updateJob',
        reflectToAttribute: true
      }
    }
  }
  constructor(props) {
    super(props);
    this.setAttribute('tabindex', 0);
    this._toggleListener = this._toggleHandler.bind(this);
    this._preventDefault = this.preventDefault.bind(this);
    this.$label = this.appendHTML(html`<span class='io-label'></span>`);
    this.$constructor = this.appendHTML(html`<span class='io-constructor'></span>`);
  }
  connectedCallback() {
    this.addEventListener('click', this._toggleListener);
    this.addEventListener('keydown', this._toggleListener);
    this.addEventListener('mousedown', this._preventDefault);
    this._updateJob();
  }
  disconnectedCallback() {
    this.removeEventListener('click', this._toggleListener);
    this.removeEventListener('keydown', this._toggleListener);
    this.removeEventListener('mousedown', this._preventDefault);
  }
  _toggleHandler(event) {
    if (event.which == 13 || event.which == 32 || event.type == 'click') {
      event.preventDefault();
      let ioObject = this.parentElement;
      ioObject.expanded = !ioObject.expanded;
      setTimeout(() => {
        ioObject.querySelector('io-object-constructor').focus();
      });
    }
  }
  _update() {
    this.$label.innerText = this.label;
    this.$label.classList.toggle('hidden', !this.label);
    let _name = this._object.constructor.name || 'Object';
    if (this.expanded) {
      this.$constructor.innerHTML = '▾' + _name;
    } else {
      this.$constructor.innerHTML = '▸' + _name + '(' + Object.keys(this._object).length + ')';
    }
  }
}

window.customElements.define(IoObjectConstructor.is, IoObjectConstructor);

export { IoObjectConstructor }
