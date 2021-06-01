/**
 * The return type of the template tag functions
 */
declare type TemplateResult = {
  template: Template;
  values: Array<unknown>;
};

/**
 * A cacheable Template that stores the "strings" and "parts" associated with a
 * tagged template literal invoked with "html`...`".
 */
declare class Template {
  strings: Array<Buffer | null>;
  parts: Array<Part | null>;
  constructor(strings: TemplateStringsArray, processor: TemplateProcessor);
  protected _prepare(strings: TemplateStringsArray, processor: TemplateProcessor): void;
}

/**
 * A dynamic template part for text nodes
 */
class ChildPart {
  tagName: string;
  readonly type = 2;
  protected _value: unknown;
  constructor(tagName: string);
  /**
   * Retrieve resolved string from passed `value`
   */
  getValue(value: unknown, options?: RenderOptions): unknown;
  /**
   * Store the current value.
   * Used by directives to temporarily transfer value
   * (value will be deleted after reading).
   */
  setValue(value: unknown): void;
  /**
   * No-op
   */
  commit(): void;
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
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer | Promise<Buffer>;
  /**
   * Store the current value.
   * Used by directives to temporarily transfer value (value will be deleted after reading).
   */
  setValue(value: unknown): void;
  /**
   * No-op
   */
  commit(): void;
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
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer | Promise<Buffer>;
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
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer;
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
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer;
}
declare type Part = ChildPart | AttributePart | PropertyPart | BooleanAttributePart | ElementPart | EventPart;
/* export type { ChildPart, AttributePart, PropertyPart, BooleanAttributePart, EventPart, ElementPart }; */

/**
 * Interprets a template literal as an HTML template that can be
 * rendered as a Readable stream, string, or Buffer
 */
declare const html: (strings: TemplateStringsArray, ...values: Array<unknown>) => TemplateResult<HTML_RESULT>;
/**
 * Interprets a template literal as a SVG template that can be
 * rendered as a Readable stream, string, or Buffer
 */
declare const svg: (strings: TemplateStringsArray, ...values: Array<unknown>) => TemplateResult<SVG_RESULT>;

/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written
 */
declare const noChange: unique symbol;
/**
 * A sentinel value that signals a ChildPart to fully clear its content
 */
declare const nothing: unique symbol;

/**
 * Options supported by template render functions
 */
declare type RenderOptions = {
  /** JSON serialize property attributes (default `false`) */
  serializePropertyAttributes: boolean;
};

/**
 * Renders a value, usually a TemplateResult, to a string resolving Promise
 */
declare function renderToString(value: unknown, options?: RenderOptions): Promise<string>;
/**
 * Renders a value, usually a lit-html TemplateResult, to a Readable stream
 */
declare function renderToStream(value: unknown, options?: RenderOptions): import('stream').Readable;
/**
 * Renders a value, usually a lit-html TemplateResult, to a Buffer resolving Promise
 */
declare function renderToBuffer(value: unknown, options?: RenderOptions): Promise<Buffer>;
