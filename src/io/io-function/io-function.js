import {html} from "../ioutil.js"
import {Io} from "../io.js"

export class IoFunction extends Io {
  static get shadowStyle() {
    return html`
      <style>
        :host {
          display: inline-block;
          cursor: pointer;
          font-style: italic;
        }
      </style>
    `;
  }
  static get properties() {
    return {
      value: {
        observer: '_update'
      }
    }
  }
  _update() {
    // https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;
    var fnStr = this.value.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES) || [];
    this.innerText = 'ƒ(' + result + ')';
  }
}

window.customElements.define('io-function', IoFunction);