/**
 * Custom element mixin for adding partial/deferred hydration support.
 */
export function PartialHydrationMixin<BaseClass extends CustomElementBase>(
  Base: BaseClass,
): BaseClass & {
  prototype: PartialHydration;
  new (): PartialHydration;
};

export class PartialHydration extends CustomElement {}

export interface CustomElementBase {
  readonly observedAttributes: Array<string>;
  prototype: CustomElement;
  new (): CustomElement;
}

export class CustomElement extends HTMLElement {
  readonly isConnected: boolean;
  attributeChangedCallback?(attrName: string, oldValue: unknown, newValue: unknown): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
}
