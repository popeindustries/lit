/**
 * The return type of the template tag functions
 */
declare type TemplateResult = {
  template: Template;
  values: Array<unknown>;
  readChunk(options?: RenderOptions): unknown;
};

/**
 * A cacheable Template that stores the "strings" and "parts" associated with a
 * tagged template literal invoked with "html`...`".
 */
declare class Template {
  strings: Array<Buffer>;
  parts: Array<Part>;
  constructor(strings: TemplateStringsArray);
}

interface TemplateResultRenderer {
  push: (chunk: Buffer | null) => boolean;
  destroy: (err: Error) => void;
}

declare enum PartType {
  METADATA = 0,
  ATTRIBUTE = 1,
  CHILD = 2,
  PROPERTY = 3,
  BOOLEAN = 4,
  EVENT = 5,
  ELEMENT = 6,
}

interface MetadataPartType {
  readonly type: PartType;
  value: Buffer;
}

interface ChildPartType {
  readonly tagName: string;
  readonly type: PartType;
  resolveValue(value: unknown, options?: RenderOptions): unknown;
}
interface AttributePartType {
  readonly length: number;
  readonly name: string;
  readonly tagName: string;
  readonly type: PartType;
  resolveValue(value: unknown, options?: RenderOptions): Buffer | Promise<Buffer>;
}
interface PropertyPartType {
  readonly name: string;
  readonly tagName: string;
  readonly type: PartType;
  value: Buffer;
}
interface BooleanAttributePartType {
  readonly name: string;
  readonly tagName: string;
  readonly type: PartType;
  resolveValue(value: unknown, options?: RenderOptions): Buffer | Promise<Buffer>;
}
interface EventPartType {
  readonly name: string;
  readonly tagName: string;
  readonly type: PartType;
  value: Buffer;
}
interface ElementPartType {
  readonly tagName: string;
  readonly type: PartType;
  value: Buffer;
}
declare type Part =
  | MetadataPartType
  | ChildPartType
  | AttributePartType
  | PropertyPartType
  | BooleanAttributePartType
  | ElementPartType
  | EventPartType;

/**
 * Options supported by template render functions
 */
declare type RenderOptions = {
  /**
   * Include inline metadata for rehydration in the browser (default `false`)
   */
  includeRehydrationMetadata?: boolean;
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
