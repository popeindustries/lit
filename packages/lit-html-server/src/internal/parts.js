import { EMPTY_STRING_BUFFER, META_CHILD_CLOSE, META_CHILD_OPEN, SPACE_STRING_BUFFER } from './consts.js';
import {
  isArray,
  isAsyncIterator,
  isBuffer,
  isDirective,
  isPrimitive,
  isPromise,
  isSyncIterator,
  isTemplateInstanceOrResult,
} from './is.js';
import { noChange, nothing } from '@popeindustries/lit-html';
import { Buffer } from '#buffer';
import { escape } from './escape.js';
import { getElementRenderer } from './get-element-renderer.js';
import { getTemplateInstance } from './template-instance.js';

export const partType = {
  METADATA: 0,
  ATTRIBUTE: 1,
  CHILD: 2,
  CUSTOMELEMENT_OPEN: 3,
  CUSTOMELEMENT_CLOSE: 4,
};

/** @type { Array<string> & { raw?: Array<string> }} */
const EMPTY_STRINGS_ARRAY = ['', ''];
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
 * Determine if "part" is a CustomElementOpenPart
 * @param { Part } part
 * @returns { part is CustomElementOpenPartType }
 */
export function isCustomElementOpenPart(part) {
  return part.type === partType.CUSTOMELEMENT_OPEN;
}

/**
 * Determine if "part" is a CustomElementClosePart
 * @param { Part } part
 * @returns { part is CustomElementClosePartType }
 */
export function isCustomElementClosePart(part) {
  return part.type === partType.CUSTOMELEMENT_CLOSE;
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
    this._parts = [];
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
        const unprefixedName = name.startsWith('?') ? name.slice(1) : name;
        // Zero length if static
        length = hasValue ? 0 : 1;
        data = {
          type,
          length,
          name,
          nameBuffer: Buffer.from(unprefixedName),
        };
        if (hasValue) {
          data.value = '';
          data.resolvedBuffer = data.nameBuffer;
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
        length = 1;
        data = {
          type,
          length,
          name,
          value: '',
          resolvedBuffer: EMPTY_STRING_BUFFER,
        };
      }
    }

    this.length += length;
    this._parts.push(data);
  }

  /**
   * Retrieve resolved string Buffer from passed "values".
   * Resolves to a single string even when responsible for multiple values.
   * @param { Array<unknown> } values
   * @param { InternalRenderOptions } options
   * @returns { unknown }
   */
  resolveValue(values, options) {
    /** @type { Array<Buffer> } */
    const buffer = [];
    let valuesIndex = 0;

    for (let data of this._parts) {
      if (data.resolvedBuffer !== undefined) {
        if (data.resolvedBuffer !== EMPTY_STRING_BUFFER) {
          buffer.push(SPACE_BUFFER, data.resolvedBuffer);
        }
      } else {
        // Only boolean or attribute types may have unresolved "value"
        if (data.type === 'boolean') {
          const partValue = resolveAttributeValue(values[valuesIndex], this.tagName, data);

          // Skip if "nothing"
          if (partValue !== nothing) {
            buffer.push(SPACE_BUFFER, data.nameBuffer);
          }
        } else if (data.type === 'attribute') {
          let resolvedValue = '';
          const strings = /** @type { Array<string> } */ (data.strings);
          const n = data.length;
          let bailed = false;

          for (let i = 0; i < n; i++) {
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
            resolvedValue = `${data.name}="${resolvedValue}"`;
            buffer.push(SPACE_BUFFER, Buffer.from(resolvedValue));
          }
        }
      }

      valuesIndex += data.length;
    }

    return Buffer.concat(buffer);
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
   * @param { InternalRenderOptions } options
   * @returns { unknown }
   */
  resolveValue(value, options) {
    // Disable metadata if inside raw text node
    return resolveNodeValue(
      value,
      this.tagName,
      RE_RAW_TEXT_ELEMENT.test(this.tagName) || !options.includeHydrationMetadata ? false : true,
    );
  }
}

/**
 * A template part for opening custom element content.
 * Responsible for all attributes, metadata, and tag content
 * @implements CustomElementOpenPartType
 */
export class CustomElementOpenPart extends AttributePart {
  /**
   * Constructor
   * @param { string } tagName
   */
  constructor(tagName) {
    super(tagName);
    /** @type { typeof HTMLElement | undefined } */
    this.ceClass = customElements.get(tagName);
    this.tagName = tagName;
    this.type = partType.CUSTOMELEMENT_OPEN;
  }

