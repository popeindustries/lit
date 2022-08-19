import { escape } from './escape.js';

/**
 * @typedef { HTMLElement & { render?(): TemplateResult } } CustomElement
 */

export class ElementRenderer {
  /**
   * @param { CustomElement } ceClass
   * @param { string } tagName
   */
  static matchesClass(ceClass, tagName) {
    return false;
  }

  /**
   * @param { string } tagName
   */
  constructor(tagName) {
    this.tagName = tagName;
    /** @type { CustomElement } */
    this.element;
    // @ts-ignore
    this.observedAttributes = /** @type { Array<string> } */ (this.element.constructor.observedAttributes);
  }

  connectedCallback() {
    // @ts-ignore
    this.element.connectedCallback?.();
  }

  /**
   * @param { string } name
   * @param { string | null } oldValue
   * @param { string | null } newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    // Abstract
  }

  /**
   * @param { string } name
   * @param { unknown } value
   */
  setProperty(name, value) {
    // @ts-expect-error - indexable
    this.element[name] = value;
  }

  /**
   * @param { string } name
   * @param { string } value
   */
  setAttribute(name, value) {
    const oldValue = this.element.getAttribute(name);
    this.element.setAttribute(name, value);
    if (this.observedAttributes.includes(name)) {
      this.attributeChangedCallback(name, oldValue, value);
    }
  }

  renderAttributes() {
    let attributes = '';

    // @ts-expect-error - polyfill is an Array
    for (const { name, value } of this.element.attributes) {
      if (value === '' || value === undefined || value === null) {
        attributes += ` ${name}`;
      } else {
        attributes += ` ${name}="${escape(value, 'attribute')}"`;
      }
    }

    return attributes;
  }

  renderStyles() {
    return '';
  }

  /**
   * @returns { TemplateResult | string | null }
   */
  render() {
    const innerHTML = this.element.shadowRoot?.innerHTML || this.element.innerHTML;
    return innerHTML || (this.element.render?.() ?? null);
  }
}
