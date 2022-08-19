/**
 * @license
 * Some of this code is copied and modified from `@lit-labs/ssr/lit-element-renderer.js`
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { CSSResult, LitElement, ReactiveElement } from './vendor/lit-element.js';
import { ElementRenderer } from '@popeindustries/lit-html-server/element-renderer.js';

export class LitElementRenderer extends ElementRenderer {
  /**
   * @param { typeof HTMLElement } ceClass
   */
  static matchesClass(ceClass) {
    return '_$litElement$' in ceClass;
  }

  /**
   * @param { string } tagName
   */
  constructor(tagName) {
    super(tagName);
    const ceClass = /** @type { typeof LitElement } */ (customElements.get(tagName));
    /** @type { LitElement } */
    this.element = new ceClass();
  }

  connectedCallback() {
    // @ts-expect-error - protected
    // Trigger `attachShadow()` to later determine if shadow DOM is being used
    this.element.createRenderRoot();
    // @ts-expect-error - protected
    this.element.willUpdate(this.element._$changedProperties);
    // @ts-expect-error - protected
    // Reflect properties to attributes.
    ReactiveElement.prototype.update.call(this.element);
  }

  /**
   * @param { string } name
   * @param { string | null } oldValue
   * @param { string | null } newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    // @ts-expect-error - protected
    this.element._$attributeToProperty(this.element, name, newValue);
  }

  renderStyles() {
    const styles = /** @type { typeof LitElement } */ (this.element.constructor).elementStyles;

    if (styles !== undefined && styles.length > 0) {
      let css = '';
      for (const style of styles) {
        css += /** @type { CSSResult } */ (style).cssText;
      }
      return css;
    }

    return '';
  }

  render() {
    if ('renderLight' in this.element) {
      // @ts-ignore;
      return this.element.renderLight();
    }
    // @ts-expect-error - protected
    return this.element.render();
  }
}
