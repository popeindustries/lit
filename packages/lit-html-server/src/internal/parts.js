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
 * Determine if "part" is an AttributePart
 * @param { Part } part
 * @returns { part is AttributePartType }
 */
export function isAttributePart(part) {
  return part.type === partType.ATTRIBUTE;
}

/**
 * Determine if "part" is a ChildPart
 * @param { Part } part
 * @returns { part is ChildPartType }
 */
export function isChildPart(part) {
  return part.type === partType.CHILD;
}

/**
 * Determine if "part" is a CustomElementChildPart
 * @param { Part } part
 * @returns { part is CustomElementChildPartType }
 */
export function isCustomElementChildPart(part) {
  return part.type === partType.CUSTOMELEMENT;
}

/**
 * Determine if "part" is a MetadataPart
 * @param { Part } part
 * @returns { part is MetadataPartType }
 */
export function isMetadataPart(part) {
  return part.type === partType.METADATA;
}

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
   * @param { boolean } isCustomElement
   */
  constructor(tagName, isCustomElement) {
    this.isCustomElement = isCustomElement;
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
   * @param { Array<string> } [strings]
   */
  addAttributeData(type, name = '', value, strings) {
    const hasValue = value !== undefined;
    /** @type { AttributeData } */
    let data;
    let length = 0;

    switch (type) {
      case 'boolean': {
        // Zero length if static
        length = hasValue ? 0 : 1;
        data = {
          type,
          length,
          name,
        };
        if (hasValue) {
          const parsedName = name.startsWith('?') ? name.slice(1) : name;
          data.value = parsedName;
          data.resolvedBuffer = Buffer.from(parsedName);
        }
        break;
      }
      case 'attribute':
      case 'property': {
        // Zero length if static (no `strings`)
        length = strings !== undefined ? strings.length - 1 : 0;
        data = {
          type,
          length,
          name,
          strings,
        };
        if (hasValue) {
          data.value = value;
          data.resolvedBuffer = data.type === 'attribute' ? Buffer.from(`${name}="${value}"`) : EMPTY_STRING_BUFFER;
        }
        break;
      }
      default: {
        data = {
          type,
          length: 1,
          name,
          value: '',
          resolvedBuffer: EMPTY_STRING_BUFFER,
        };
      }
    }

    this.length += length;
    this._attributes.push(data);
  }

  /**
   * Retrieve resolved string Buffer from passed "values".
   * Resolves to a single string even when responsible for multiple values.
   * @param { Array<unknown> } values
   * @returns { Buffer }
   */
  resolveValueAsBuffer(values) {
    return /** @type { Buffer } */ (this.resolveValue(values, true));
  }

  /**
   * Retrieve resolved string Buffer from passed "values".
   * Resolves to a single string even when responsible for multiple values.
   * @param { Array<unknown> } values
   * @returns { Record<string, string> }
   */
  resolveValueAsRecord(values) {
    return /** @type { Record<string, string> } */ (this.resolveValue(values, false));
  }

  /**
   * @param { Array<unknown> } values
   * @param { boolean } asBuffer
   * @returns { Buffer | Record<string, string> }
   */
  resolveValue(values, asBuffer) {
    /** @type { Record<string, string> } */
    const attributes = {};
    /** @type { Array<Buffer> } */
    const buffer = [];
    let valuesIndex = 0;

    for (let data of this._attributes) {
      if (asBuffer && data.resolvedBuffer !== undefined) {
        buffer.push(SPACE_BUFFER, data.resolvedBuffer);
      } else if (data.value !== undefined) {
        attributes[data.name] = data.value;
      } else {
        // Only boolean or attribute types may have unresolved "value"
        if (data.type === 'boolean') {
          const partValue = resolveAttributeValue(values[valuesIndex], this.tagName, data);

          // Skip if "nothing"
          if (partValue !== nothing) {
            if (asBuffer) {
              buffer.push(SPACE_BUFFER, Buffer.from(partValue));
            } else {
              attributes[data.name] = partValue;
            }
          }
        } else if (data.type === 'attribute' || data.type === 'property') {
          let resolvedValue = '';
          const strings = /** @type { Array<string> } */ (data.strings);
          let bailed = false;

          for (let i = 0; i < data.length; i++) {
            const partValue = resolveAttributeValue(values[valuesIndex + i], this.tagName, data);

            // Bail if at least one value is "nothing"
            if (partValue === nothing) {
              bailed = true;
              break;
            }

            resolvedValue += strings[i] + partValue;
          }

          if (!bailed) {
            resolvedValue += strings[strings.length - 1];

            if (asBuffer) {
              if (data.type === 'attribute') {
                resolvedValue = `${data.name}="${resolvedValue}"`;
              } else if (data.type === 'property') {
                resolvedValue = '';
              }
              buffer.push(SPACE_BUFFER, Buffer.from(resolvedValue));
            } else {
              attributes[data.name] = resolvedValue;
            }
          }
        }

        valuesIndex += data.length;
      }
    }

    return asBuffer ? Buffer.concat(buffer) : attributes;
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
    return resolveNodeValue(value, this, RE_RAW_TEXT_ELEMENT.test(this.tagName) || !withMetadata ? false : true);
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
    return RE_RAW_TEXT_ELEMENT.test(this.tagName) || !withMetadata ? EMPTY_STRING_BUFFER : this.value;
  }
}

/**
 * Resolve "value" to Buffer
 * @param { unknown } value
 * @param { string } tagName
 * @param { AttributeData } data
 * @returns { string | nothing }
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
    const resolvedName = data.name.startsWith('?') ? data.name.slice(1) : data.name;
    return value ? resolvedName : '';
  }

  if (isPrimitive(value)) {
    const string = typeof value !== 'string' ? String(value) : value;
    return escape(string, 'attribute');
  } else if (isBuffer(value)) {
    return value.toString();
  } else {
    return String(value);
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
