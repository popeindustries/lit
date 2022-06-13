import { partType } from './parts.js';

const EMPTY_STRING_BUFFER = Buffer.from('');

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
    this.valueIndex = 0;
  }

  /**
   * Consume template result content one chunk at a time.
   * @param { RenderOptions } [options]
   * @returns { unknown }
   */
  readChunk(options) {
    const isString = this.index % 2 === 0;
    const index = (this.index / 2) | 0;

    // Finished
    if (!isString && index >= this.template.strings.length - 1) {
      // Reset
      this.index = 0;
      this.valueIndex = 0;
      return null;
    }

    this.index++;

    if (isString) {
      return this.template.strings[index];
    }

    const part = this.template.parts[index];

    switch (part.type) {
      case partType.ATTRIBUTE: {
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
        return part.resolveValue(value, options);
      }
      case partType.BOOLEAN:
      case partType.CHILD: {
        // @ts-ignore
        const value = part.resolveValue(this.values[this.valueIndex], options);
        this.valueIndex++;
        return value;
      }
      case partType.METADATA: {
        const hasMetadata = options?.includeRehydrationMetadata;
        // @ts-ignore
        return hasMetadata ? part.value : EMPTY_STRING_BUFFER;
      }
      default:
        this.valueIndex++;
        // @ts-ignore
        return part.value;
    }
  }
}
