import './dom-shim.js';
import { isArray, isAsyncIterator, isBuffer, isObject, isPrimitive, isPromise, isSyncIterator } from './is.js';
import { isDirective, isTemplateResult } from './is.js';
import { noChange, nothing } from 'lit-html';
import { Buffer } from 'buffer';
import { escape } from './escape.js';
import { PartType } from 'lit-html/directive.js';

const EMPTY_STRING_BUFFER = Buffer.from('');

/**
 * A prefix value for strings that should not be escaped
 */
const unsafePrefixString = '__unsafe-lit-html-server-string__';

/**
 * A dynamic template part for text nodes
 */
export class ChildPart {
  /**
   * Constructor
   *
   * @param { string } tagName
   */
  constructor(tagName) {
    this.tagName = tagName;
    this.type = PartType.CHILD;
  }

  /**
   * Retrieve resolved value given passed "value"
   *
   * @param { any } value
   * @param { RenderOptions } [options]
   * @returns { any }
   */
  resolveValue(value, options) {
    return resolveNodeValue(value, this);
  }
}

/**
 * A dynamic template part for attributes.
 * Unlike text nodes, attributes may contain multiple strings and parts.
 */
export class AttributePart {
  /**
   * Constructor
   *
   * @param { string } name
   * @param { Array<Buffer> } strings
   * @param { string } tagName
   * @param { PartType } [type]
   */
  constructor(name, strings, tagName, type = PartType.ATTRIBUTE) {
    this.name = name;
    this.strings = strings;
    this.tagName = tagName;
    this.type = type;
    this.length = strings.length - 1;
    this.prefix = Buffer.from(`${this.name}="`);
    this.suffix = Buffer.from(`${this.strings[this.length]}"`);
  }

  /**
   * Retrieve resolved string Buffer from passed "values".
   * Resolves to a single string, or Promise for a single string,
   * even when responsible for multiple values.
   *
   * @param { Array<unknown> } values
   * @param { RenderOptions } [options]
   * @returns { Buffer | Promise<Buffer> }
   */
  resolveValue(values, options) {
    let chunks = [this.prefix];
    let chunkLength = this.prefix.length;
    let pendingChunks;

    for (let i = 0; i < this.length; i++) {
      const string = this.strings[i];
      let value = resolveAttributeValue(
        values[i],
        this,
        options !== undefined ? options.serializePropertyAttributes : false,
      );

      // Bail if 'nothing'
      if (value === nothing) {
        return EMPTY_STRING_BUFFER;
      }

      chunks.push(string);
      chunkLength += string.length;

      if (isBuffer(value)) {
        chunks.push(value);
        chunkLength += value.length;
      } else if (isPromise(value)) {
        // Lazy init for uncommon scenario
        if (pendingChunks === undefined) {
          pendingChunks = [];
        }

        // @ts-ignore
        const index = chunks.push(value) - 1;

        pendingChunks.push(
          value.then((value) => {
            // @ts-ignore
            chunks[index] = value;
            // @ts-ignore
            chunkLength += value.length;
          }),
        );
      } else if (isArray(value)) {
        for (const chunk of value) {
          const buffer = /** @type { Buffer } */ (chunk);
          chunks.push(buffer);
          chunkLength += buffer.length;
        }
      }
    }

    chunks.push(this.suffix);
    chunkLength += this.suffix.length;
    if (pendingChunks !== undefined) {
      return Promise.all(pendingChunks).then(() => Buffer.concat(chunks, chunkLength));
    }
    return Buffer.concat(chunks, chunkLength);
  }
}

/**
 * A dynamic template part for boolean attributes.
 * Boolean attributes are prefixed with "?"
 */
export class BooleanAttributePart extends AttributePart {
  /**
   * Constructor
   *
   * @param { string } name
   * @param { Array<Buffer> } strings
   * @param { string } tagName
   * @throws error when multiple expressions
   */
  constructor(name, strings, tagName) {
    super(name, strings, tagName, PartType.BOOLEAN_ATTRIBUTE);

    this.nameAsBuffer = Buffer.from(this.name);

    if (strings.length !== 2 || strings[0] === EMPTY_STRING_BUFFER || strings[1] === EMPTY_STRING_BUFFER) {
      throw Error('Boolean attributes can only contain a single expression');
    }
  }

  /**
   * Retrieve resolved string Buffer from passed "values".
   *
   * @param { Array<unknown> } values
   * @param { RenderOptions } [options]
   * @returns { Buffer | Promise<Buffer> }
   */
  resolveValue(values, options) {
    let value = values[0];

    if (isDirective(value)) {
      value = resolveDirectiveValue(value, this);
    }

    if (isPromise(value)) {
      return value.then((value) => (value ? this.nameAsBuffer : EMPTY_STRING_BUFFER));
    }

    return value ? this.nameAsBuffer : EMPTY_STRING_BUFFER;
  }
}

/**
 * A dynamic template part for property attributes.
 * Property attributes are prefixed with "."
 */
export class PropertyPart extends AttributePart {
  /**
   * Constructor
   *
   * @param { string } name
   * @param { Array<Buffer> } strings
   * @param { string } tagName
   */
  constructor(name, strings, tagName) {
    super(name, strings, tagName, PartType.PROPERTY);
  }

