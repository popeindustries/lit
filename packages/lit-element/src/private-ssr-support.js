/**
 * @typedef { import ('./vendor/lit-element.js').LitElement } LitElement
 */

import { _$LE as p } from './vendor/lit-element.js';

export const _$LE = {
  /**
   * @param { LitElement } element
   * @param { string } name
   * @param { string | null } value
   */
  attributeToProperty(element, name, value) {
    p._$attributeToProperty(element, name, value);
  },
};
