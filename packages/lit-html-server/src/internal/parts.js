import { EMPTY_STRING_BUFFER, META_CLOSE, META_OPEN } from './consts.js';
import { isArray, isAsyncIterator, isBuffer, isObject, isPrimitive, isPromise, isSyncIterator } from './is.js';
import { isDirective, isTemplateResult } from './is.js';
import { noChange, nothing } from 'lit-html';
import { Buffer } from '#buffer';
import { escape } from './escape.js';

export const partType = {
  METADATA: 0,
  ATTRIBUTE: 1,
  CHILD: 2,
  PROPERTY: 3,
  BOOLEAN: 4,
  EVENT: 5,
  ELEMENT: 6,
};

/**
 * A prefix value for strings that should not be escaped
 */
const unsafePrefixString = '__unsafe-lit-html-server-string__';

/**
 * A template part for hydration metadata
 * @implements MetadataPartType
 */
export class MetadataPart {
  /**
   * Constructor
   * @param { Buffer } value
   */
  constructor(value) {
    this.type = partType.METADATA;
    this.value = value;
  }
}

/**
 * A dynamic template part for text nodes
 * @implements ChildPartType
 */
export class ChildPart {
  /**
   * Constructor
   * @param { string } tagName
   */
  constructor(tagName) {
    this.tagName = tagName;
    this.type = partType.CHILD;
  }

  /**
   * Retrieve resolved value given passed "value"
   * @param { unknown } value
   * @param { boolean } [withMetadata]
   * @returns { unknown }
   */
  resolveValue(value, withMetadata = false) {
    return resolveNodeValue(value, this, withMetadata);
  }
}

/**
 * A dynamic template part for attributes.
 * Unlike text nodes, attributes may contain multiple strings and parts.
 * @implements AttributePartType
 */
export class AttributePart {
  /**
   * Constructor
   * @param { string } name
   * @param { Array<Buffer> } strings
   * @param { string } tagName
   * @param { PartType } [type]
   */
  constructor(name, strings, tagName, type = partType.ATTRIBUTE) {
    this.length = strings.length - 1;
    this.name = name;
    this.prefix = Buffer.from(`${this.name}="`);
    this.strings = strings;
    this.suffix = Buffer.from(`${this.strings[this.length]}"`);
    this.tagName = tagName;
    this.type = type;
  }

  /**
   * Retrieve resolved string Buffer from passed "values".
   * Resolves to a single string, or Promise for a single string,
   * even when responsible for multiple values.
   * @param { Array<unknown> } values
   * @param { RenderOptions } [options]
   * @returns { Buffer }
   */
  resolveValue(values, options) {
    let chunks = [this.prefix];
    let chunkLength = this.prefix.length;
    let pendingChunks;

    for (let i = 0; i < this.length; i++) {
      const string = this.strings[i];
      let value = resolveAttributeValue(values[i], this);

      // Bail if 'nothing'
      if (value === nothing) {
        return EMPTY_STRING_BUFFER;
      }

      chunks.push(string);
      chunkLength += string.length;

      if (isBuffer(value)) {
        chunks.push(value);
        chunkLength += value.length;
      }
    }

    chunks.push(this.suffix);
    chunkLength += this.suffix.length;

    return Buffer.concat(chunks, chunkLength);
  }
}

/**
 * A dynamic template part for property attributes.
 * Property attributes are prefixed with "." and have no server-side representation.
 * @implements PropertyPartType
 */
export class PropertyPart {
  /**
   * Constructor
   * @param { string } name
   * @param { Array<Buffer> } strings
   * @param { string } tagName
   */
  constructor(name, strings, tagName) {
    this.length = strings.length - 1;
    this.name = name;
    this.tagName = tagName;
    this.type = partType.PROPERTY;
    this.value = EMPTY_STRING_BUFFER;
  }
}

/**
 * A dynamic template part for boolean attributes.
 * Boolean attributes are prefixed with "?"
 * @implements BooleanAttributePartType
 */
export class BooleanAttributePart {
  /**
   * Constructor
   * @param { string } name
   * @param { string } tagName
   */
  constructor(name, tagName) {
    this.name = name;
    this.tagName = tagName;
    this.type = partType.BOOLEAN;

    this.nameAsBuffer = Buffer.from(this.name);
  }

  /**
   * Retrieve resolved string Buffer from passed "value".
   * @param { unknown } value
   * @param { RenderOptions } [options]
   * @returns { Buffer }
   */
  resolveValue(value, options) {
    if (isDirective(value)) {
      value = resolveDirectiveValue(value, this);
    }

    return value ? this.nameAsBuffer : EMPTY_STRING_BUFFER;
  }
}

/**
 * A dynamic template part for event attributes.
 * Event attributes are prefixed with "@" and have no server-side representation.
 * @implements EventPartType
 */
