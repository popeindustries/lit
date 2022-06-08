import { html, LitElement } from 'lit';

export class CustomElement extends LitElement {
  static properties = {
    negative: { type: Boolean, attribute: true },
  };
  negative = false;
  render() {
    return html`
      <p ?negative="${this.negative}">Hello! This component is ${this.negative ? 'negative' : 'positive'}</p>
    `;
  }
}

customElements.define('custom-element', CustomElement);
