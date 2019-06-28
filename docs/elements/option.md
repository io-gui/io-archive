Option select element.

Extends `<io-button>`. Implements `<io-menu-options>`.

<io-element-demo element="io-option" properties='{"value": 1, "options": [1,2,3], "label": ""}'></io-element-demo>

<io-element-demo element="io-option" properties='{"value": 1, "options": [{"value": 1, "label": "one"}, {"value": 2, "label": "two"}, {"value": 3, "label": "three"}], "label": ""}'></io-element-demo>

When clicked or activated by space/enter key, it expands a menu with selectable options.

<!-- TODO: document menu events  -->

#### Properties ####

| Property | Type | Description | Default |
|:---------|:-----|:------------|:--------|
| **`options`** | Array    | Array with options | `[]` |

#### Events ####

| Event | Description | Detail | Bubbles |
|:------|:------------|:-------|:--------|
| **`value-set`** | Value set by user action | `property`, `value`, `oldValue` | false |