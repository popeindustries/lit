import { isAttributePart, isChildPart, isCustomElementChildPart, isMetadataPart, partType } from './parts.js';
import { META_CLOSE } from './consts.js';
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
   * @param { boolean } [rehydratable]
   */
  constructor(template, values, rehydratable = false) {
    this.id = id++;
    this.index = 0;
    this.maxIndex = template.strings.length + template.parts.length - 1;
    this.metadata = Buffer.from(`<!--lit-part ${template.digest}-->`);
    this.rehydratable = rehydratable;
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
    const withMetadata = options?.includeRehydrationMetadata;

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
          string = Buffer.concat([this.metadata, string]);
        }
        if (isLastString) {
          string = Buffer.concat([string, META_CLOSE]);
        }
      }

      return string;
    }

    const part = this.template.parts[index];

    if (isAttributePart(part)) {
      const length = part.length;
      let value;
      // AttributeParts can have multiple values, so slice based on length
      // (strings in-between values are already handled by the instance)
      if (length > 1) {
        value = this.values.slice(this.valueIndex, this.valueIndex + length);
      } else {
        value = [this.values[this.valueIndex]];
      }
      this.valueIndex += length;

      // if (!part.isCustomElement)
      return part.resolveValueAsBuffer(value);
    } else if (isChildPart(part)) {
      let value = part.resolveValue(this.values[this.valueIndex], options.includeRehydrationMetadata ?? false);
      this.valueIndex++;
      return value;
    } else if (isCustomElementChildPart(part)) {
      // part
      return;
    } else if (isMetadataPart(part)) {
      return part.resolveValue(options.includeRehydrationMetadata ?? false);
    } else {
      this.valueIndex++;
      throw Error(`unknown part: ${part}`);
    }
  }
}
