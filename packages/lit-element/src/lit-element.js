import { LitElement as LE } from './vendor/lit-element.js';
import { lazyHydrationMixin } from '@popeindustries/lit-html/lazy-hydration-mixin.js';
import { ReactiveElement } from './vendor/reactive-element.js';

export * from './vendor/reactive-element.js';
export * from '@popeindustries/lit-html';

export class LitElement extends lazyHydrationMixin(LE) {
  /**
   * `LitElement.createRenderRoot()` automatically sets `options.renderBefore` to support polyfills,
   * so skip to avoid errors during hydration.
   */
  createRenderRoot() {
    // @ts-expect-error - protected
    return ReactiveElement.prototype.createRenderRoot.call(this);
  }
}
