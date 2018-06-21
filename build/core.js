// Get a list of io prototypes by walking down the prototype chain.
class Prototypes extends Array {
  constructor(_constructor) {
    super();
    let proto = _constructor.prototype;
    // Stop at HTMLElement for IoElement and Object for IoNode.
    while (proto && proto.constructor !== HTMLElement && proto.constructor !== Object) {
      this.push(proto);
      proto = proto.__proto__;
    }
  }
}

// Creates a properties object with configurations inherited from prototype chain.

const illegalPropNames = ['style', 'className', 'listeners'];

class ProtoProperties {
  constructor(prototypes) {
    const propertyDefs = {};
    for (let i = prototypes.length; i--;) {
      let prop = prototypes[i].constructor.properties;
      for (let key in prop) {
        if (illegalPropNames.indexOf(key) !== -1) {
          console.warn('Illegal property name:', key);
        }
        let propDef = new Property(prop[key], true);
        if (propertyDefs[key]) propertyDefs[key].assign(propDef);
        else propertyDefs[key] = propDef;
      }
    }
    for (let key in propertyDefs) {
      this[key] = new Property(propertyDefs[key]);
    }
  }
  // Instances should use this function to create unique clone of properties.
  clone() {
    let properties = new ProtoProperties([]);
    for (let prop in this) {
      properties[prop] = this[prop].clone();
    }
    return properties;
  }
}

function defineProperties(prototype) {
  for (let prop in prototype.__props) {
    Object.defineProperty(prototype, prop, {
      get: function() {
        return this.__props[prop].value;
      },
      set: function(value) {
        if (this.__props[prop].value === value) return;
        let oldValue = this.__props[prop].value;
        this.__props[prop].value = value;
        if (this.__props[prop].reflect) {
          this.setAttribute(prop, this.__props[prop].value);
        }
        if (this.__props[prop].observer) {
          this[this.__props[prop].observer](value, oldValue);
        }
        this.dispatchEvent(prop + '-changed', {value: value, oldValue: oldValue});
        this.update();
      },
      enumerable: prototype.__props[prop].enumerable,
      configurable: true
    });
  }
}

/*
Creates a property object from properties defined in the prototype chain.
{
  value: <property value>
  type: <constructor of the value>
  observer: <neme of the vunction to be called when value changes>
  reflect: <reflection to HTML element attribute>
  binding: <binding object if bound>
  config: <optional configutation for GUI>
}
 */
class Property {
  constructor(propDef) {
    if (propDef === null || propDef === undefined) {
      propDef = { value: propDef };
    } else if (typeof propDef === 'function') {
      // Shorthand property definition by constructor.
      propDef = {type: propDef};
    } else if (typeof propDef !== 'object') {
      // Shorthand property definition by value
      propDef = {value: propDef, type: propDef.constructor};
    }
    // Set default value if type is defined but value is not.
    if (propDef.value === undefined && propDef.type) {
      if (propDef.type === Boolean) propDef.value = false;
      else if (propDef.type === String) propDef.value = '';
      else if (propDef.type === Number) propDef.value = 0;
      else if (propDef.type === Array) propDef.value = [];
      else if (propDef.type === Object) propDef.value = {};
      else if (propDef.type !== HTMLElement && propDef.type !== Function) propDef.value = new propDef.type();
    }
    this.value = propDef.value;
    this.type = propDef.type;
    this.observer = propDef.observer;
    this.reflect = propDef.reflect;
    this.binding = propDef.binding;
    this.config = propDef.config;
    this.enumerable = propDef.enumerable !== undefined ? propDef.enumerable : true;
  }
  // Helper function to assign new values as we walk up the inheritance chain.
  assign(propDef) {
    if (propDef.value !== undefined) this.value = propDef.value;
    if (propDef.type !== undefined) this.type = propDef.type;
    if (propDef.observer !== undefined) this.observer = propDef.observer;
    if (propDef.reflect !== undefined) this.reflect = propDef.reflect;
    if (propDef.binding !== undefined) this.binding = propDef.binding;
    if (propDef.config !== undefined) this.config = propDef.config;
    if (propDef.enumerable !== undefined) this.enumerable = propDef.enumerable;
  }
  // Clones the property. If property value is objects it does one level deep object clone.
  clone() {
    let prop = new Property(this);
    if (prop.value instanceof Array) {
      prop.value = [ ...prop.value ];
    } else if (prop.value instanceof Object) {
      let value = prop.value;
      if (typeof value.clone === 'function') {
        prop.value = value.clone();
      } else {
        prop.value = prop.type ? new prop.type() : {};
        for (let p in value) prop.value[p] = value[p];
      }
    }
    return prop;
  }
}