export class EventPart {
  /**
   * Constructor
   * @param { string } name
   * @param { string } tagName
   */
  constructor(name, tagName) {
    this.name = name;
    this.tagName = tagName;
    this.type = partType.EVENT;
    this.value = EMPTY_STRING_BUFFER;
  }
}

/**
 * A dynamic template part for element bindings.
 * Element parts have no server-side representation.
 * @implements ElementPartType
 */
export class ElementPart {
  /**
   * Constructor
   * @param { string } tagName
   */
  constructor(tagName) {
    this.tagName = tagName;
    this.type = partType.ELEMENT;
    this.value = EMPTY_STRING_BUFFER;
  }
}

/**
 * Resolve "value" to string if possible
 * @param { unknown } value
 * @param { AttributePart } part
 * @returns { unknown }
 */
function resolveAttributeValue(value, part) {
  if (isDirective(value)) {
    value = resolveDirectiveValue(value, part);
  }

  if (value === nothing) {
    return value;
  }

  if (isPrimitive(value)) {
    const string = typeof value !== 'string' ? String(value) : value;
    // Escape if not prefixed with unsafePrefixString, otherwise strip prefix
    return Buffer.from(string.indexOf(unsafePrefixString) === 0 ? string.slice(33) : escape(string, 'attribute'));
  } else if (isBuffer(value)) {
    return value;
  } else {
    return Buffer.from(String(value));
  }
}

/**
 * Resolve "value" to string Buffer if possible
 * @param { unknown } value
 * @param { ChildPart } part
 * @param { boolean } withMetadata
 * @returns { unknown }
 */
function resolveNodeValue(value, part, withMetadata) {
  if (isDirective(value)) {
    value = resolveDirectiveValue(value, part);
  }

  if (value === nothing || value == null) {
    value = EMPTY_STRING_BUFFER;
  }

  if (isPrimitive(value)) {
    const string = typeof value !== 'string' ? String(value) : value;
    // Escape if not prefixed with unsafePrefixString, otherwise strip prefix
    value = Buffer.from(
      string.indexOf(unsafePrefixString) === 0
        ? string.slice(33)
        : escape(string, part.tagName === 'script' || part.tagName === 'style' ? part.tagName : 'text'),
    );
  }

  if (isBuffer(value)) {
    return withMetadata ? [META_OPEN, value, META_CLOSE] : value;
  } else if (isTemplateResult(value)) {
    return value;
  } else if (isPromise(value)) {
    return value.then((value) => resolveNodeValue(value, part, withMetadata));
  } else if (isSyncIterator(value)) {
    if (!isArray(value)) {
      value = Array.from(value);
    }
    /** @type { Array<unknown> } */
    const collection = withMetadata ? [META_OPEN] : [];
    for (let val of /** @type { Array<unknown> } */ (value)) {
      val = resolveNodeValue(val, part, withMetadata);
      // Flatten
      if (isArray(val)) {
        collection.push(...val);
      } else {
        collection.push(val);
      }
    }
    if (withMetadata) {
      collection.push(META_CLOSE);
    }
    return collection;
  } else if (isAsyncIterator(value)) {
    return resolveAsyncIteratorValue(value, part, withMetadata);
  } else {
    throw Error(`unknown NodePart value: ${value}`);
  }
}

/**
 * Resolve values of async "iterator"
 * @param { AsyncIterable<unknown> } iterator
 * @param { ChildPart } part
 * @param { boolean } withMetadata
 * @returns { AsyncGenerator<unknown> }
 */
async function* resolveAsyncIteratorValue(iterator, part, withMetadata) {
  for await (const value of iterator) {
    yield resolveNodeValue(value, part, withMetadata);
  }
}

/**
 * Resolve value of "directive"
 * @param { import('lit-html/directive.js').DirectiveResult } directiveResult
 * @param { { name?: string, tagName: string, type: PartType, strings?: Array<Buffer>, length?: number } } part
 * @returns { unknown }
 */
function resolveDirectiveValue(directiveResult, part) {
  const partInfo = {
    name: part.name,
    tagName: part.tagName,
    type: part.type,
  };
  if (part.strings !== undefined && part.length !== undefined && part.length > 1) {
    // @ts-ignore
    partInfo.strings = part.strings.map((string) => string.toString());
  }
  // @ts-ignore
  const directive = new directiveResult._$litDirective$(partInfo);
  // @ts-ignore
  const result = directive.render(...directiveResult.values);

  if (result === noChange) {
    return EMPTY_STRING_BUFFER;
    // Handle fake TemplateResult from unsafeHTML/unsafeSVG
  } else if (isObject(result) && 'strings' in result) {
    // @ts-ignore
    return unsafePrefixString + result.strings[0];
  } else {
    return result;
  }
}
