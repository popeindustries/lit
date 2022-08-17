import { LitElement as LE } from './vendor/lit-element.js';
import { partialHydrationMixin } from '@popeindustries/lit-html/partial-hydration-mixin.js';

export class LitElement extends partialHydrationMixin(LE) {}
