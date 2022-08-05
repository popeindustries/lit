import { isAttributePart, isChildPart, isCustomElementPart, isMetadataPart } from './parts.js';
import { META_CHILD_CLOSE, META_CLOSE, META_CLOSE_SHADOW } from './consts.js';
import { Buffer } from '#buffer';

let id = 0;

/**
 * A class for consuming the combined static and dynamic parts of a Template.
 */
export class TemplateResult {
  /**
   * Constructor
   * @param { Template } template
   * @param { Array<unknown> } values
   * @param { boolean } [hydratable]
   */
  constructor(template, values, hydratable = false) {
    this.hydratable = hydratable;
    this.id = id++;
    this.index = 0;
    /** @type { 'light' | 'shadow' | null } */
    this.root = null;
    this.maxIndex = template.strings.length + template.parts.length - 1;
    this.template = template;
    this.valueIndex = 0;
    this.values = values;
  }

  /**
   * Consume template result content one chunk at a time.
   * @param { InternalRenderOptions } options
   * @returns { unknown }
   */
  readChunk(options) {
    const index = (this.index / 2) | 0;
    const isString = this.index % 2 === 0;
    const isFirstString = this.index === 0;
    const isLastString = this.index === this.maxIndex;
    const withMetadata = options?.includeHydrationMetadata;

    // Finished
    if (!isString && this.index >= this.maxIndex) {
      // Reset
      this.index = 0;
      this.valueIndex = 0;
      return null;
    }

    this.index++;

    if (isString) {
      let string = this.template.strings[index];

      if (withMetadata) {
        if (isFirstString) {
          const metadata = `${this.root === 'shadow' ? '<template shadowroot="open">' : ''}<!--lit${
            this.root !== null ? '' : '-child'
          } ${this.template.digest}-->`;
          string = Buffer.concat([Buffer.from(metadata), string]);
        }
        if (isLastString) {
          const metadata =
            this.root === null ? META_CHILD_CLOSE : this.root === 'shadow' ? META_CLOSE_SHADOW : META_CLOSE;
          string = Buffer.concat([string, metadata]);
        }
      }

      return string;
    }

    const part = this.template.parts[index];
    const isCustomElement = isCustomElementPart(part);

    if (isAttributePart(part) || isCustomElement) {
      const length = part.length;
      // AttributeParts can have multiple values, so slice based on length
      // (strings in-between values are already handled by the instance)
      const values = this.values.slice(this.valueIndex, this.valueIndex + length);
      const value = part.resolveValue(values, options);
      this.valueIndex += length;
      return value;
    } else if (isChildPart(part)) {
      const value = part.resolveValue(this.values[this.valueIndex], options);
      this.valueIndex++;
      return value;
    } else if (isMetadataPart(part)) {
      return part.resolveValue(options);
    } else {
      this.valueIndex++;
      throw Error(`unknown part: ${part}`);
    }
  }
}
