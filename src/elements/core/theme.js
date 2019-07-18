import {IoElement} from "../../io.js";
import {html} from "../../io.js";

export class IoTheme extends IoElement {
  static get Style() {
    return html`<style>
    body {
      --io-spacing: 4px;
      --io-border-radius: 3px;
      --io-border-width: 1px;
    }
    </style>`;
  }
  get dark() {
    return html`<style>
      body {
        --io-background-color: rgb(42, 42, 42);
        --io-background-color-light: rgb(56, 56, 56);
        --io-background-color-dark: rgb(64, 64, 64);
        --io-background-color-field: rgb(35, 35, 35);

        --io-color: rgb(210, 210, 210);
        --io-color-error: rgb(255, 96, 16);
        --io-color-link: rgb(190, 230, 150);
        --io-color-focus: rgb(80, 210, 355);
        --io-color-field: rgb(190, 190, 190);
        --io-color-number: rgb(32, 164, 255);
        --io-color-string: rgb(240, 64, 22);
        --io-color-boolean: rgb(210, 90, 190);

        --io-gradient-button: linear-gradient(0deg, rgba(0, 0, 0, 0.25), transparent 50%), linear-gradient(180deg, rgba(255, 255, 255, 0.075), transparent 50%);
        --io-gradient-collapsable: linear-gradient(100deg, rgba(0, 0, 0, 0.25), transparent 50%), linear-gradient(280deg, rgba(255, 255, 255, 0.075), transparent 50%);

        --io-border-color: rgb(140, 140, 140);
        --io-border: var(--io-border-width) solid var(--io-border-color);
        --io-inset-border-color: rgb(140, 140, 140) var(--io-border-color) var(--io-border-color) rgb(140, 140, 140);
        --io-inset-border: var(--io-border-width) inset var(--io-border-color);
        --io-outset-border-color: var(--io-border-color) rgb(32, 32, 32) rgb(32, 32, 32) var(--io-border-color);
        --io-outset-border: var(--io-border-width) outset var(--io-border-color);

        --io-shadow: 2px 2px 5px rgba(0,0,0,0.2);
        --io-shadow-inset: 2px 2px 2px inset rgba(0,0,0,0.05);
        --io-shadow-outset: -1px -1px 2px inset rgba(0,0,0,0.1), 2px 2px 2px inset rgba(255,255,255,0.3);
      }
    </style>`;
  }
  get light() {
    return html`<style>
      body {
        --io-background-color: rgb(245, 245, 245);
        --io-background-color-light: rgb(255, 255, 255);
        --io-background-color-dark: rgb(215, 215, 215);
        --io-background-color-field: rgb(235, 235, 235);

        --io-color: rgb(42, 42, 42);
        --io-color-error: rgb(225, 100, 100);
        --io-color-link: rgb(30, 180, 30);
        --io-color-focus: rgb(80, 210, 355);
        --io-color-field: rgb(0, 0, 0);
        --io-color-number: rgb(32, 164, 255);
        --io-color-string: rgb(240, 64, 22);
        --io-color-boolean: rgb(210, 90, 190);

        --io-gradient-button: linear-gradient(0deg, rgba(0, 0, 0, 0.15), transparent 75%), linear-gradient(180deg, rgba(255, 255, 255, 0.25), transparent 75%);
        --io-gradient-collapsable: linear-gradient(100deg, rgba(0, 0, 0, 0.15), transparent 75%), linear-gradient(280deg, rgba(255, 255, 255, 0.25), transparent 75%);

        --io-border-color: rgb(180, 180, 180);
        --io-border: var(--io-border-width) solid var(--io-border-color);
        --io-inset-border-color: rgb(220, 220, 220) var(--io-border-color) var(--io-border-color) rgb(220, 220, 220);
        --io-inset-border: var(--io-border-width) inset var(--io-border-color);
        --io-outset-border-color: var(--io-border-color) rgb(210, 210, 210) rgb(210, 210, 210) var(--io-border-color);
        --io-outset-border: var(--io-border-width) outset var(--io-border-color);

        --io-shadow: 2px 2px 5px rgba(0,0,0,0.2);
        --io-shadow-inset: 1px 1px 1px inset rgba(0,0,0,0.1);
        --io-shadow-outset: -1px -1px 1px inset rgba(0,0,0,0.2), 1px 1px 1px inset rgba(255,255,255,0.6);
      }
    </style>`;
  }
  static get Properties() {
    return {
      theme: 'light',
    };
  }
  constructor(props) {
    super(props);
    this.styleElement = document.createElement('style');
    this.styleElement.setAttribute('id', 'io-theme');
  }
  changed() {
    let styleString = this[this.theme].string;
    styleString = styleString.replace(new RegExp('<style>', 'g'), '');
    styleString = styleString.replace(new RegExp('</style>', 'g'), '');
    this.styleElement.innerHTML = styleString;
  }
}

IoTheme.Register();
IoTheme.singleton = new IoTheme();
IoTheme.singleton.connect();
document.head.appendChild(IoTheme.singleton.styleElement);
