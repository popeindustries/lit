/**
 * @typedef { HTMLElement & { render?(): TemplateResult } } CustomElement
 */

import { ElementRenderer } from './element-renderer.js';

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

class DefaultElementRenderer extends ElementRenderer {
  /**
   * @param { string } tagName
   */
  constructor(tagName) {
    super(tagName);
    const ceClass = customElements.get(tagName) ?? HTMLElement;
    this.element = /** @type { CustomElement } */ (new ceClass());
  }
}