// Creates a list of listeners defined in prototype chain.
class ProtoListeners {
  constructor(prototypes) {
    for (let i = prototypes.length; i--;) {
      let prop = prototypes[i].constructor.listeners;
      for (let j in prop) this[j] = prop[j];
    }
  }
  connect(element) {
    for (let i in this) {
      element.addEventListener(i, element[this[i]]);
    }
  }
  disconnect(element) {
    for (let i in this) {
      element.removeEventListener(i, element[this[i]]);
    }
  }
}

// Creates a list of functions defined in prototype chain.
class ProtoFunctions extends Array {
  constructor(prototypes) {
    super();
    for (let i = prototypes.length; i--;) {
      let names = Object.getOwnPropertyNames(prototypes[i]);
      for (let j = 0; j < names.length; j++) {
        if (names[j] === 'constructor') continue;
        if (typeof prototypes[i][names[j]] !== 'function') continue;
        if (prototypes[i][names[j]].name === 'anonymous') {
          continue;
        }
        if (this.indexOf(names[j]) === -1) this.push(names[j]);
        if (names[j] === 'value') console.log(prototypes[i][names[j]]);
      }
    }
  }
  // Binds all functions to instance.
  bind(element) {
    for (let i = 0; i < this.length; i++) {
      element[this[i]] = element[this[i]].bind(element);
    }
  }
}

class Binding {
  constructor(source, sourceProp) {
    this.source = source;
    this.sourceProp = sourceProp;
    this.targets = [];
    this.targetsMap = new WeakMap();
    this.updateSource = this.updateSource.bind(this);
    this.updateTargets = this.updateTargets.bind(this);
    this.setSource(this.source);
  }
  setSource() {
    this.source.addEventListener(this.sourceProp + '-changed', this.updateTargets);
    for (let i = this.targets.length; i--;) {
      let targetProps = this.targetsMap.get(this.targets[i]);
      for (let j = targetProps.length; j--;) {
        this.targets[i].__props[targetProps[j]].value = this.source[this.sourceProp];
        // TODO: test observers on binding hot-swap!
      }
    }
  }
  setTarget(target, targetProp) {
    if (this.targets.indexOf(target) === -1) this.targets.push(target);
    if (this.targetsMap.has(target)) {
      let targetProps = this.targetsMap.get(target);
      if (targetProps.indexOf(targetProp) === -1) { // safe check needed?
        targetProps.push(targetProp);
        target.addEventListener(targetProp + '-changed', this.updateSource);
      }
    } else {
      this.targetsMap.set(target, [targetProp]);
      target.addEventListener(targetProp + '-changed', this.updateSource);
    }
  }
  removeTarget(target, targetProp) {
    if (this.targetsMap.has(target)) {
      let targetProps = this.targetsMap.get(target);
      let index = targetProps.indexOf(targetProp);
      if (index !== -1) {
        targetProps.splice(index, 1);
      }
      if (targetProps.length === 0) this.targets.splice(this.targets.indexOf(target), 1);
      // TODO: remove from WeakMap?
      target.removeEventListener(targetProp + '-changed', this.updateSource);
    }
  }
  updateSource(event) {
    if (this.targets.indexOf(event.srcElement) === -1) return;
    if (this.source[this.sourceProp] !== event.detail.value) {
      this.source[this.sourceProp] = event.detail.value;
    }
  }
  updateTargets(event) {
    if (event.srcElement != this.source) return;
    for (let i = this.targets.length; i--;) {
      let targetProps = this.targetsMap.get(this.targets[i]);
      for (let j = targetProps.length; j--;) {
        if (this.targets[i][targetProps[j]] !== event.detail.value) {
          this.targets[i][targetProps[j]] = event.detail.value;
        }
      }
    }
  }
}

