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
  strings: Array<Buffer | null>;
  parts: Array<Part | null>;
  digest: string;
  constructor(strings: TemplateStringsArray, processor: TemplateProcessor);
  protected _prepare(strings: TemplateStringsArray, processor: TemplateProcessor): void;
}

interface TemplateResultRenderer {
  push: (chunk: Buffer | null) => boolean;
  destroy: (err: Error) => void;
}

/**
 * A dynamic template part for text nodes
 */
class ChildPart {
  tagName: string;
  readonly type = 2;
  constructor(tagName: string);
  /**
   * Retrieve resolved string from passed `value`
   */
  resolveValue(value: unknown, options?: RenderOptions): unknown;
}
/**
 * A dynamic template part for attributes.
 * Unlike text nodes, attributes may contain multiple strings and parts.
 */
class AttributePart {
  strings: Array<Buffer>;
  length: number;
  tagName: string;
  readonly name: string;
  readonly type: 1 | 3 | 4 | 5 | 6;
  protected prefix: Buffer;
  protected suffix: Buffer;
  protected _value: unknown;
  constructor(name: string, strings: Array<Buffer>, tagName: string);
  /*
   * Retrieve resolved string from passed `value`
   */
  resolveValue(values: Array<unknown>, options?: RenderOptions): Buffer | Promise<Buffer>;
}
/**
 * A dynamic template part for property attributes.
 * Property attributes are prefixed with "."
 */
class PropertyPart extends AttributePart {
  readonly type = 3;
  /**
   * Retrieve resolved string Buffer from passed `values`.
   * Properties have no server-side representation unless `RenderOptions.serializePropertyAttributes`
   */
  resolveValue(values: Array<unknown>, options?: RenderOptions): Buffer | Promise<Buffer>;
}
/**
 * A dynamic template part for boolean attributes.
 * Boolean attributes are prefixed with "?"
 */
class BooleanAttributePart extends AttributePart {
  readonly type = 4;
  protected nameAsBuffer: Buffer;
}
/**
 * A dynamic template part for event attributes.
 * Event attributes are prefixed with "@"
 */
class EventPart extends AttributePart {
  readonly type = 5;
  /**
   * Retrieve resolved string Buffer from passed `values`.
   * Event bindings have no server-side representation, so always returns an empty string.
   */
  resolveValue(values: Array<unknown>, options?: RenderOptions): Buffer;
}
/**
 * A dynamic template part for accessing element instances.
 */
class ElementPart extends AttributePart {
  readonly type = 6;
  /**
   * Retrieve resolved string Buffer from passed `values`.
   * Element bindings have no server-side representation, so always returns an empty string.
   */
  resolveValue(values: Array<unknown>, options?: RenderOptions): Buffer;
}
declare type Part = ChildPart | AttributePart | PropertyPart | BooleanAttributePart | ElementPart | EventPart;
declare type ChildPart = typeof ChildPart;
declare type AttributePart = typeof AttributePart;
declare type PropertyPart = typeof PropertyPart;
declare type BooleanAttributePart = typeof BooleanAttributePart;
declare type EventPart = typeof EventPart;
declare type ElementPart = typeof ElementPart;

/**
 * Options supported by template render functions
 */
declare type RenderOptions = {
  /**
   * Include inline metadata for rehydration in the browser (default `false`)
   */
  includeRehydrationMetadata?: boolean;
  /**
   * JSON serialize property attributes (default `false`)
   */
  serializePropertyAttributes?: boolean;
};