  /**
   * Retrieve resolved value given passed "values"
   * @param { Array<unknown> } values
   * @param { InternalRenderOptions } options
   * @returns { unknown }
   */
  resolveValue(values, options) {
    options.customElementStack.push(this.tagName);

    // TODO: recycle renderers since all operations here are synchronous
    // Create renderer (and element instanace)
    const renderer = getElementRenderer(options, this.tagName, this.ceClass);
    renderer.connectedCallback();

    let valuesIndex = 0;

    for (let data of this._parts) {
      if (data.value !== undefined) {
        setRendererPropertyOrAttribute(renderer, data.name, data.value);
      } else {
        if (data.type === 'boolean') {
          const partValue = resolveAttributeValue(values[valuesIndex], this.tagName, data);

          // Skip if "nothing"
          if (partValue !== nothing) {
            setRendererPropertyOrAttribute(renderer, data.name, '');
          }
        }
        // Handle single property
        else if (data.type === 'property' && data.length === 1) {
          const partValue = resolvePropertyValue(values[valuesIndex], this.tagName, data);

          if (partValue !== nothing) {
            setRendererPropertyOrAttribute(renderer, data.name, partValue);
          }
        }
        // Handle attributes and properties with multiple parts
        else if (data.type === 'attribute' || data.type === 'property') {
          let resolvedValue = '';
          const strings = /** @type { Array<string> } */ (data.strings);
          const n = data.length;
          let bailed = false;

          for (let i = 0; i < n; i++) {
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
            setRendererPropertyOrAttribute(renderer, data.name, resolvedValue);
          }
        }
      }

      valuesIndex += data.length;
    }

    const shouldRender = !renderer.element.hasAttribute('render:client');

    if (shouldRender) {
      renderer.setAttribute('hydrate:defer', '');
    }

    const resolvedAttributes = Buffer.from(`${renderer.renderAttributes()}>`);
    /** @type { Array<unknown> } */
    const result = [resolvedAttributes];

    if (options.includeHydrationMetadata) {
      result.push(Buffer.from(`<!--lit-attr ${this.length}-->`));
    }

    if (shouldRender) {
      let renderedContent = renderer.render();

      if (renderedContent != null) {
        // Handle string from innerHTML (convert to fake TemplateResult to avoid escaping).
        if (typeof renderedContent === 'string') {
          renderedContent = /** @type { TemplateResult } */ ({
            _$litType$: 1,
            strings: EMPTY_STRINGS_ARRAY,
            values: [Buffer.from(renderedContent)],
          });
        }
        const hasShadowDOM = renderer.element.shadowRoot !== null;
        const instance = getTemplateInstance(renderedContent);
        if (hasShadowDOM) {
          instance.setAsRoot('shadow', renderer.renderStyles());
        } else {
          instance.setAsRoot('light');
        }
        result.push(resolveNodeValue(instance, this.tagName, options.includeHydrationMetadata ?? false));
      }
    }

    return result;
  }
}

/**
 * A template part for closing custom element content.
 * Responsible for book keeping of custom element stack
 * @implements CustomElementClosePartType
 */
export class CustomElementClosePart {
  /**
   * Constructor
   * @param { string } tagName
   */
  constructor(tagName) {
    this.tagName = tagName;
    this.type = partType.CUSTOMELEMENT_CLOSE;
  }