// Creates a list of listeners passed to element instance as arguments.
// TODO: apply top native HTMLElement
// TODO: prune from properties
class InstanceListeners {
  setListeners(props) {
    for (let l in props) {
      if (l.startsWith('on-')) {
        this[l.slice(3, l.length)] = props[l];
      }
    }
  }
  connect(element) {
    for (let i in this) {
      let listener = typeof this[i] === 'function' ? this[i] : element[this[i]];
      element.addEventListener(i, listener);
    }
  }
  disconnect(element) {
    for (let i in this) {
      let listener = typeof this[i] === 'function' ? this[i] : element[this[i]];
      element.removeEventListener(i, listener);
    }
  }
}

const __debounceTimeout = new WeakMap();

const IoCoreMixin = (superclass) => class extends superclass {
  static get properties() {
    return {
      // TODO: is this necessary?
      id: {
        type: String,
        enumerable: false
      }
    };
  }
  constructor(initProps = {}) {
    super();
    Object.defineProperty(this, '__bindings', {value: {}});
    Object.defineProperty(this, '__listeners', {value: {}});
    Object.defineProperty(this, '__observeQueue', {value: []});
    Object.defineProperty(this, '__notifyQueue', {value: []});

    Object.defineProperty(this, '__props', {value: this.__props.clone()});
    Object.defineProperty(this, '__propListeners', {value: new InstanceListeners()});

    Object.defineProperty(this, '$', {value: {}}); // TODO: consider clearing on update. possible memory leak!

    this.__protoFunctions.bind(this);
    this.__propListeners.setListeners(initProps);

    // TODO: is this necessary?
    // TODO: test!
    this.setProperties(initProps, true);
    //TODO: update should only run once
  }
  update() {}
  dispose() {} // TODO: implement
  bind(prop) {
    this.__bindings[prop] = this.__bindings[prop] || new Binding(this, prop);
    return this.__bindings[prop];
  }
  set(prop, value) {
    let oldValue = this[prop];
    this[prop] = value;
    this.dispatchEvent(prop + '-set', {value: value, oldValue: oldValue}, true);
  }
  setProperties(props, update) {

    for (let p in props) {

      if (this.__props[p] === undefined) continue;

      let oldBinding = this.__props[p].binding;
      let oldValue = this.__props[p].value;

      let binding;
      let value;

      if (props[p] instanceof Binding) {
        binding = props[p];
        value = props[p].source[props[p].sourceProp];
      } else {
        value = props[p];
      }

      this.__props[p].binding = binding;
      this.__props[p].value = value;

      if (value !== oldValue) {
        if (this.__props[p].reflect) this.setAttribute(p, value);
        this.queue(this.__props[p].observer, p, value, oldValue);
      }

      if (binding !== oldBinding) {
        binding.setTarget(this, p);
        // TODO: test extensively
        if (oldBinding) console.warn('Disconnect!', binding, oldBinding);
      }

    }

    if (props['className']) {
      this.className = props['className'];
    }

    if (props['style']) {
      for (let s in props['style']) {
        this.style[s] = props['style'][s];
      }
    }

    if (update) this.update();
  }
  connectedCallback() {
    this.__protoListeners.connect(this);
    this.__propListeners.connect(this);
    this.queueDispatch();
    for (let p in this.__props) {
      if (this.__props[p].binding) {
        this.__props[p].binding.setTarget(this, p); //TODO: test
      }
    }
  }
  disconnectedCallback() {
    this.__protoListeners.disconnect(this);
    this.__propListeners.disconnect(this);
    for (let p in this.__props) {
      if (this.__props[p].binding) {
        this.__props[p].binding.removeTarget(this, p);
        // TODO: this breaks binding for transplanted elements.
        // delete this.__props[p].binding;
        // TODO: possible memory leak!
      }
    }
  }
  addEventListener(type, listener) {
    this.__listeners[type] = this.__listeners[type] || [];
    let i = this.__listeners[type].indexOf(listener);
    if (i === - 1) {
      this.__listeners[type].push(listener);
      if (superclass === HTMLElement) HTMLElement.prototype.addEventListener.call(this, type, listener);
    }
  }
  hasEventListener(type, listener) {
    return this.__listeners[type] !== undefined && this.__listeners[type].indexOf(listener) !== - 1;
  }
  removeEventListener(type, listener) {
    if (this.__listeners[type] !== undefined) {
      let i = this.__listeners[type].indexOf(listener);
      if (i !== - 1) {
        this.__listeners[type].splice(i, 1);
        if (superclass === HTMLElement) HTMLElement.prototype.removeEventListener.call(this, type, listener);
      }
    }
  }
  dispatchEvent(type, detail, bubbles = true, src = this) {
    if (superclass === HTMLElement) {
      HTMLElement.prototype.dispatchEvent.call(src, new CustomEvent(type, {
        detail: detail,
        bubbles: bubbles,
        composed: true
      }));
    } else {
      // TODO: fix path/src argument
      let path = src;
      // console.log(path);
      if (this.__listeners[type] !== undefined) {
        let array = this.__listeners[type].slice(0);
        for (let i = 0, l = array.length; i < l; i ++) {
          path = path || [this];
          array[i].call(this, {detail: detail, target: this, bubbles: bubbles, path: path});
          // TODO: test bubbling
          if (bubbles) {
            let parent = this.parent;
            while (parent) {
              path.push(parent);
              parent.dispatchEvent(type, detail, true, path);
              parent = parent.parent;
            }
          }
        }
      }
    }
  }
  queue(observer, prop, value, oldValue) {
    if (this.__observeQueue.indexOf('update') === -1) {
      this.__observeQueue.push('update');
    }
    if (observer) {
      if (this.__observeQueue.indexOf(observer) === -1) {
        this.__observeQueue.push(observer);
      }
    }
    this.__notifyQueue.push(prop + '-changed', {value: value, oldValue: oldValue});
  }
  queueDispatch() {
    for (let j = 0; j < this.__observeQueue.length; j++) {
      this[this.__observeQueue[j]]();
    }
    for (let j = 0; j < this.__notifyQueue.length; j++) {
      this.dispatchEvent(this.__notifyQueue[j][0], this.__notifyQueue[j][1]);
    }
    this.__observeQueue.length = 0;
    this.__notifyQueue.length = 0;
  }
  debounce(func, wait) {
    clearTimeout(__debounceTimeout.get(func));
    __debounceTimeout.set(func, setTimeout(func, wait));
  }
};

