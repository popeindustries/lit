// @ts-nocheck
import { LitElement as LE, ReactiveElement } from 'lit-element/lit-element.js';
import { PartialHydrationMixin } from '@popeindustries/lit-html/partial-hydration-mixin.js';
import { render } from '@popeindustries/lit-html';

export class LitElement extends PartialHydrationMixin(LE) {
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
    // Skip calling LitElement#update by calling it's super directly
    ReactiveElement.prototype.update.call(this, changedProperties);
    this.__childPart = render(value, this.renderRoot, this.renderOptions);
  }
}
