/**
 * Base class renderer for rendering custom elements.
 * Extend to handle custom render logic if your
 * custom elements do not render to `innerHTML` or `shadowRoot.innerHTML`,
 * or implement a `render()` function that returns a string or lit-html `TemplateResult`.
 */
export class ElementRenderer {
  /**
   * Should return true when given custom element class and/or tag name
   * should be handled by this renderer.
   */
  static matchesClass(ceClass: typeof HTMLElement, tagName: string): boolean;
  /**
   * The custom element instance
   */
  element: HTMLElement;
  /**
   * The custom element tag name
   */
  tagName: string;
  /**
   * The element's observed attributes
   */
  readonly observedAttributes: Array<string>;
  constructor(tagName: string);
  /**
   * Function called when element is to be rendered
   */
  connectedCallback(): void;
  /**
   * Function called when observed element attribute value has changed
   */
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
  /**
   * Update element property value
   */
  setProperty(name: string, value: unknown): void;
  /**
   * Update element attribute value
   */
  setAttribute(name: string, value: string): void;
  /**
   * Render element attributes as string
   */
  renderAttributes(): string;
  /**
   * Render element styles as string for applying to shadow DOM
   */
  renderStyles(): string;
  /**
   * Render element content
   */
  render(): TemplateResult | string | null | undefined;
}
