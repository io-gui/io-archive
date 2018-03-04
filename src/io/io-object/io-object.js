import {Io, html} from "../io.js";
import {IoBoolean} from "../io-boolean/io-boolean.js";
import {IoNumber} from "../io-number/io-number.js";
import {IoString} from "../io-string/io-string.js";
import {IoFunction} from "../io-function/io-function.js";

import {IoObjectProp} from "./io-object-prop.js";
import {UiCollapsable} from "../../ui/ui-collapsable/ui-collapsable.js";

export class IoObject extends Io {
  static get style() {
    return html`
      <style>
        :host {
          display: inline-block;
        }
        :host > .io-wrapper {
          margin: 2px;
          border-radius: 2px;
          background: #444;
        }
        :host > .io-row {
          display: flex;
          flex-direction: row;
        }
      </style>
    `;
  }
  static get properties() {
    return {
      value: {
        type: Object,
        observer: 'update'
      },
      expanded: {
        type: Boolean,
        observer: 'update',
        reflectToAttribute: true
      }
    };
  }
  getPropConfigs(keys) {
    let configs = {};
    let proto = this.value.__proto__;

    while (proto) {
      let c = IoObject.CONFIG[proto.constructor.name];
      if (c) configs = Object.assign(configs, c);
      proto = proto.__proto__;
    }

    let propConfigs = {};

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = this.value[key];
      let type = typeof value;
      let cstr = (value && value.constructor) ? value.constructor.name : 'null';

      propConfigs[key] = {};

      if (configs.hasOwnProperty('type:' + type)) {
        propConfigs[key] = configs['type:' + type];
      }
      if (configs.hasOwnProperty('constructor:'+cstr)) {
        propConfigs[key] = configs['constructor:'+cstr];
      }
      if (configs.hasOwnProperty('key:' + key)) {
        propConfigs[key] = configs['key:' + key];
      }
      if (configs.hasOwnProperty('value:' + String(value))) {
        propConfigs[key] = configs['value:' + String(value)];
      }
    }
    return propConfigs;
  }
  update() {
    let propConfigs = this.getPropConfigs(Object.keys(this.value));
    const Prop = entry => ['div', {class: 'io-row'}, [
      ['span', entry[0] + ':'],
      ['io-object-prop', {key: entry[0], value: this.value, config: entry[1]}]
    ]];
    this.render([
      ['ui-collapsable', {label: this.value.constructor.name, expanded: this.bind('expanded'), elements:
        Object.entries(propConfigs).map(Prop)
      }]
    ]);
  }
}

IoObject.CONFIG = {
  'Object' : {
    'type:string': {tag: 'io-string', props: {}},
    'type:number': {tag: 'io-number', props: {step: 0.1}},
    'type:boolean': {tag: 'io-boolean', props: {}},
    'type:object': {tag: 'io-object', props: {}},
    'type:function': {tag: 'io-function', props: {}},
    'value:null': {tag: 'io-string', props: {}},
    'value:undefined': {tag: 'io-string', props: {}}
  }
};

window.customElements.define('io-object', IoObject);