  /**
   * Retrieve resolved value and manage active custom element stack
   * @param { InternalRenderOptions } options
   * @returns { unknown }
   */
  resolveValue(options) {
    // Remove from custom elements stack
    if (options.customElementStack[options.customElementStack.length - 1] === this.tagName) {
      options.customElementStack.pop();
    } else {
      // TODO: unbalanced tag?
    }

    return EMPTY_STRING_BUFFER;
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
   * @param { InternalRenderOptions } options
   * @returns { unknown }
   */
  resolveValue(options) {
    // Disable metadata if inside raw text node
    return RE_RAW_TEXT_ELEMENT.test(this.tagName) || !options.includeHydrationMetadata
      ? EMPTY_STRING_BUFFER
      : this.value;
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
    return value ? '' : nothing;
  } else if (isPrimitive(value)) {
    const string = typeof value !== 'string' ? String(value) : value;
    return escape(string, 'attribute');
  } else if (isBuffer(value)) {
    return value.toString();
  } else {
    return String(value);
  }
}

/**
 * Resolve "value" to Buffer
 * @param { unknown } value
 * @param { string } tagName
 * @param { AttributeOrPropertyAttributeData } data
 * @returns { unknown }
 */
function resolvePropertyValue(value, tagName, data) {
  if (isDirective(value)) {
    /** @type { PartInfo } */
    const partInfo = {
      name: data.name,
      tagName,
      type: TYPE_TO_LIT_PART_TYPE[data.type],
    };
    if (data.strings !== undefined && data.length > 1) {
      partInfo.strings = data.strings.map((string) => string.toString());
    }

    value = resolveDirectiveValue(value, partInfo);
  }

  return value;
}

/**
 * Resolve "value" to string Buffer if possible
 * @param { unknown } value
 * @param { string } tagName
 * @param { boolean } withMetadata
 * @returns { unknown }
 */
function resolveNodeValue(value, tagName, withMetadata) {
  let valueIsDirective = false;

  if (isDirective(value)) {
    valueIsDirective = true;
    value = resolveDirectiveValue(value, {
      type: TYPE_TO_LIT_PART_TYPE['child'],
      tagName,
    });
  }

  if (value === nothing || value == null) {
    // Insert empty text node to ensure that Part creation during hydration
    // has an assigned node to update.
    // Fixes https://github.com/popeindustries/lit/issues/7
    value = SPACE_STRING_BUFFER;
  }

  if (isPrimitive(value)) {
    let string = typeof value !== 'string' ? String(value) : value;
    string = escape(string, tagName === 'script' || tagName === 'style' ? tagName : 'text');
    value = Buffer.from(string);
  }

  if (isBuffer(value)) {
    return withMetadata ? [META_CHILD_OPEN, value, META_CHILD_CLOSE] : value;
  } else if (isTemplateInstanceOrResult(value)) {
    return value;
  } else if (isPromise(value)) {
    // Promises are only supported if generated by a directive,
    // or we are not generating hydratable markup
    if (!valueIsDirective && withMetadata) {
      throw Error(
        `lit-html does not support interpolation of Promises, and these will not be rendered correctly in the browser. Use the "until" directive instead.`,
      );
    }
    return value.then((value) => resolveNodeValue(value, tagName, withMetadata));
  } else if (isSyncIterator(value)) {
    if (!isArray(value)) {
      value = Array.from(value);
    }
    /** @type { Array<unknown> } */
    const collection = withMetadata ? [META_CHILD_OPEN] : [];
    for (let val of /** @type { Array<unknown> } */ (value)) {
      val = resolveNodeValue(val, tagName, withMetadata);
      // Flatten
      if (isArray(val)) {
        collection.push(...val);
      } else {
        collection.push(val);
      }
    }
    if (withMetadata) {
      collection.push(META_CHILD_CLOSE);
    }
    return collection;
  } else if (isAsyncIterator(value)) {
    // AsyncIterators are only supported if generated by a directive,
    // or we are not generating hydratable markup
    if (!valueIsDirective && withMetadata) {
      throw Error(
        `lit-html does not support interpolation of AsyncIterators, and these will not be rendered correctly in the browser. Use the "async-*" directives instead.`,
      );
    }
    return resolveAsyncIteratorValue(value, tagName, withMetadata);
  } else {
    throw Error(`unknown NodePart value: ${value}`);
  }
}

/**
 * Resolve values of async "iterator"
 * @param { AsyncIterable<unknown> } iterator
 * @param { string } tagName
 * @param { boolean } withMetadata
 * @returns { AsyncGenerator<unknown> }
 */
async function* resolveAsyncIteratorValue(iterator, tagName, withMetadata) {
  for await (const value of iterator) {
    yield resolveNodeValue(value, tagName, withMetadata);
  }
}

/**
 * Resolve value of "directive"
 * @param { import('@popeindustries/lit-html/directive.js').DirectiveResult } directiveResult
 * @param { PartInfo } partInfo
 * @returns { unknown }
 */
function resolveDirectiveValue(directiveResult, partInfo) {
  // @ts-ignore
  const Ctor = directiveResult._$litDirective$;
  const { directiveName } = Ctor;
  const directive = new Ctor(partInfo);
  // @ts-ignore
  const result = directive.render(...directiveResult.values);

  if (result === noChange) {
    return EMPTY_STRING_BUFFER;
  }

  if (directiveName === 'unsafeHTML' || directiveName === 'unsafeSVG') {
    // Return Buffer to avoid string escaping
    return Buffer.from(result.strings[0]);
  }

  return result;
}

/**
 * Set property or attribute on "renderer"
 * @param { ElementRenderer } renderer
 * @param { string } name
 * @param { unknown } value
 */
function setRendererPropertyOrAttribute(renderer, name, value) {
  if (name.startsWith('.')) {
    renderer.setProperty(name.slice(1), value);
  } else if (name.startsWith('?')) {
    // @ts-ignore - is string
    renderer.setAttribute(name.slice(1), value);
  } else {
    // @ts-ignore - is string
    renderer.setAttribute(name, value);
  }
}
