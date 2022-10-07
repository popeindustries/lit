import {
  isAttributePart,
  isChildPart,
  isCustomElementClosePart,
  isCustomElementOpenPart,
  isMetadataPart,
} from './parts.js';
import { META_CHILD_CLOSE, META_CLOSE, META_CLOSE_SHADOW } from './consts.js';
import { Buffer } from '#buffer';
import { getTemplate } from './template.js';

const templateCache = new Map();
let id = 0;

/**
 * Retrieve `TemplateInstance` instance
 * @param { TemplateResult } result
 */
export function getTemplateInstance(result) {
  const strings = result.strings;
  let template = templateCache.get(strings);

  // FIXME: We should either remove the cache here, or try to fix it another way.
  //.       This results into memory leak in our application it just eats memory.
  // if (template === undefined) {
  //  template = getTemplate(strings);
  //  templateCache.set(strings, template);
  //}

  return new TemplateInstance(template, result.values);
}

/**
 * A class for consuming the combined static and dynamic parts of a Template.
 */
export class TemplateInstance {
  /**
   * Constructor
   * @param { Template } template
   * @param { Array<unknown> } values
   * @param { boolean } [hydratable]
   */
  constructor(template, values, hydratable = false) {
    this._$litServerTemplateInstance$ = true;
    this.hydratable = hydratable;
    this.id = id++;
    this.index = 0;
    this.maxIndex = template.strings.length + template.parts.length - 1;
    this.prefix = Buffer.from(`<!--lit-child ${template.digest}-->`);
    this.suffix = META_CHILD_CLOSE;
    this.template = template;
    this.valueIndex = 0;
    this.values = values;
  }

  /**
   * Set as root instance.
   * If a `shadow` root, add optional styles.
   * @param { 'light' | 'shadow' } [type]
   * @param { string } [styles]
   */
  setAsRoot(type = 'light', styles = '') {
    const litOpen = `<!--lit ${this.template.digest}-->`;

    if (type === 'light') {
      this.prefix = Buffer.from(litOpen);
      this.suffix = META_CLOSE;
    } else {
      const resolvedStyles = styles ? `<style>${styles}</style>`.replace(/[\n\s]/g, '') : '';
      this.prefix = Buffer.from(`<template shadowroot="open">${resolvedStyles}${litOpen}`);
      this.suffix = META_CLOSE_SHADOW;
    }
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
          string = Buffer.concat([this.prefix, string]);
        }
        if (isLastString) {
          string = Buffer.concat([string, this.suffix]);
        }
      }

      return string;
    }

    const part = this.template.parts[index];

    if (isAttributePart(part) || isCustomElementOpenPart(part)) {
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
    } else if (isMetadataPart(part) || isCustomElementClosePart(part)) {
      return part.resolveValue(options);
    } else {
      this.valueIndex++;
      throw Error(`unknown part: ${part}`);
    }
  }
}
