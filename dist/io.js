class NodeBindings{constructor(e){Object.defineProperty(this,"node",{value:e,configurable:!0})}get(e){return this[e]=this[e]||new Binding(this.node,e),this[e]}dispose(){for(let e in this)this[e].dispose(),delete this[e];delete this.node}}class Binding{constructor(e,t){this.source=e,this.sourceProp=t,this.targets=[],this.targetsMap=new WeakMap,this._onTargetChanged=this._onTargetChanged.bind(this),this._onSourceChanged=this._onSourceChanged.bind(this),this.source.addEventListener(this.sourceProp+"-changed",this._onSourceChanged)}get value(){return this.source[this.sourceProp]}addTarget(e,t){if(-1===this.targets.indexOf(e)&&this.targets.push(e),this.targetsMap.has(e)){const o=this.targetsMap.get(e);-1===o.indexOf(t)&&(o.push(t),e.addEventListener(t+"-changed",this._onTargetChanged))}else this.targetsMap.set(e,[t]),e.addEventListener(t+"-changed",this._onTargetChanged)}removeTarget(e,t){if(this.targetsMap.has(e)){const o=this.targetsMap.get(e);if(t){const r=o.indexOf(t);-1!==r&&o.splice(r,1),e.removeEventListener(t+"-changed",this._onTargetChanged)}else{for(let t=o.length;t--;)e.removeEventListener(o[t]+"-changed",this._onTargetChanged);o.length=0}0===o.length&&this.targets.splice(this.targets.indexOf(e),1)}}_onTargetChanged(e){if(-1===this.targets.indexOf(e.target))return void console.error("Io: _onTargetChanged() should never fire when target is removed from binding.\n        Please file an issue at https://github.com/arodic/io/issues.");const t=this.source[this.sourceProp],o=e.detail.value;if(t!==o){if("number"==typeof o&&isNaN(o)&&"number"==typeof t&&isNaN(t))return;this.source[this.sourceProp]=o}}_onSourceChanged(e){if(e.target!=this.source)return void console.error("Io: _onSourceChanged() should always originate form source node.\n        Please file an issue at https://github.com/arodic/io/issues.");const t=e.detail.value;for(let e=this.targets.length;e--;){const o=this.targetsMap.get(this.targets[e]);for(let r=o.length;r--;){const i=this.targets[e][o[r]];if(i!==t){if("number"==typeof t&&isNaN(t)&&"number"==typeof i&&isNaN(i))continue;this.targets[e][o[r]]=t}}}}dispose(){this.source.removeEventListener(this.sourceProp+"-changed",this._onSourceChanged);for(let e in this.targets)this.removeTarget(this.targets[e]),delete this.targets[e]}}class NodeQueue extends Array{constructor(e){super(),Object.defineProperty(this,"node",{value:e,configurable:!0})}queue(e,t,o){const r=this.indexOf(e);-1===r?this.push(e,{property:e,value:t,oldValue:o}):this[r+1].value=t}dispatch(){const e=this.node;if(this.length){let t=!1;for(let o=0;o<this.length;o+=2){const r=this[o],i=this[o+1],s={detail:i};i.value!==i.oldValue?(t=!0,e[r+"Changed"]&&e[r+"Changed"](s),e.propertyChanged&&e.propertyChanged(s),e.dispatchEvent(r+"-changed",s.detail)):i.value}t&&(e.applyCompose(),e.changed()),this.length=0}}dispose(){this.length=0,delete this.node}}class ProtoListeners{constructor(e){for(let t=e.length;t--;){const o=e[t].constructor.Listeners;for(let e in o)this[e]=o[e]}}}class Listeners{constructor(e,t){Object.defineProperty(this,"node",{value:e}),Object.defineProperty(this,"propListeners",{value:{}}),Object.defineProperty(this,"activeListeners",{value:{}});for(let e in t)this[e]=t[e]}setPropListeners(e){for(let e in this.propListeners)delete this.propListeners[e];for(let t in e)t.startsWith("on-")&&(this.propListeners[t.slice(3,t.length)]=e[t])}connect(){const e=this.node;for(let t in this)this[t]instanceof Array?e.addEventListener(t,e[this[t][0]],this[t][1]):e.addEventListener(t,e[this[t]]);const t=this.propListeners;for(let o in t)t[o]instanceof Array?e.addEventListener(o,"function"==typeof t[o][0]?t[o][0]:e[t[o][0]],t[o][1]):e.addEventListener(o,"function"==typeof t[o]?t[o]:e[t[o]])}disconnect(){const e=this.node,t=this.propListeners;for(let t in this){const o="function"==typeof this[t]?this[t]:e[this[t]];e.removeEventListener(t,o)}for(let o in t){const r="function"==typeof t[o]?t[o]:e[t[o]];e.removeEventListener(o,r)}}dispose(){this.disconnect();const e=this.node,t=this.activeListeners;for(let o in t)for(let r=t[o].length;r--;)e.isElement&&HTMLElement.prototype.removeEventListener.call(e,o,t[o][r]),t[o].splice(r,1)}addEventListener(e,t,o){const r=this.node,i=this.activeListeners;i[e]=i[e]||[],-1===i[e].indexOf(t)&&(r.isElement&&HTMLElement.prototype.addEventListener.call(r,e,t,o),i[e].push(t))}removeEventListener(e,t,o){const r=this.node,i=this.activeListeners;if(void 0!==i[e]){const s=i[e].indexOf(t);-1!==s&&(r.isElement&&HTMLElement.prototype.removeEventListener.call(r,e,t,o),i[e].splice(s,1))}}dispatchEvent(e,t={},o=!0,r=this.node){if(r instanceof HTMLElement||r===window)HTMLElement.prototype.dispatchEvent.call(r,new CustomEvent(e,{type:e,detail:t,bubbles:o,composed:!0,cancelable:!0}));else{const o=this.activeListeners;if(void 0!==o[e]){const i=o[e].slice(0);for(let e=0;e<i.length;e++)i[e].call(r,{detail:t,target:r,path:[r]})}}}}class ProtoProperties{constructor(e){this._p=e;const t={};for(let o=e.length;o--;){const r=e[o].constructor.Attributes;for(let e in r)t[e]?Object.assign(t[e],new ProtoProperty(r[e])):t[e]=new ProtoProperty(r[e]),void 0===t[e].reflect&&(t[e].reflect=1),void 0===t[e].notify&&(t[e].notify=!1),void 0===t[e].enumerable&&(t[e].enumerable=!1);const i=e[o].constructor.Properties;for(let e in i)t[e]?Object.assign(t[e],new ProtoProperty(i[e])):t[e]=new ProtoProperty(i[e]),void 0===t[e].reflect&&(t[e].reflect=0),void 0===t[e].notify&&(t[e].notify=!0),void 0===t[e].enumerable&&(t[e].enumerable=!0)}for(let e in t){"_"===e.charAt(0)&&(t[e].notify=!1,t[e].enumerable=!1),void 0===t[e].value&&(t[e].value=void 0),void 0===t[e].type&&(t[e].type=void 0),this[e]=new Property(t[e])}}}class ProtoProperty{constructor(e){const t=typeof e;null==e?e={value:e}:"function"===t?e={type:e}:"number"===t||"string"===t||"boolean"===t?e={value:e,type:e.constructor}:"object"===t?e instanceof Array?e={value:[...e],type:Array}:e instanceof Binding?e={value:e.value,binding:e}:"function"!=typeof e.type&&(void 0===e.value||null===e.value||(e.type=e.value.constructor)):console.error("Property error!",t,e),void 0!==e.value&&(this.value=e.value),void 0!==e.type&&(this.type=e.type),void 0!==e.reflect&&(this.reflect=e.reflect),void 0!==e.notify&&(this.notify=e.notify),void 0!==e.enumerable&&(this.enumerable=e.enumerable),void 0!==e.binding&&(this.binding=e.binding)}}class Properties{constructor(e,t){Object.defineProperty(this,"node",{value:e});for(let o in t)this[o]=new Property(t[o]),this[o].instantiateCustomType(),void 0!==this[o].value&&("object"==typeof this[o].value&&null!==this[o].value?(this[o].value.isNode&&this[o].value.connect(e),e.queue(o,this[o].value,void 0)):1===this[o].reflect&&this.node.setAttribute(o,this[o].value))}get(e){return this[e].value}set(e,t,o){let r=this[e].value;if(t!==r){let i=this[e].binding,s=t instanceof Binding?t:null;s&&i&&s!==i&&i.removeTarget(this.node,e),s?(s.addTarget(this.node,e),this[e].binding=s,this[e].value=t.source[t.sourceProp],t=t.source[t.sourceProp]):this[e].value=t,t&&t.isNode&&t.connect(this.node),r&&r.isNode&&r.disconnect(this.node),this[e].notify&&r!==this[e].value&&(this.node.queue(e,this[e].value,r),this.node.__connected&&!o&&this.node.queueDispatch()),1===this[e].reflect&&this.node.setAttribute(e,t)}}connect(){for(let e in this)this[e].binding&&this[e].binding.addTarget(this.node,e)}disconnect(){for(let e in this)this[e].binding&&this[e].binding.removeTarget(this.node,e)}dispose(){for(let e in this)this[e].binding&&(this[e].binding.removeTarget(this.node,e),delete this[e].binding),delete this[e]}}class Property{constructor(e){this.value=e.value,this.type=e.type,this.reflect=e.reflect,this.notify=e.notify,this.enumerable=e.enumerable,this.binding=e.binding,this.type===Array&&this.value&&(this.value=[...this.value]),this.type===Object&&this.value&&(this.value={}),void 0===this.value&&this.type&&(this.type===Boolean?this.value=!1:this.type===String?this.value="":this.type===Number?this.value=0:this.type===Array?this.value=[]:this.type===Object&&(this.value={}))}instantiateCustomType(){void 0===this.value&&this.type&&this.type!==HTMLElement&&this.type!==Function&&(this.value=new this.type)}}const IoNodeMixin=e=>{const t=class extends e{static get Properties(){return{$:{type:Object,notify:!1}}}constructor(e={}){super(e),Object.defineProperty(this,"__nodeBindings",{value:new NodeBindings(this)}),Object.defineProperty(this,"__nodeQueue",{value:new NodeQueue(this)}),Object.defineProperty(this,"__properties",{value:new Properties(this,this.__protoProperties)}),Object.defineProperty(this,"__listeners",{value:new Listeners(this,this.__protoListeners)});for(let e=0;e<this.__functions.length;e++)this[this.__functions[e]]=this[this.__functions[e]].bind(this);this.__listeners.setPropListeners(e,this),this.setProperties(e)}connect(e){this._owner=this._owner||[],-1===this._owner.indexOf(e)&&(this._owner.push(e),this.__connected||this.connectedCallback())}disconnect(e){-1!==this._owner.indexOf(e)&&this._owner.splice(this._owner.indexOf(e),1),0===this._owner.length&&this.__connected&&this.disconnectedCallback()}preventDefault(e){e.preventDefault()}changed(){}applyCompose(){const e=this.compose;if(e)for(let t in e)this[t].setProperties(e[t]),this[t].__listeners.setPropListeners(e[t],this)}bind(e){return this.__nodeBindings.get(e)}set(e,t,o){if(this[e]!==t||o){const o=this[e];this[e]=t,this.dispatchEvent("value-set",{property:e,value:t,oldValue:o},!1)}}setProperties(e){for(let t in e){if(void 0===this.__properties[t])continue;const o=this.__properties[t].value;this.__properties.set(t,e[t],!0);const r=this.__properties[t].value;r!==o&&this.queue(t,r,o)}if(e.style)for(let t in e.style)this.style[t]=e.style[t],this.style.setProperty(t,e.style[t]);this.__connected&&this.queueDispatch()}_onObjectMutation(e){for(let t=this.__objectProps.length;t--;){const o=this.__objectProps[t];if(this.__properties[o].value===e.detail.object)return this[o+"Mutated"]&&this[o+"Mutated"](e),this.changed(),void this.applyCompose()}}connectedCallback(){this.__listeners.connect(),this.__properties.connect(),this.__connected=!0,this.__objectProps.length&&window.addEventListener("object-mutated",this._onObjectMutation),this.queueDispatch()}disconnectedCallback(){this.__listeners.disconnect(),this.__properties.disconnect(),this.__connected=!1,this.__objectProps.length&&window.removeEventListener("object-mutated",this._onObjectMutation)}dispose(){this.__nodeQueue.dispose(),this.__nodeBindings.dispose(),this.__listeners.dispose(),this.__properties.dispose()}addEventListener(e,t,o){this.__listeners.addEventListener(e,t,o)}removeEventListener(e,t,o){this.__listeners.removeEventListener(e,t,o)}dispatchEvent(e,t,o=!1,r){this.__listeners.dispatchEvent(e,t,o,r)}queue(e,t,o){this.__nodeQueue.queue(e,t,o)}queueDispatch(){this.__nodeQueue.dispatch()}};return t.Register=Register,t},Register=function(){let e=this.prototype;const t=[];for(;e&&e.constructor!==HTMLElement&&e.constructor!==Object;)t.push(e),e=e.__proto__;Object.defineProperty(this.prototype,"isNode",{value:e.constructor!==HTMLElement}),Object.defineProperty(this.prototype,"isElement",{value:e.constructor===HTMLElement}),e=this.prototype,Object.defineProperty(e,"__protochain",{value:t}),Object.defineProperty(e,"__protoProperties",{value:new ProtoProperties(t)}),Object.defineProperty(e,"__protoListeners",{value:new ProtoListeners(t)});const o=new Set;for(let e=t.length;e--;){const r=Object.getOwnPropertyNames(t[e]);for(let e=0;e<r.length;e++)(r[e].startsWith("_on")||r[e].startsWith("on"))&&o.add(r[e])}Object.defineProperty(e,"__functions",{value:[...o]}),Object.defineProperty(e,"__objectProps",{value:[]});const r=[Boolean,String,Number,HTMLElement,Function,void 0];for(let t in e.__protoProperties){const o=e.__protoProperties[t];o.notify&&-1==r.indexOf(o.type)&&e.__objectProps.push(t)}for(let t in e.__protoProperties)Object.defineProperty(e,t,{get:function(){return this.__properties.get(t)},set:function(e){this.__properties.set(t,e)},enumerable:!!e.__protoProperties[t].enumerable,configurable:!0})};IoNodeMixin.Register=Register;class IoNode extends(IoNodeMixin(Object)){}class IoElement extends(IoNodeMixin(HTMLElement)){static get Attributes(){return{tabindex:String,contenteditable:Boolean,class:String,role:String,title:String,label:String,id:String}}static get observedAttributes(){const e=[];for(let t in this.prototype.__protoProperties)-1===this.prototype.__protoProperties[t].reflect&&e.push(t);return e}attributeChangedCallback(e,t,o){const r=this.__properties[e].type;r===Boolean?null===o?this[e]=!1:""===o&&(this[e]=!0):r===Number||r===String?this[e]=r(o):r===Object||r===Array?this[e]=JSON.parse(o):this[e]=isNaN(Number(o))?o:Number(o)}titleChanged(){this.setAttribute("aria-label",this.title||this.label)}labelChanged(){this.setAttribute("aria-label",this.title||this.label)}connectedCallback(){super.connectedCallback(),"function"==typeof this.onResized&&(ro?ro.observe(this):(this._onResized(),window.addEventListener("resize",this._onResized)))}disconnectedCallback(){super.disconnectedCallback(),"function"==typeof this.onResized&&(ro?ro.unobserve(this):window.removeEventListener("resize",this._onResized))}_onResized(){clearTimeout(this.__resizeDebounce),this.__resizeDebounce=setTimeout(()=>{this.onResized(),delete this.__resizeDebounce},100)}dispose(){super.dispose(),delete this.parent,this.children.lenght=0}template(e,t){this.traverse(buildTree()(["root",e]).children,t||this)}traverse(e,t){const o=t.children;for(;o.length>e.length;){const e=o[o.length-1];for(let t=Array.from(e.querySelectorAll("*")).length;t--;);t.removeChild(e)}if(o.length<e.length){const r=document.createDocumentFragment();for(let t=o.length;t<e.length;t++)r.appendChild(constructElement(e[t]));t.appendChild(r)}for(let r=0;r<o.length;r++)if(o[r].localName!==e[r].name){const i=o[r];t.insertBefore(constructElement(e[r]),i);let s=Array.from(i.querySelectorAll("*"));t.removeChild(i);for(let e=s.length;e--;);}else if(o[r].removeAttribute("className"),Object.prototype.hasOwnProperty.call(o[r],"__properties"))o[r].setProperties(e[r].props),o[r].__listeners.setPropListeners(e[r].props,o[r]),o[r].__listeners.connect();else{for(let t in e[r].props)if("style"===t)for(let i in e[r].props.style)o[r].style.setProperty(i,e[r].props[t][i]);else"id"===t||("class"===t?o[r].className=e[r].props[t]:o[r][t]=e[r].props[t]);o[r].__listeners.setPropListeners(e[r].props,o[r]),o[r].__listeners.connect()}for(let t=0;t<e.length;t++)e[t].props.id&&(this.$[e[t].props.id]=o[t]),e[t].children&&"string"==typeof e[t].children?(o[t]._textNode||(o[t].childNodes.length&&(o[t].textContent=""),o[t]._textNode=document.createTextNode(""),o[t].appendChild(o[t]._textNode)),o[t]._textNode.nodeValue!==e[t].children&&(o[t]._textNode.nodeValue=e[t].children)):e[t].children&&"object"==typeof e[t].children&&this.traverse(e[t].children,o[t])}setAttribute(e,t){!0===t?HTMLElement.prototype.setAttribute.call(this,e,""):!1===t||""===t?this.removeAttribute(e):"string"!=typeof t&&"number"!=typeof t||this.getAttribute(e)!==String(t)&&HTMLElement.prototype.setAttribute.call(this,e,t)}focusTo(e,t){const o=t||this.getBoundingClientRect();let r=this,i=1/0,s=this.parentElement,n=0;for(;s&&n<10&&r===this;){const t=s.querySelectorAll('[tabindex="0"]');for(let s=t.length;s--;){if(!t[s].offsetParent)continue;const n=t[s].getBoundingClientRect(),a=n.x-o.x,l=n.y-o.y,c=Math.sqrt(a*a+l*l);switch(e){case"right":a>0&&c<i&&(r=t[s],i=c);break;case"left":a<0&&c<i&&(r=t[s],i=c);break;case"down":l>0&&c<i&&(r=t[s],i=c);break;case"up":l<0&&c<i&&(r=t[s],i=c)}}if(s=s.parentElement,n++,r!==this)return void r.focus()}}}const warning=document.createElement("div");let ro;function html(e){let t={string:"",vars:{}};for(let o=0;o<e.length;o++)t.string+=e[o]+(arguments[o+1]||"");t.string=t.string.replace(new RegExp("<style>","g"),""),t.string=t.string.replace(new RegExp("</style>","g"),"");let o=t.string.match(/-{2}?([a-z][a-z0-9]*)\b[^;]*;?/gi);if(o)for(let e=0;e<o.length;e++){let r=o[e].split(":");2===r.length&&(t.vars[r[0].trim()]=r[1].trim())}return t}warning.innerHTML='\nNo support for custom elements detected! <br />\nSorry, modern browser is required to view this page.<br />\nPlease try <a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a>,\n<a href="https://www.google.com/chrome/">Chrome</a> or\n<a href="https://www.apple.com/lae/safari/">Safari</a>',IoElement.Register=function(){IoNodeMixin.Register.call(this);const e=this.name.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();Object.defineProperty(this,"localName",{value:e}),Object.defineProperty(this.prototype,"localName",{value:e}),void 0!==window.customElements?(window.customElements.define(e,this),initStyle(this.prototype.__protochain)):document.body.insertBefore(warning,document.body.children[0])},void 0!==window.ResizeObserver&&(ro=new ResizeObserver(e=>{for(let t of e)t.target._onResized()}));const constructElement=function(e){let t=window.customElements?window.customElements.get(e.name):null;if(t)return new t(e.props);let o=document.createElement(e.name);for(let t in e.props){if("style"===t)for(let r in e.props[t])o.style[r]=e.props[t][r];else"id"===t||("class"===t?o.className=e.props[t]:o[t]=e.props[t]);"name"===t&&o.setAttribute("name",e.props[t])}return Object.defineProperty(o,"__listeners",{value:new Listeners(o)}),o.__listeners.setPropListeners(e.props,o),o.__listeners.connect(),o},clense=(e,t)=>t?"string"==typeof t[0]?[...e,t]:[...e,...t]:e,buildTree=()=>e=>e&&"object"==typeof e[1]&&!Array.isArray(e[1])?{name:e[0],props:e[1],children:Array.isArray(e[2])?e[2].reduce(clense,[]).map(buildTree()):e[2]||""}:buildTree()([e[0],{},e[1]||""]);function initStyle(e){const t=e[0].constructor.name.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();for(let o=e.length;o--;){const r=e[o].constructor.Style,i=e[o].constructor.name.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();if(r){r.string.match(new RegExp(/([^,{}]+)(,(?=[^}]*{)|\s*{)/,"g")).map(e=>{(e=e.trim()).startsWith("@")||e.startsWith(":host")||e.startsWith("from")||e.startsWith("to")||e.startsWith("/*")||e.startsWith("body")||console.warn(t+': CSS Selector not prefixed with ":host"! This will cause style leakage!')}),r.string=r.string.replace(new RegExp(":host","g"),t);const e=document.createElement("style");e.innerHTML=r.string,e.setAttribute("id","io-style_"+t+(i!==t?"_"+i:"")),document.head.appendChild(e)}}}const nodes={};let hashes={};const parseHashes=function(){return window.location.hash.substr(1).split("&").reduce(function(e,t){const o=t.split("=");return e[o[0]]=o[1],e},{})},getHashes=function(){hashes=window.location.hash.substr(1).split("&").reduce(function(e,t){const o=t.split("=");return e[o[0]]=o[1],e},{});for(let e in hashes)if(nodes[e]&&""!==nodes[e]){const t=hashes[e].replace(/%20/g," ");isNaN(t)?nodes[e].value="true"===t||"false"===t?JSON.parse(t):t:nodes[e].value=JSON.parse(t)}for(let e in nodes)nodes[e].hash&&!hashes[e]&&(nodes[e].value=nodes[e].defValue)},setHashes=function(e){let t="";for(let o in nodes)(nodes[o].hash||e)&&void 0!==nodes[o].value&&""!==nodes[o].value&&nodes[o].value!==nodes[o].defValue&&("string"==typeof nodes[o].value?t+=o+"="+nodes[o].value+"&":t+=o+"="+JSON.stringify(nodes[o].value)+"&");for(let e in hashes)e&&!nodes[e]&&(t+=e+"="+hashes[e]+"&");t=t.slice(0,-1),window.location.hash=t,window.location.hash||history.replaceState({},document.title,window.location.pathname+window.location.search)};window.addEventListener("hashchange",getHashes,!1),getHashes();class IoStorageNode extends IoNode{static get Properties(){return{key:String,value:void 0,defValue:void 0,hash:Boolean}}constructor(e,t){if(super(e),this.defValue=t,this.hash)if(void 0!==hashes[this.key]){const e=hashes[this.key].replace(/%20/g," ");try{this.value=JSON.parse(e)}catch(t){this.value=e}}else this.value=t;else{const e="/"!==window.location.pathname?window.location.pathname+this.key:this.key,o=localStorage.getItem(e);this.value=null!=o?JSON.parse(o):t}}valueChanged(){if(this.hash)setHashes();else{const e="/"!==window.location.pathname?window.location.pathname+this.key:this.key;null===this.value||void 0===this.value?localStorage.removeItem(e):localStorage.setItem(e,JSON.stringify(this.value))}}}function IoStorage(e,t,o){return nodes[e]||(nodes[e]=new IoStorageNode({key:e,hash:o},t),nodes[e].binding=nodes[e].bind("value"),nodes[e].connect(window)),nodes[e].binding}IoStorageNode.Register();class IoCss extends IoNode{static get Properties(){return{backgroundColor:[0,0,0,1],color:[1,1,1,1],colorLink:[1,1,1,1],colorFocus:[1,1,1,1],borderWidth:1}}getCssRgba(e,t){return e.getPropertyValue(t).split("(")[1].split(")")[0].split(",").map(e=>e/255*window.devicePixelRatio)}getCssFloat(e,t){return parseFloat(e.getPropertyValue(t))*window.devicePixelRatio}updateValues(){const e=getComputedStyle(document.body);this.setProperties({color:this.getCssRgba(e,"--io-color"),backgroundColor:this.getCssRgba(e,"--io-background-color"),borderWidth:this.getCssFloat(e,"--io-border-width"),colorLink:this.getCssRgba(e,"--io-color-link"),colorFocus:this.getCssRgba(e,"--io-color-focus")}),this.dispatchEvent("object-mutated",{object:this},!1,window)}}IoCss.Register();const IoCssSingleton=new IoCss;IoCssSingleton.connect();const animationQueue=new Array,animate=function(){requestAnimationFrame(animate);for(let e=animationQueue.length;e--;)animationQueue[e]();animationQueue.length=0};function queueAnimation(e){-1===animationQueue.indexOf(e)&&animationQueue.push(e)}requestAnimationFrame(animate);const canvas=document.createElement("canvas"),gl=canvas.getContext("webgl",{antialias:!1,premultipliedAlpha:!1});gl.imageSmoothingEnabled=!1,gl.getExtension("OES_standard_derivatives"),gl.enable(gl.BLEND),gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA),gl.disable(gl.DEPTH_TEST);const positionBuff=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,positionBuff),gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,1,0,-1,-1,0,1,-1,0,1,1,0]),gl.STATIC_DRAW),gl.bindBuffer(gl.ARRAY_BUFFER,null);const uvBuff=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,uvBuff),gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,1,0,0,1,0,1,1]),gl.STATIC_DRAW),gl.bindBuffer(gl.ARRAY_BUFFER,null);const indexBuff=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuff),gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([3,2,1,3,1,0]),gl.STATIC_DRAW),gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null),gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuff);const shadersCache=new WeakMap;let currentProgram;class IoGl extends IoElement{static get Style(){return html`<style>:host {overflow: hidden !important;position: relative !important;border: 0 !important;-webkit-tap-highlight-color: transparent;user-select: none;}:host > img {position: absolute !important;pointer-events: none;image-rendering: pixelated;width: 100%;height: 100%;}</style>`}static get Properties(){return{size:[0,0],aspect:1,pxRatio:1,globals:Object}}static get Vert(){return"\n      attribute vec3 position;\n      attribute vec2 uv;\n      varying vec2 vUv;\n\n      void main(void) {\n        vUv = uv;\n        gl_Position = vec4(position, 1.0);\n      }\n\n"}static get Frag(){return"\n      varying vec2 vUv;\n      void main(void) {\n        vec2 px = uSize * vUv;\n        px = mod(px, 8.0);\n        gl_FragColor = cssBackgroundColor;\n        if (px.x <= 1.0 || px.y <= 1.0) gl_FragColor = vec4(vUv, 0.0, 1.0);\n        if (px.x <= 1.0 && px.y <= 1.0) gl_FragColor = cssColor;\n      }\n\n"}initPropertyUniform(e,t){if(t.notify)switch(t.type){case Boolean:return"uniform int "+e+";\n";case Number:return"uniform float "+e+";\n";case Array:return this._vecLengths[e]=t.value.length,"uniform vec"+t.value.length+" "+e+";\n"}return""}constructor(e){super(e),this.globals=IoCssSingleton;let t="\n      #extension GL_OES_standard_derivatives : enable\n      precision highp float;\n\n";this._vecLengths={};for(let e in IoCssSingleton.__properties){const o="css"+e.charAt(0).toUpperCase()+e.slice(1),r=IoCssSingleton.__protoProperties[e];t+=this.initPropertyUniform(o,r)}t+="\n";for(let e in this.__properties){const o="u"+e.charAt(0).toUpperCase()+e.slice(1),r=this.__protoProperties[e];t+=this.initPropertyUniform(o,r)}const o=gl.createShader(gl.VERTEX_SHADER);if(gl.shaderSource(o,this.constructor.Vert),gl.compileShader(o),!gl.getShaderParameter(o,gl.COMPILE_STATUS)){let e=gl.getShaderInfoLog(o);console.error("IoGl [Vertex Shader] "+this.localName+" error:"),console.warn(e)}const r=gl.createShader(gl.FRAGMENT_SHADER);if(gl.shaderSource(r,t+this.constructor.Frag),gl.compileShader(r),!gl.getShaderParameter(r,gl.COMPILE_STATUS)){let e=gl.getShaderInfoLog(r);console.error("IoGl [Frament Shader] "+this.localName+" error:"),console.warn(e)}shadersCache.has(this.constructor)?this._shader=shadersCache.get(this.constructor):(this._shader=gl.createProgram(),gl.attachShader(this._shader,o),gl.attachShader(this._shader,r),shadersCache.set(this.constructor,this._shader)),gl.linkProgram(this._shader);const i=gl.getAttribLocation(this._shader,"position");gl.bindBuffer(gl.ARRAY_BUFFER,positionBuff),gl.vertexAttribPointer(i,3,gl.FLOAT,!1,0,0),gl.enableVertexAttribArray(i);const s=gl.getAttribLocation(this._shader,"uv");gl.bindBuffer(gl.ARRAY_BUFFER,uvBuff),gl.vertexAttribPointer(s,2,gl.FLOAT,!1,0,0),gl.enableVertexAttribArray(s),this.template([["img",{id:"img"}]]),this.render=this.render.bind(this),this.updateCssUniforms()}onResized(){const e=this.getBoundingClientRect(),t=window.devicePixelRatio,o=Math.ceil(e.width*t),r=Math.ceil(e.height*t);this.setProperties({size:[o,r],aspect:o/r,pxRatio:t})}globalsMutated(){this.updateCssUniforms(),queueAnimation(this.render)}propertyChanged(e){const t=e.detail.property,o="u"+t.charAt(0).toUpperCase()+t.slice(1);this.updatePropertyUniform(o,this.__properties[t])}changed(){queueAnimation(this.render)}render(){const e=this.size[0],t=this.size[1];e&&t&&(canvas.width=e,canvas.height=t,gl.viewport(0,0,e,t),gl.clearColor(0,0,0,0),gl.clear(gl.COLOR_BUFFER_BIT),gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0),this.$.img.src=canvas.toDataURL("image/png",.9))}setShaderProgram(){currentProgram!==this._shader&&(currentProgram=this._shader,gl.useProgram(this._shader))}updatePropertyUniform(e,t){this.setShaderProgram(),t.notify&&this.setUniform(e,t.type,t.value)}updateCssUniforms(){this.setShaderProgram();for(let e in IoCssSingleton.__properties){const t="css"+e.charAt(0).toUpperCase()+e.slice(1);this.updatePropertyUniform(t,IoCssSingleton.__properties[e])}}setUniform(e,t,o){const r=gl.getUniformLocation(this._shader,e);let i;switch(t){case Boolean:gl.uniform1i(r,o?1:0);break;case Number:gl.uniform1f(r,o||0);break;case Array:switch(i=[0,1,2,3],o instanceof Array||"object"!=typeof o||(void 0!==o.x?i=["x","y","z","w"]:void 0!==o.r?i=["r","g","b","a"]:void 0!==o.h?i=["h","s","v","a"]:void 0!==o.c&&(i=["c","m","y","k"])),this._vecLengths[e]){case 2:gl.uniform2f(r,void 0!==o[i[0]]?o[i[0]]:1,void 0!==o[i[1]]?o[i[1]]:1);break;case 3:gl.uniform3f(r,void 0!==o[i[0]]?o[i[0]]:1,void 0!==o[i[1]]?o[i[1]]:1,void 0!==o[i[2]]?o[i[2]]:1);break;case 4:gl.uniform4f(r,void 0!==o[i[0]]?o[i[0]]:1,void 0!==o[i[1]]?o[i[1]]:1,void 0!==o[i[2]]?o[i[2]]:1,void 0!==o[i[3]]?o[i[3]]:1)}}}}function filterObject(e,t){if(t(e))return e;for(let o in e){if(t(e[o]))return e[o];if("object"==typeof e[o]){const r=filterObject(e[o],t);if(r)return r}}}IoGl.Register();class IoThemeMixin extends IoNode{static get Style(){return html`<style>item {display: inline-block;-webkit-tap-highlight-color: transparent;overflow: hidden;text-overflow: ellipsis;flex-wrap: nowrap;white-space: nowrap;height: 1.375em;border: var(--io-inset-border);border-radius: var(--io-border-radius);border-color: transparent;background-color: transparent;background-image: none;padding: var(--io-spacing);}button {background-color: var(--io-background-color-dark);background-image: var(--io-gradient-button);border: var(--io-outset-border);border-color: var(--io-outset-border-color);border-radius: var(--io-border-radius);padding: var(--io-spacing);padding-left: calc(2 * var(--io-spacing));padding-right: calc(2 * var(--io-spacing));transition: background-color 0.25s;}field {border: var(--io-inset-border);border-radius: var(--io-border-radius);color: var(--io-color-field);background-color: var(--io-background-color-field);background-image: none;box-shadow: var(--io-shadow-inset);padding: var(--io-spacing);user-select: text;width: 4.5em;height: 1.375em;min-width: 0.5em;}panel {display: flex;flex-direction: column;align-self: stretch;justify-self: stretch;align-items: flex-start;border: var(--io-outset-border);border-radius: var(--io-border-radius);border-color: var(--io-outset-border-color);padding: var(--io-spacing);background: var(--io-background-color-dark);background-image: var(--io-gradient-panel);}frame {display: flex;flex-direction: column;align-self: stretch;justify-self: stretch;align-items: flex-start;border: var(--io-inset-border);border-radius: var(--io-border-radius);color: var(--io-color);background-color: var(--io-background-color);background-image: none;box-shadow: var(--io-shadow-inset);padding: var(--io-spacing);}content {display: flex;flex-direction: column;flex: 1 1 auto;overflow-x: hidden;overflow-y: auto;-webkit-overflow-scrolling: touch;-webkit-tap-highlight-color: transparent;}</style>`}constructor(e){super(e),this.styleElement=document.createElement("style"),this.styleElement.setAttribute("id","io-theme-mixins"),this.styleElement.innerHTML=this.mixins,document.head.appendChild(this.styleElement)}}IoThemeMixin.Register=function(){IoNode.Register.call(this);let e="";for(let t=this.prototype.__protochain.length;t--;){const o=this.prototype.__protochain[t].constructor.Style;if(o){const t=Array.from(o.string.matchAll(new RegExp(/([\s\S]*?){([\s\S]*?)}/,"g")));for(let o=0;o<t.length;o++){const r=t[o][1].replace(/\s/g,""),i=t[o][2];Object.defineProperty(this.prototype,r,{value:i}),e+=`.io-${r} {\n${i}\n}\n`}}}Object.defineProperty(this.prototype,"mixins",{value:e})},IoThemeMixin.Register();const IoThemeMixinSingleton=new IoThemeMixin;class IoTheme extends IoElement{static get Style(){return html`<style>body {--io-spacing: 4px;--io-border-radius: 3px;--io-border-width: 1px;}@keyframes spinner {to {transform: rotate(360deg);}}body .io-loading {background-image: repeating-linear-gradient(135deg, var(--io-background-color-light), var(--io-background-color) 3px, var(--io-background-color) 7px, var(--io-background-color-light) 10px) !important;background-repeat: repeat;position: relative;}body .io-loading:after {content: '';box-sizing: border-box;position: absolute;top: 50%;left: 50%;width: 40px;height: 40px;margin-top: -20px;margin-left: -20px;border-radius: 50%;border: var(--io-border);border-top-color: #000;animation: spinner .6s linear infinite;}</style>`}get dark(){return html`<style>body {--io-background-color: rgb(42, 42, 42);--io-background-color-light: rgb(56, 56, 56);--io-background-color-dark: rgb(64, 64, 64);--io-background-color-field: rgb(35, 35, 35);--io-color: rgb(210, 210, 210);--io-color-error: rgb(255, 96, 16);--io-color-link: rgb(190, 230, 150);--io-color-focus: rgb(80, 210, 355);--io-color-field: rgb(190, 190, 190);--io-color-number: rgb(32, 164, 255);--io-color-string: rgb(240, 64, 22);--io-color-boolean: rgb(210, 90, 190);--io-gradient-button: linear-gradient(0deg, rgba(0, 0, 0, 0.25), transparent 50%), linear-gradient(180deg, rgba(255, 255, 255, 0.075), transparent 50%);--io-gradient-panel: linear-gradient(100deg, rgba(0, 0, 0, 0.25), transparent 50%), linear-gradient(280deg, rgba(255, 255, 255, 0.075), transparent 50%);--io-border-color: rgb(140, 140, 140);--io-border: var(--io-border-width) solid var(--io-border-color);--io-inset-border-color: rgb(140, 140, 140) var(--io-border-color) var(--io-border-color) rgb(140, 140, 140);--io-inset-border: var(--io-border-width) inset var(--io-border-color);--io-outset-border-color: var(--io-border-color) rgb(32, 32, 32) rgb(32, 32, 32) var(--io-border-color);--io-outset-border: var(--io-border-width) outset var(--io-border-color);--io-shadow: 2px 2px 5px rgba(0,0,0,0.2);--io-shadow-inset: 2px 2px 2px inset rgba(0,0,0,0.05);--io-shadow-outset: -1px -1px 2px inset rgba(0,0,0,0.1), 2px 2px 2px inset rgba(255,255,255,0.3);}</style>`}get light(){return html`<style>body {--io-background-color: rgb(245, 245, 245);--io-background-color-light: rgb(255, 255, 255);--io-background-color-dark: rgb(215, 215, 215);--io-background-color-field: rgb(235, 235, 235);--io-color: rgb(42, 42, 42);--io-color-error: rgb(225, 100, 100);--io-color-link: rgb(30, 180, 30);--io-color-focus: rgb(80, 210, 355);--io-color-field: rgb(0, 0, 0);--io-color-number: rgb(32, 164, 255);--io-color-string: rgb(240, 64, 22);--io-color-boolean: rgb(210, 90, 190);--io-gradient-button: linear-gradient(0deg, rgba(0, 0, 0, 0.15), transparent 75%), linear-gradient(180deg, rgba(255, 255, 255, 0.25), transparent 75%);--io-gradient-panel: linear-gradient(100deg, rgba(0, 0, 0, 0.15), transparent 75%), linear-gradient(280deg, rgba(255, 255, 255, 0.25), transparent 75%);--io-border-color: rgb(180, 180, 180);--io-border: var(--io-border-width) solid var(--io-border-color);--io-inset-border-color: rgb(220, 220, 220) var(--io-border-color) var(--io-border-color) rgb(220, 220, 220);--io-inset-border: var(--io-border-width) inset var(--io-border-color);--io-outset-border-color: var(--io-border-color) rgb(210, 210, 210) rgb(210, 210, 210) var(--io-border-color);--io-outset-border: var(--io-border-width) outset var(--io-border-color);--io-shadow: 2px 2px 5px rgba(0,0,0,0.2);--io-shadow-inset: 1px 1px 1px inset rgba(0,0,0,0.1);--io-shadow-outset: -1px -1px 1px inset rgba(0,0,0,0.2), 1px 1px 1px inset rgba(255,255,255,0.6);}</style>`}static get Properties(){return{theme:"light"}}constructor(e){super(e),this.styleElement=document.createElement("style"),this.styleElement.setAttribute("id","io-theme")}changed(){this.styleElement.innerHTML=this[this.theme].string,setTimeout(()=>{IoCssSingleton.updateValues()})}}IoTheme.Register();const IoThemeSingleton=new IoTheme;IoThemeSingleton.connect(),document.head.appendChild(IoThemeSingleton.styleElement);export{Binding,IoElement,IoGl,IoNode,IoNodeMixin,IoStorage,IoTheme,IoThemeMixinSingleton,IoThemeSingleton,NodeBindings,filterObject,html,nodes as storageNodes};