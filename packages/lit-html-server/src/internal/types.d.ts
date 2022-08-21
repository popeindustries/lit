declare type TemplateResult = import('lit-html').TemplateResult;
declare type ElementRenderer = import('./element-renderer.js').ElementRenderer;

/**
 * The return type of the template tag functions
 */
declare type TemplateInstance = {
  _$litServerTemplateInstance$: boolean;
  hydratable: boolean;
  id: number;
  index: number;
  maxIndex: number;
  prefix: Buffer;
  suffix: Buffer;
  template: Template;
  valueIndex: number;
  values: Array<unknown>;
  setAsRoot(type?: 'light' | 'shadow', styles?: string): void;
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

type AttributeDataType = 'boolean' | 'attribute' | 'property' | 'event' | 'element';
type BooleanAttributeData = {
  type: 'boolean';
  length: number;
  name: string;
  nameBuffer: Buffer;
  value?: string;
  resolvedBuffer?: Buffer;
};
type AttributeOrPropertyAttributeData = {
  type: 'attribute' | 'property';
  length: number;
  name: string;
  strings?: Array<string>;
  value?: string;
  resolvedBuffer?: Buffer;
};
type DefaultAttributeData = {
  type: 'event' | 'element';
  length: number;
  name: string;
  value: string;
  resolvedBuffer: Buffer;
};
type AttributeData = BooleanAttributeData | AttributeOrPropertyAttributeData | DefaultAttributeData;
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
  CUSTOMELEMENT_OPEN = 3,
  CUSTOMELEMENT_CLOSE = 4,
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
interface CustomElementOpenPartType {
  readonly length: number;
  readonly tagName: string;
  readonly type: PartType.CUSTOMELEMENT_OPEN;
  resolveValue(values: Array<unknown>, options: InternalRenderOptions): unknown;
}
interface CustomElementClosePartType {
  readonly tagName: string;
  readonly type: PartType.CUSTOMELEMENT_CLOSE;
  resolveValue(options: InternalRenderOptions): unknown;
}
interface MetadataPartType {
  readonly tagName: string;
  readonly type: PartType.METADATA;
  readonly value: Buffer;
  resolveValue(options: InternalRenderOptions): unknown;
}
declare type Part = MetadataPartType | CustomElementOpenPartType | ChildPartType | AttributePartType;

type ElementRendererConstructor = {
  new (tagName: string): ElementRenderer;
  matchesClass(ceClass: typeof HTMLElement, tagName: string): boolean;
};

/**
 * Options supported by template render functions
 */
declare type RenderOptions = {
  /**
   * `ElementRenderer` subclasses for rendering of custom elements
   */
  elementRenderers?: Array<ElementRendererConstructor>;
};

type InternalRenderOptions = RenderOptions & {
  /** The stack of nested custom elements in the tree to determine root elements */
  customElementStack: Array<string>;
  /** The flag to enable/disable metadata. Set when TemplateInstance.hydratable === true */
  includeHydrationMetadata?: boolean;
  /** The TemplateInstance.id corresponding to hydratable root, used to disable metadata when complete */
  hydrationMetadataRootId?: number;
};

type RegexTagGroups = {
  commentStart: string | undefined;
  tagName: string | undefined;
  dynamicTagName: string | undefined;
};

type RegexAttrGroups = {
  attributeName: string | undefined;
  spacesAndEquals: string | undefined;
  quoteChar: string | undefined;
};

type RegexAttrValueGroups = {
  attributeValue: string | undefined;
  closingChar: string | undefined;
};
