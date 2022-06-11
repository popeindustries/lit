import { isAttributeOrPropertyPart, isMetadataPart } from './is.js';

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
    this.valueOffset = 0;
  }

  /**
   * Consume template result content one chunk at a time.
   * @param { RenderOptions } [options]
   * @returns { unknown }
   */
  readChunk(options) {
    const isString = this.index % 2 === 0;
    const index = (this.index / 2) | 0;
    const addMetadata = options !== undefined && options.includeRehydrationMetadata;

    // Finished
    if (!isString && index >= this.template.strings.length - 1) {
      // Reset
      this.index = 0;
      this.valueOffset = 0;
      return null;
    }

    this.index++;

    if (isString) {
      return this.template.strings[index];
    }

    const part = this.template.parts[index];
    const isMetadata = isMetadataPart(part);
    let value;

    if (isMetadata) {
      this.valueOffset++;
    } else if (isAttributeOrPropertyPart(part)) {
      // AttributeParts can have multiple values, so slice based on length
      // (strings in-between values are already handled by the instance)
      if (part.length > 1) {
        value = part.resolveValue(this.values.slice(index, index + part.length), options);
        this.index += part.length;
      } else {
        value = part.resolveValue([this.values[index]], options);
      }
    } else {
      value = part.resolveValue(this.values[index], options);
    }

    return value;
  }
}
