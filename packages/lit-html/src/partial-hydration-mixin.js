/**
 * @typedef { import('./partial-hydration-mixin.js').CustomElementBase } CustomElementBase
 */

/** @type { IntersectionObserver } */
let intersectionObserver;

/**
 * Custom element mixin for adding partial/deferred hydration support.
 * @param { CustomElementBase } Base
 */
export function partialHydrationMixin(Base) {
  return class PartialHydrationElement extends Base {
    static get observedAttributes() {
      return [...(super.observedAttributes ?? []), 'hydrate:defer'];
    }

    /**
     * Constructor
     */
    constructor() {
      super();
      /** @type { number | undefined } */
      this._idleCallbackID = undefined;
    }

    connectedCallback() {
      if (!this.hasAttribute('hydrate:defer')) {
        this.handleHydrationReady();
      }
    }

    /**
     * @param { string } name
     * @param { string | null } oldValue
     * @param { string | null } value
     */
    attributeChangedCallback(name, oldValue, value) {
      if (name === 'hydrate:defer' && value === null) {
        this.handleHydrationReady();
      }
      super.attributeChangedCallback?.(name, oldValue, value);
    }

    disconnectedCallback() {
      if (this._idleCallbackID !== undefined) {
        globalThis.cancelIdleCallback(this._idleCallbackID);
        this._idleCallbackID = undefined;
      }
      if (intersectionObserver !== undefined) {
        // No exception thrown if not currently observed
        intersectionObserver.unobserve(this);
      }
      super.disconnectedCallback?.();
    }

    handleHydrationReady() {
      if (this.hasAttribute('hydrate:idle') && 'requestIdleCallback' in globalThis) {
        this.removeAttribute('hydrate:idle');
        this._idleCallbackID = globalThis.requestIdleCallback(() => {
          this.triggerSuperConnectedCallback();
        });
      } else if (this.hasAttribute('hydrate:visible') && 'IntersectionObserver' in globalThis) {
        if (intersectionObserver === undefined) {
          intersectionObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                intersectionObserver.unobserve(entry.target);
                /** @type { PartialHydrationElement } */ (entry.target).triggerSuperConnectedCallback();
              }
            }
          });
        }
        this.removeAttribute('hydrate:visible');
        intersectionObserver.observe(this);
      } else {
        this.triggerSuperConnectedCallback();
      }
    }

    triggerSuperConnectedCallback() {
      super.connectedCallback?.();
    }
  };
}
