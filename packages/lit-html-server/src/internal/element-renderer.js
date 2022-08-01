import { escape } from './escape.js';

/**
 * @param { RenderOptions } options
 * @param { string } tagName
 * @param { typeof HTMLElement } [ceClass]
 */
export function getElementRenderer({ elementRenderers = [] }, tagName, ceClass = customElements.get(tagName)) {
  if (ceClass === undefined) {
    console.warn(`Custom element "${tagName}" was not registered.`);
  } else {
    for (const renderer of elementRenderers) {
      if (renderer.matchesClass(ceClass, tagName)) {
        return new renderer(tagName);
      }
    }
  }

  return new DefaultElementRenderer(tagName);
}

export class ElementRenderer {
  /**
   * @param { typeof HTMLElement } ceClass
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
    /** @type { HTMLElement } */
    this.element;
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
    this.attributeChangedCallback(name, oldValue, value);
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

  render() {
    const { innerHTML, shadowRoot } = this.element;

    if (shadowRoot !== null) {
      return `<template shadowroot="${shadowRoot.mode}">${shadowRoot.innerHTML}</template>`;
    }

    return innerHTML;
  }
}

class DefaultElementRenderer extends ElementRenderer {
  /**
   * @param { string } tagName
   */
  constructor(tagName) {
    super(tagName);
    const ceClass = customElements.get(tagName) ?? HTMLElement;
    this.element = /** @type { HTMLElement } */ (new ceClass());
  }
}
