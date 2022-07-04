import { EMPTY_STRING_BUFFER, META_CLOSE } from './consts.js';
import { Buffer } from '#buffer';
import { partType } from './parts.js';

let id = 0;

/**
 * A class for consuming the combined static and dynamic parts of a Template.
 */
export class TemplateResult {
  /**
   * Constructor
   * @param { Template } template
   * @param { Array<unknown> } values
   */
  constructor(template, values) {
    this.template = template;
    this.values = values;
    this.id = id++;
    this.index = 0;
    this.maxIndex = this.template.strings.length + this.template.parts.length - 1;
    this.metadata = Buffer.from(`<!--lit-part ${this.template.digest}-->`);
    this.valueIndex = 0;
  }

  /**
   * Consume template result content one chunk at a time.
   * @param { RenderOptions } [options]
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

    switch (part.type) {
      case partType.ATTRIBUTE:
      case partType.PROPERTY: {
        const length = /** @type { AttributePartType } */ (part).length;
        let value;
        // AttributeParts can have multiple values, so slice based on length
        // (strings in-between values are already handled by the instance)
        if (length > 1) {
          value = this.values.slice(this.valueIndex, this.valueIndex + length);
        } else {
          value = [this.values[this.valueIndex]];
        }
        this.valueIndex += length;
        // @ts-ignore
        return part.type === partType.PROPERTY ? part.value : part.resolveValue(value, options);
      }
      case partType.BOOLEAN: {
        // @ts-ignore
        const value = part.resolveValue(this.values[this.valueIndex], options);
        this.valueIndex++;
        return value;
      }
      case partType.CHILD: {
        // @ts-ignore
        let value = part.resolveValue(this.values[this.valueIndex], options);
        this.valueIndex++;
        return value;
      }
      case partType.METADATA: {
        // @ts-ignore
        return options?.includeRehydrationMetadata ? part.value : EMPTY_STRING_BUFFER;
      }
      default:
        this.valueIndex++;
        // @ts-ignore
        return part.value;
    }
  }
}