IoCoreMixin.Register = function () {
  Object.defineProperty(this.prototype, '__prototypes', {value: new Prototypes(this)});
  Object.defineProperty(this.prototype, '__props', {value: new ProtoProperties(this.prototype.__prototypes)});
  Object.defineProperty(this.prototype, '__protoFunctions', {value: new ProtoFunctions(this.prototype.__prototypes)});
  Object.defineProperty(this.prototype, '__protoListeners', {value: new ProtoListeners(this.prototype.__prototypes)});

  defineProperties(this.prototype);
};

class IoElement extends IoCoreMixin(HTMLElement) {
  static get properties() {
    return {
      tabindex: {
        type: String,
        reflect: true,
        enumerable: false
      },
      contenteditable: {
        type: Boolean,
        reflect: true,
        enumerable: false
      }
    };
  }
  connectedCallback() {
    super.connectedCallback();
    for (let prop in this.__props) {
      if (this.__props[prop].reflect) {
        this.setAttribute(prop, this.__props[prop].value);
      }
    }
  }
  render(children, host) {
    this.traverse(buildTree()(['root', children]).children, host || this);
  }
  traverse(vChildren, host) {
    const children = host.children;
    // remove trailing elements
    while (children.length > vChildren.length) host.removeChild(children[children.length - 1]);

    // create new elements after existing
    const frag = document.createDocumentFragment();
    for (let i = children.length; i < vChildren.length; i++) {
      frag.appendChild(constructElement(vChildren[i]));
    }
    host.appendChild(frag);

    for (let i = 0; i < children.length; i++) {

      // replace existing elements
      if (children[i].localName !== vChildren[i].name) {
        const oldElement = children[i];
        host.insertBefore(constructElement(vChildren[i]), oldElement);
        host.removeChild(oldElement);

      // update existing elements
      } else {
        // Io Elements
        if (children[i].hasOwnProperty('__props')) {
          children[i].setProperties(vChildren[i].props); // TODO: test
          children[i].queueDispatch();
          children[i].__propListeners.setListeners(vChildren[i].props);
          children[i].__propListeners.connect(children[i]);
        // Native HTML Elements
        } else {
          for (let prop in vChildren[i].props) {
            if (prop === 'style') {
              for (let s in vChildren[i].props['style']) {
                children[i].style[s] = vChildren[i].props['style'][s];
              }
            }
            else children[i][prop] = vChildren[i].props[prop];
          }

        }
      }
    }

    for (let i = 0; i < vChildren.length; i++) {
      if (vChildren[i].props.id) {
        this.$[vChildren[i].props.id] = children[i];
      }
      if (vChildren[i].children && typeof vChildren[i].children === 'string') {
        children[i].innerText = vChildren[i].children;
      } else if (vChildren[i].children && typeof vChildren[i].children === 'object') {
        this.traverse(vChildren[i].children, children[i]);
      }
    }
  }
  // fixup for shitty setAttribute spec
  setAttribute(attr, value) {
    if (value === true) {
      HTMLElement.prototype.setAttribute.call(this, attr, '');
    } else if (value === false || value === '') {
      this.removeAttribute(attr);
    } else if (typeof value == 'string' || typeof value == 'number') {
      HTMLElement.prototype.setAttribute.call(this, attr, value);
    }
  }
}

