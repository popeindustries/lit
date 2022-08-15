import { LitElement as LE, ReactiveElement } from 'lit-element/lit-element.js';
import { partialHydrationMixin } from '@popeindustries/lit-html/partial-hydration-mixin.js';
import { render } from '@popeindustries/lit-html';

// @ts-expect-error - need access to pseudo private `__childPart`
export class LitElement extends partialHydrationMixin(LE) {
  /**
   * Updates the element.
   * Overridden to use `@popeindustries/lit-html#render()` for hydration support.
   * @param { import('lit-element').PropertyValues} changedProperties
   */
  update(changedProperties) {
    const value = this.render();
    if (!this.hasUpdated) {
      this.renderOptions.isConnected = this.isConnected;
    }
    // @ts-expect-error - protected
    // Skip calling LitElement#update by calling it's super directly
    ReactiveElement.prototype.update.call(this, changedProperties);
    this.__childPart = render(value, this.renderRoot, this.renderOptions);
  }
}
