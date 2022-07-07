import { EMPTY_STRING_BUFFER, META_CLOSE, META_OPEN } from './consts.js';
import { isArray, isAsyncIterator, isBuffer, isObject, isPrimitive, isPromise, isSyncIterator } from './is.js';
import { isDirective, isTemplateResult } from './is.js';
import { noChange, nothing } from 'lit-html';
import { Buffer } from '#buffer';
import { digestForTemplateStrings } from '#digest';
import { escape } from './escape.js';
import { TemplateResult } from './template-result.js';

export const partType = {
  METADATA: 0,
  ATTRIBUTE: 1,
  CHILD: 2,
  CUSTOMELEMENT: 3,
};

const QUOTE_BUFFER = Buffer.from('"');
const RE_RAW_TEXT_ELEMENT = /^(?:script|style|textarea|title)$/i;
const SPACE_BUFFER = Buffer.from(' ');
const TYPE_TO_LIT_PART_TYPE = {
  attribute: 1,
  child: 2,
  property: 3,
  boolean: 4,
  event: 5,
  element: 6,
};

/**
 * Retrieve `attributeType` from attribute `name`
 * @param { string } name
 */
export function getAttributeTypeFromName(name) {
  if (name === '') {
    return 'element';
  }

  const prefix = name[0];

  switch (name[0]) {
    case '?':
      return 'boolean';
    case '.':
      return 'property';
    case '@':
      return 'event';
    default:
      return 'attribute';
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
   * @param { string } tagName
   */
  constructor(tagName) {
    this.length = 0;
    this.tagName = tagName;
    this.type = partType.ATTRIBUTE;
    /** @type { Array<AttributeData> } */
    this._attributes = [];
  }

  /**
   * Add data for specific attribute
   * @param { AttributeDataType } type
   * @param { string } [name]
   * @param { string } [value]
   * @param { Array<Buffer> } [strings]
   */
  addAttributeData(type, name = '', value, strings) {
    const hasValue = value !== undefined;
    /** @type { AttributeData } */
    let data;
    let length = 0;

    switch (type) {
      case 'boolean': {
        if (name.startsWith('?')) {
          name = name.slice(1);
        }
        // Zero length if static
        length = hasValue ? 0 : 1;
        data = {
          type,
          length,
          name,
          nameAsBuffer: Buffer.from(`${name}`),
        };
        if (hasValue) {
          data.value = data.nameAsBuffer;
        }
        break;
      }
      case 'attribute': {
        // Zero length if static (no `strings`)
        length = strings !== undefined ? strings.length - 1 : 0;
        data = {
          type,
          length,
          name,
          open: Buffer.from(`${name}="`),
          close: strings !== undefined ? Buffer.from(`${strings[strings.length - 1]}"`) : QUOTE_BUFFER,
          strings,
        };
        if (hasValue) {
          data.value = Buffer.from(`${name}="${value}"`);
        }
        break;
      }
      default: {
        // Property attributes can have multiple parts
        length = strings !== undefined ? strings.length - 1 : 1;
        data = {
          type,
          length,
          value: EMPTY_STRING_BUFFER,
        };
        this.hasDynamicParts = true;
      }
    }

    this.length += length;
    this._attributes.push(data);
  }

  /**
   * Retrieve resolved string Buffer from passed "values".
   * Resolves to a single string, or Promise for a single string,
   * even when responsible for multiple values.
   * @param { Array<unknown> } values
   * @param { InternalRenderOptions } [options]
   * @returns { Buffer }
   */
  resolveValue(values, options) {
    /** @type { Array<Buffer> } */
    let chunks = [];
    let valuesIndex = 0;

    for (let data of this._attributes) {
      if (data.value !== undefined) {
        chunks.push(SPACE_BUFFER, data.value);
      } else {
        // Only boolean or attribute types may have unresolved "value"
        if (data.type === 'boolean') {
          const resolvedValue = resolveAttributeValue(values[valuesIndex], this.tagName, data);

          // Skip if "nothing"
          if (resolvedValue !== nothing) {
            chunks.push(SPACE_BUFFER, resolvedValue);
          }
        } else if (data.type === 'attribute') {
          let bailed = false;
          let pendingChunks = [/** @type { Buffer } */ (data.open)];

          for (let i = 0; i < data.length; i++) {
            const resolvedValue = resolveAttributeValue(values[valuesIndex + i], this.tagName, data);

            // Bail if at least one value is "nothing"
            if (resolvedValue === nothing) {
              bailed = true;
              break;
            }

            if (data.strings !== undefined) {
              pendingChunks.push(data.strings[i], resolvedValue);
            }
          }

          if (!bailed) {
            pendingChunks.push(/** @type { Buffer } */ (data.close));
            chunks.push(SPACE_BUFFER, ...pendingChunks);
          }
        }

        valuesIndex += data.length;
      }
    }

    return Buffer.concat(chunks);
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
    // Disable metadata if inside raw text node
    return resolveNodeValue(value, this, RE_RAW_TEXT_ELEMENT.test(this.tagName) ? false : withMetadata);
  }
}

/**
 * A template part for custom element content
 * @implements CustomElementChildPartType
 */
export class CustomElementChildPart {
  /**
   * Constructor
   * @param { string } tagName
   * @param { { [name: string]: string | undefined } } attributes
   */
  constructor(tagName, attributes) {
    this.type = partType.CUSTOMELEMENT;
    this.tagName = tagName;
    this.attributes = attributes;
  }

  /**
   * Retrieve resolved value given passed "value"
   * @param { unknown } value
   * @param { boolean } [withMetadata]
   * @returns { unknown }
   */
  resolveValue(value, withMetadata = false) {
    return '';
    // return resolveNodeValue(value, this, withMetadata);
  }
}

/**
 * A template part for hydration metadata
 * @implements MetadataPartType
 */
export class MetadataPart {
  /**
   * Constructor
   * @param { string } tagName
   * @param { Buffer } value
   */
  constructor(tagName, value) {
    this.type = partType.METADATA;
    this.tagName = tagName;
    this.value = value;
  }

  /**
   * Retrieve resolved value given passed "value"
   * @param { boolean } [withMetadata]
   * @returns { unknown }
   */
  resolveValue(withMetadata = false) {
    // Disable metadata if inside raw text node
    return RE_RAW_TEXT_ELEMENT.test(this.tagName) ? EMPTY_STRING_BUFFER : this.value;
  }
}

/**
 * Resolve "value" to Buffer
 * @param { unknown } value
 * @param { string } tagName
 * @param { BooleanAttributeData | AttributeAttributeData } data
 * @returns { Buffer | nothing }
 */
function resolveAttributeValue(value, tagName, data) {
  if (isDirective(value)) {
    /** @type { PartInfo } */
    const partInfo = {
      name: data.name,
      tagName,
      type: TYPE_TO_LIT_PART_TYPE[data.type],
    };
    if (data.type === 'attribute' && data.strings !== undefined && data.length > 1) {
      partInfo.strings = data.strings.map((string) => string.toString());
    }

    value = resolveDirectiveValue(value, partInfo);
  }

  // Bail if "nothing"
  if (value === nothing) {
    return value;
  }

  if (data.type === 'boolean') {
    return value ? data.nameAsBuffer : EMPTY_STRING_BUFFER;
  }

  if (isPrimitive(value)) {
    const string = typeof value !== 'string' ? String(value) : value;
    return Buffer.from(escape(string, 'attribute'));
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
    value = resolveDirectiveValue(value, {
      type: TYPE_TO_LIT_PART_TYPE['child'],
      tagName: part.tagName,
    });
  }

  if (value === nothing || value == null) {
    value = EMPTY_STRING_BUFFER;
  }

  if (isPrimitive(value)) {
    const string = typeof value !== 'string' ? String(value) : value;
    value = Buffer.from(escape(string, part.tagName === 'script' || part.tagName === 'style' ? part.tagName : 'text'));
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
 * @param { PartInfo } partInfo
 * @returns { unknown }
 */
function resolveDirectiveValue(directiveResult, partInfo) {
  // @ts-ignore
  const directive = new directiveResult._$litDirective$(partInfo);
  // @ts-ignore
  const result = directive.render(...directiveResult.values);

  if (result === noChange) {
    return EMPTY_STRING_BUFFER;
  }
  // Handle fake TemplateResult from unsafeHTML/unsafeSVG
  else if (isObject(result) && 'strings' in result) {
    // @ts-ignore
    const unsafeStrings = result.strings;
    // Make fake Template instance to avoid unnecessary parsing
    const template = {
      digest: digestForTemplateStrings(unsafeStrings),
      strings: [Buffer.from(unsafeStrings[0])],
      parts: [],
    };
    return new TemplateResult(template, []);
  } else {
    return result;
  }
}