  /**
   * Retrieve resolved string Buffer from passed "values".
   * Returns an empty string unless "options.serializePropertyAttributes=true"
   *
   * @param { Array<unknown> } values
   * @param { RenderOptions } [options]
   * @returns { Buffer | Promise<Buffer> }
   */
  resolveValue(values, options) {
    if (options !== undefined && options.serializePropertyAttributes) {
      const value = super.resolveValue(values, options);
      const prefix = Buffer.from('.');

      return value instanceof Promise
        ? value.then((value) => Buffer.concat([prefix, value]))
        : Buffer.concat([prefix, value]);
    }

    return EMPTY_STRING_BUFFER;
  }
}

/**
 * A dynamic template part for event attributes.
 * Event attributes are prefixed with "@"
 */
export class EventPart extends AttributePart {
  /**
   * Constructor
   *
   * @param { string } name
   * @param { Array<Buffer> } strings
   * @param { string } tagName
   */
  constructor(name, strings, tagName) {
    super(name, strings, tagName, PartType.EVENT);
  }

  /**
   * Retrieve resolved string Buffer from passed "values".
   * Event bindings have no server-side representation,
   * so always returns an empty string.
   *
   * @param { Array<unknown> } values
   * @param { RenderOptions } [options]
   * @returns { Buffer }
   */
  resolveValue(values, options) {
    return EMPTY_STRING_BUFFER;
  }
}

/**
 * A dynamic template part for accessing element instances.
 */
export class ElementPart extends AttributePart {
  /**
   * Constructor
   *
   * @param { string } name
   * @param { Array<Buffer> } strings
   * @param { string } tagName
   */
  constructor(name, strings, tagName) {
    super(name, strings, tagName, PartType.ELEMENT);
  }

  /**
   * Retrieve resolved string Buffer from passed "values".
   * Event bindings have no server-side representation,
   * so always returns an empty string.
   *
   * @param { Array<unknown> } values
   * @param { RenderOptions } [options]
   * @returns { Buffer }
   */
  resolveValue(values, options) {
    return EMPTY_STRING_BUFFER;
  }
}

/**
 * Resolve "value" to string if possible
 *
 * @param { unknown } value
 * @param { AttributePart } part
 * @param { boolean } [serialiseObjectsAndArrays]
 * @returns { any }
 */
function resolveAttributeValue(value, part, serialiseObjectsAndArrays = false) {
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
  } else if (serialiseObjectsAndArrays && (isObject(value) || isArray(value))) {
    return Buffer.from(escape(JSON.stringify(value), 'attribute'));
  } else if (isPromise(value)) {
    return value.then((value) => resolveAttributeValue(value, part, serialiseObjectsAndArrays));
  } else if (isSyncIterator(value)) {
    if (!isArray(value)) {
      value = Array.from(value);
    }
    return Buffer.concat(
      // @ts-ignore: already converted to Array
      value.reduce((values, value) => {
        value = resolveAttributeValue(value, part, serialiseObjectsAndArrays);
        // Flatten
        if (isArray(value)) {
          return values.concat(value);
        }
        values.push(value);
        return values;
      }, []),
    );
  } else {
    return Buffer.from(String(value));
  }
}

/**
 * Resolve "value" to string Buffer if possible
 *
 * @param { unknown } value
 * @param { ChildPart } part
 * @returns { any }
 */
function resolveNodeValue(value, part) {
  if (isDirective(value)) {
    value = resolveDirectiveValue(value, part);
  }

  if (value === nothing || value === undefined) {
    return EMPTY_STRING_BUFFER;
  }

  if (isPrimitive(value)) {
    const string = typeof value !== 'string' ? String(value) : value;
    // Escape if not prefixed with unsafePrefixString, otherwise strip prefix
    return Buffer.from(
      string.indexOf(unsafePrefixString) === 0
        ? string.slice(33)
        : escape(string, part.tagName === 'script' || part.tagName === 'style' ? part.tagName : 'text'),
    );
  } else if (isTemplateResult(value) || isBuffer(value)) {
    return value;
  } else if (isPromise(value)) {
    return value.then((value) => resolveNodeValue(value, part));
  } else if (isSyncIterator(value)) {
    if (!isArray(value)) {
      value = Array.from(value);
    }
    // @ts-ignore: already converted to Array
    return value.reduce((values, value) => {
      value = resolveNodeValue(value, part);
      // Flatten
      if (isArray(value)) {
        return values.concat(value);
      }
      values.push(value);
      return values;
    }, []);
  } else if (isAsyncIterator(value)) {
    return resolveAsyncIteratorValue(value, part);
  } else {
    throw Error(`unknown NodePart value: ${value}`);
  }
}

/**
 * Resolve values of async "iterator"
 *
 * @param { AsyncIterable<unknown> } iterator
 * @param { ChildPart } part
 * @returns { AsyncGenerator }
 */
async function* resolveAsyncIteratorValue(iterator, part) {
  for await (const value of iterator) {
    yield resolveNodeValue(value, part);
  }
}

/**
 * Resolve value of "directive"
 *
 * @param { import('lit-html/directive').DirectiveResult } directiveResult
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
