// import { html, LitElement } from 'lit-html';

// export class CustomElement extends LitElement {
//   static properties = {
//     negative: { type: Boolean, attribute: true },
//   };
//   negative = false;
//   render() {
//     return html`
//       <p ?negative="${this.negative}">Hello! This component is ${this.negative ? 'negative' : 'positive'}</p>
//     `;
//   }
// }

// customElements.define('custom-element', CustomElement);

import { ElementRenderer, html } from '../../lit-html-server.js';

export class CustomElement extends HTMLElement {
  negative = false;
  /**
   * @param { string } name
   * @param { string | null } oldValue
   * @param { string | null } newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'negative') {
      this.negative = newValue === '';
    }
  }

  render() {
    return html`
      <p ?negative="${this.negative}">Hello! This component is ${this.negative ? 'negative' : 'positive'}</p>
    `;
  }
}

export class Renderer extends ElementRenderer {
  /**
   * @param { typeof HTMLElement } ceClass
   * @param { string } tagName
   */
  static matchesClass(ceClass, tagName) {
    return tagName === 'custom-element';
  }

  /**
   * @param { string } tagName
   */
  constructor(tagName) {
    super(tagName);
    const ceClass = /** @type { CustomElementConstructor } */ (customElements.get(tagName));
    this.element = /** @type { CustomElement } */ (new ceClass());
  }

  /**
   * @param { string } name
   * @param { string | null } oldValue
   * @param { string | null } newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    this.element.attributeChangedCallback(name, oldValue, newValue);
  }

  render() {
    return this.element.render();
  }
}
