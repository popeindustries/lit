/**
 * @typedef { import('./partial-hydration-mixin.d.js').CustomElementBase } CustomElementBase
 */

/**
 *
 * @param { CustomElementBase } Base
 */
export function PartialHydrationMixin(Base) {
  return class extends Base {
    static get observedAttributes() {
      return [...(super.observedAttributes ?? []), 'hydrate:defer'];
    }

    /**
     * Constructor
     */
    constructor() {
      super();
    }

    connectedCallback() {
      if (!this.hasAttribute('hydrate:defer')) {
        super.connectedCallback?.();
      }
    }

    /**
     * @param { string } name
     * @param { string | null } oldValue
     * @param { string | null } value
     */
    attributeChangedCallback(name, oldValue, value) {
      if (name === 'hydrate:defer' && value === null) {
        super.connectedCallback?.();
      }
      super.attributeChangedCallback?.(name, oldValue, value);
    }
  };
}
