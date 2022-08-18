import { LitElement as LE } from './vendor/lit-element.js';
import { lazyHydrationMixin } from '@popeindustries/lit-html/lazy-hydration-mixin.js';

export * from './vendor/reactive-element.js';
export * from '@popeindustries/lit-html';

export class LitElement extends lazyHydrationMixin(LE) {}
