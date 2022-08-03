/**
 * The return type of the template tag functions
 */
declare type TemplateResult = {
  id: number;
  hydratable: boolean;
  root: boolean;
  template: Template;
  values: Array<unknown>;
  readChunk(options?: InternalRenderOptions): unknown;
};

/**
 * A cacheable Template that stores the "strings" and "parts" associated with a
 * tagged template literal invoked with "html`...`".
 */
declare class Template {
  digest: string;
  strings: Array<Buffer>;
  parts: Array<Part>;
  constructor(strings: TemplateStringsArray);
}

interface TemplateResultRenderer {
  push: (chunk: Buffer | null) => boolean;
  destroy: (err: Error) => void;
}

declare type AttributeDataType = 'boolean' | 'attribute' | 'property' | 'event' | 'element';
declare type BooleanAttributeData = {
  type: 'boolean';
  length: number;
  name: string;
  nameBuffer: Buffer;
  value?: string;
  resolvedBuffer?: Buffer;
};
declare type AttributeOrPropertyAttributeData = {
  type: 'attribute' | 'property';
  length: number;
  name: string;
  strings?: Array<string>;
  value?: string;
  resolvedBuffer?: Buffer;
};
declare type DefaultAttributeData = {
  type: 'event' | 'element';
  length: number;
  name: string;
  value: string;
  resolvedBuffer: Buffer;
};
declare type AttributeData = BooleanAttributeData | AttributeOrPropertyAttributeData | DefaultAttributeData;
declare interface PartInfo {
  type: number;
  tagName: string;
  name?: string;
  strings?: Array<string>;
}

declare enum PartType {
  METADATA = 0,
  ATTRIBUTE = 1,
  CHILD = 2,
  CUSTOMELEMENT = 3,
}
interface AttributePartType {
  readonly length: number;
  readonly tagName: string;
  readonly type: PartType.ATTRIBUTE;
  resolveValue(values: Array<unknown>, options: InternalRenderOptions): unknown;
}
interface ChildPartType {
  readonly tagName: string;
  readonly type: PartType.CHILD;
  resolveValue(value: unknown, options: InternalRenderOptions): unknown;
}
interface CustomElementPartType {
  readonly length: number;
  readonly nodeIndex: number;
  readonly tagName: string;
  readonly type: PartType.CUSTOMELEMENT;
  resolveValue(values: Array<unknown>, options: InternalRenderOptions): unknown;
}
interface MetadataPartType {
  readonly tagName: string;
  readonly type: PartType.METADATA;
  readonly value: Buffer;
  resolveValue(options: InternalRenderOptions): unknown;
}
declare type Part = MetadataPartType | CustomElementPartType | ChildPartType | AttributePartType;

declare type ElementRendererConstructor = (new (tagName: string) => ElementRenderer) & typeof ElementRenderer;

/**
 * Base class renderer for rendering custom elements.
 * Extend to handle custom render logic if your custom elements do not render to `innerHTML`
 */
declare class ElementRenderer {
  /**
   * Should return true when given custom element class and/or tag name
   * should be handled by this renderer.
   */
  static matchesClass(ceClass: typeof HTMLElement, tagName: string): boolean;
  element: HTMLElement;
  tagName: string;
  constructor(tagName: string);
  connectedCallback(): void;
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
  setProperty(name: string, value: unknown): void;
  setAttribute(name: string, value: string): void;
  renderAttributes(): string;
  render(): unknown;
}

/**
 * Options supported by template render functions
 */
declare type RenderOptions = {
  /**
   * Renderer classes for rendering of custom elements
   */
  elementRenderers?: Array<ElementRendererConstructor>;
};

declare type InternalRenderOptions = RenderOptions & {
  includeHydrationMetadata?: boolean;
  hydrationRoot?: number;
};

declare type RegexTagGroups = {
  commentStart: string | undefined;
  tagName: string | undefined;
  dynamicTagName: string | undefined;
};

declare type RegexAttrGroups = {
  attributeName: string | undefined;
  spacesAndEquals: string | undefined;
  quoteChar: string | undefined;
};

declare type RegexAttrValueGroups = {
  attributeValue: string | undefined;
  closingChar: string | undefined;
};