IoElement.Register = function() {

  IoCoreMixin.Register.call( this );

  initStyle(this.prototype.__prototypes);
  customElements.define(this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), this);

};

IoElement.Register();

function html() {return arguments[0][0];}

const constructElement = function(vDOMNode) {
 let ConstructorClass = customElements.get(vDOMNode.name);
 if (ConstructorClass) return new ConstructorClass(vDOMNode.props);

 let element = document.createElement(vDOMNode.name);
 for (let prop in vDOMNode.props) {
   if (prop === 'style') {
     for (let s in vDOMNode.props[prop]) {
       element.style[s] = vDOMNode.props[prop][s];
     }
   } else element[prop] = vDOMNode.props[prop];
 }
 return element;
};

// https://github.com/lukejacksonn/ijk
const clense = (a, b) => !b ? a : typeof b[0] === 'string' ? [...a, b] : [...a, ...b];
const buildTree = () => node => !!node && typeof node[1] === 'object' && !Array.isArray(node[1]) ? {
   ['name']: node[0],
   ['props']: node[1],
   ['children']: Array.isArray(node[2]) ? node[2].reduce(clense, []).map(buildTree()) : node[2] || ''
 } : buildTree()([node[0], {}, node[1] || '']);

const _stagingElement = document.createElement('div');

function initStyle(prototypes) {
  let localName = prototypes[0].constructor.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  for (let i = prototypes.length; i--;) {
    let style = prototypes[i].constructor.style;
    if (style) {
      if (i < prototypes.length - 1 && style == prototypes[i + 1].constructor.style) continue;
      style = style.replace(new RegExp(':host', 'g'), localName);
      _stagingElement.innerHTML = style;
      let element = _stagingElement.querySelector('style');
      element.setAttribute('id', 'io-style-' + localName + '-' + i);
      document.head.appendChild(element);
    }
  }
}

class IoNode extends IoCoreMixin(Object) {
  connectedCallback() {
    // TODO: implement connected
    this.__proto__.__protoListeners.connect(this);
  }
  disconnectedCallback() {
    // TODO: implement disconnected
    this.__proto__.__protoListeners.disconnect(this);
  }
  dispose() {
    // TODO test
    delete this.parent;
    this.children.lenght = 0;
    for (let l in this.__listeners) this.__listeners[l].lenght = 0;
    for (let p in this.__props) delete this.__props[p];
  }
  setAttribute() {
    console.warn('io-node: setAttribute not suppoerted!');
  }
}

IoNode.Register = IoCoreMixin.Register;

export { IoElement, html, initStyle, IoNode };