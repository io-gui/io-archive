## `IoItem`

Extends `IoElement`.

It displays label or value property.
Arow keys change focus to the nearest focusable element in the chosen direction.

<io-element-demo element="io-item" properties='{"label": "Item", "value": "null"}'></io-element-demo>

## `IoGl`

`IoGL` is a base class for WebGL-based custom elements. The appearance of such elements is defined in fragment shader programs that execute on the GPU. All numeric properties are automatically bound to shader uniforms, including `IoThemeSingleton` CSS properties. You can define your custom shaders inside `static get Frag()` return string.

<io-element-demo element="io-gl" width="255px" height="255px" properties='{"color": [0, 0, 0, 1]}' config='{"background": ["io-color-vector"], "color": ["io-color-vector"]}'></io-element-demo>


An example of the most basic fragment shader program:

```javascript
class MyElement extends IoGl {
  static get Frag() {
    return `
    void main(void) {
      gl_FragColor = cssBackgroundColor;
    }`;
  }
}
```

See `IoSliderKnob` and `IoHsvaSv` for more advanced examples.

## `IoButton`

Extends `IoItem`.

Button element. When clicked or activated by space/enter key, it calls the `action` property function with optional `value` argument.

<io-element-demo element="io-button" properties='{"label": "Button", "action": "null"}'></io-element-demo>

## `IoBoolean`

Extends `IoButton`.

Input element for `Boolean` data type displayed as text. It can be configured to display custom `true` or `false` string depending on its `value`.

<io-element-demo element="io-boolean" properties='{"value": true, "true": "true", "false": "false"}'></io-element-demo>

## `IoBoolicon`

Extends `IoBoolean`. Implements `IoIcon`.

Input element for `Boolean` data type displayed as icon. It can be configured to display custom `true` or `false` icon depending on its `value`.

<io-element-demo element="io-boolicon" properties='{"value": true, "true": "icons:check", "false": "icons:uncheck"}'></io-element-demo>

## `IoSwitch`

Extends `IoBoolean`.

Input element for `Boolean` data type displayed as switch.

<io-element-demo element="io-switch" properties='{"value": true}'></io-element-demo>

## `IoString`

Extends `IoItem`.

Input element for `String` data type.

<io-element-demo element="io-string" properties='{"value": "Hello io!"}'></io-element-demo>

## `IoNumber`

Extends `IoItem`.

Input element for `Number` data type. It clamps the `value` to `min`/`max` and rounds it to the nearest `step` increment. If `ladder` property is enabled, it displays an interactive float ladder element when clicked/taped. Alternatively, ladder can be expanded by middle click or ctrl key regardless of ladder property.

<io-element-demo element="io-number" width="5em" properties='{"value": 1337, "conversion": 1, "step": 0.1, "min": 0, "max": 10000, "ladder": true}'></io-element-demo>
<io-element-demo element="io-number" width="5em" properties='{"value": 1337, "conversion": 1, "step": 0.0002, "min": 0, "max": 10000, "ladder": true}'></io-element-demo>

Value can be displayed using `conversion` factor. For example, conversion factor of `180/π` would display radians as degrees.

<io-element-demo element="io-number" width="5em" properties='{"value": 0, "step": 0.2617993877991494, "conversion": 57.29577951308232, "min": -6.283185307179586, "max": 6.283185307179586, "ladder": true}'></io-element-demo>

## `IoSlider`

Extends `IoGl`.

Input element for `Number` data type displayed as slider.
It can be configured to clamp the `value` to `min`/`max` and round it to the nearest `step` increment.
Keys left/right/up/down+shift and pageup/pagedown change the value in step incements. Home/end keys set the value to min/max.

<io-element-demo element="io-slider" properties='{"value": 0.1, "step": 0.01, "min": -0.5, "max": 0.5}'></io-element-demo>

## `IoNumberSlider`

Implements `IoNumber` and `IoSlider`.

Input element for `Number` data type combining `IoNumber` and `IoSlider`

<io-element-demo element="io-number-slider" properties='{"value": 0.1, "step": 0.1, "conversion": 1, "min": -0.5, "max": 0.5}'></io-element-demo>
<io-element-demo element="io-number-slider" properties='{"value": 0, "step": 0.2617993877991494, "conversion": 57.29577951308232, "min": -6.283185307179586, "max": 6.283185307179586}'></io-element-demo>
<io-element-demo element="io-number-slider" properties='{"value": 0.1, "step": 0.1, "conversion": 0.2, "min": -0.5, "max": 0.5}'></io-element-demo>

## `IoIcon`

SVG icon element. Displays SVG content specified via `icon` parameter. Custom SVG assets need to be registered with `IoIconsetSingleton`.

<io-element-demo element="io-icon" properties='{"icon": "icons:link"}' config='{"icon": ["io-option-menu", {"options": ["icons:link", "icons:unlink", "icons:check", "icons:uncheck"]}]}'></io-element-demo>

## `IoIconsetSingleton`

Extends `IoNode`.

Global database for SVG assets to be used with `IoIcon`. Icons are registered using `namespace` and `id` attribute.

```javascript
import {IoIconsetSingleton} from "./path_to/io-core.js";
const svgString = `<svg><g id="myicon"><path d="..."/></g></svg>`;

/* register icons under "custom" namespace */
IoIconsetSingleton.registerIcons('custom', svgString);
/* retrieve specific icon */
const icon = IoIconsetSingleton.getIcon('custom:myicon');
```

## `IoLayerSingleton`

Full-window click-blocking layer for elements designed to be displayed on top all other interface. When clicked, it collapses all clild elements by setting their `expanded` property to `false`. Child elements should emmit bubbling `"expanded"` event when expanded/collapsed.

## `IoLadderSingleton`

Interactive number ladder. When dragged horizontally, it changes the value in step increments. Dragging speed affects the rate of change exponentially. Up/down arrow keys change the step focus while left/right change the value in step increments. Escape key collapses the ladder and restores the focus to previously focused element. If shift key is pressed, value is rounded to the nearest step incement.

<io-element-demo element="io-ladder" expanded properties='{"value": 0.1, "step": 0.0001, "conversion": 0.25, "min": -10000, "max": 10000, "expanded": true}'></io-element-demo>

## `IoThemeSingleton`

`IoThemeSingleton` holds top-level CSS variables for Io design system. Variables are grouped in different themes and can be collectively switched by changing `theme` property.

```javascript
IoThemeSingleton.theme = 'dark';
```

Moreover, some of the key theme variables such as `'--io-color'` and `'--io-background-color'` are mapped to numeric properties `cssColor` and `cssBackgroundColor` source code for more advanced example.