/**
 * @license
 * Some of this code is copied and modified from `@lit-labs/ssr/lit-element-renderer.js`
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { CSSResult, html as h, LitElement, ReactiveElement } from './vendor/lit-element.js';
import { ElementRenderer } from '@popeindustries/lit-html-server';
import { _$LE } from 'lit-element/private-ssr-support.js';

const { attributeToProperty, changedProperties } = _$LE;

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
    this.element.createRenderRoot();
    // @ts-expect-error - protected
    // Call `willUpdate` (required not to use DOM APIs).
    this.element.willUpdate(changedProperties(this.element));
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
    attributeToProperty(this.element, name, newValue);
  }

  render() {
    if (this.element.shadowRoot) {
      const styles = /** @type { typeof LitElement } */ (this.element.constructor).elementStyles;
      // @ts-expect-error - protected
      const value = this.element.render();

      if (styles !== undefined && styles.length > 0) {
        let css = '';
        for (const style of styles) {
          css += /** @type { CSSResult } */ (style).cssText;
        }
        return h`<style>${css.replace(/[\n\s]/g, '')}</style>${value}`;
      } else {
        return value;
      }
    } else if ('renderLight' in this.element) {
      // @ts-ignore;
      return this.element.renderLight();
    } else {
      // @ts-expect-error - protected
      return this.element.render();
    }
  }
}
