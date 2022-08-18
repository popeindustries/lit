/**
 * Custom element mixin for adding lazy (partial/deferred) hydration support.
 *
 * Defers calls to `BaseClass.connectedCallback()` until the `hydrate:defer`
 * attribute is removed (automatically added during server render).
 *
 * Optionally adds support for deferring until idle with `hydrate:idle`,
 * and until viewport visibility with `hydrate:visible`.
 */
export function lazyHydrationMixin<BaseClass extends CustomElementBase>(
  Base: BaseClass,
): BaseClass & {
  prototype: LazyHydrationElement;
  new (...args: Array<any>): LazyHydrationElement;
};

export class LazyHydrationElement extends CustomElement {
  /**
   * Called when `hydrate:defer` attribute is removed.
   *
   * If the element has `hydrate:idle` attribute set,
   * schedules a call to `triggerConnectedCallback()` when idle
   * (using `requestIdleCallback`, if available).
   *
   * If the element has `hydrate:visible` attribute set,
   * registers a call to `triggerConnectedCallback()` when visible in the viewport
   * (using `IntersectionObserver`, if available).
   */
  protected handleHydrationReady(): void;
  /**
   * Executes `connectedCallback()` on the `BaseClass`.
   *
   * It is expected that the `BaseClass` will then eventually trigger hydration
   * of the element's server rendered content by calling `render(value, this)`.
   */
  protected triggerSuperConnectedCallback(): void;
}

export interface CustomElementBase {
  readonly observedAttributes: Array<string>;
  prototype: CustomElement;
  new (...args: Array<any>): CustomElement;
}

export class CustomElement extends HTMLElement {
  readonly isConnected: boolean;
  attributeChangedCallback?(attrName: string, oldValue: unknown, newValue: unknown): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
}
