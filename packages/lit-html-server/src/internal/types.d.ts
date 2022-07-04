/**
 * The return type of the template tag functions
 */
declare type TemplateResult = {
  id: number;
  rehydratable: boolean;
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
  resolveValue(value: unknown, withMetadata: boolean): unknown;
}
interface AttributePartType {
  readonly length: number;
  readonly name: string;
  readonly tagName: string;
  readonly type: PartType;
  resolveValue(value: unknown): Buffer;
}
interface PropertyPartType {
  readonly length: number;
  readonly name: string;
  readonly tagName: string;
  readonly type: PartType;
  value: Buffer;
}
interface BooleanAttributePartType {
  readonly name: string;
  readonly tagName: string;
  readonly type: PartType;
  resolveValue(value: unknown): Buffer;
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
declare type RenderOptions = {};

declare type InternalRenderOptions = RenderOptions & {
  includeRehydrationMetadata?: boolean;
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
