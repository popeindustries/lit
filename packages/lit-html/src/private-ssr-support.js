/**
 * @typedef { import ('./vendor/lit-html.js').AttributePart } AttributePart
 * @typedef { import ('./vendor/lit-html.js').Part } Part
 * @typedef { import ('./vendor/lit-html.js')['_$LH']['_TemplateInstance'] } TemplateInstance
 */

import { _$LH as p } from './vendor/lit-html.js';

const ChildPart = p._ChildPart;
const ElementPart = p._ElementPart;
const resolveDirective = p._resolveDirective;
const TemplateInstance = p._TemplateInstance;

export const _$LH = {
  ChildPart,
  ElementPart,
  resolveDirective,
  TemplateInstance,
  /**
   * @param { Part } part
   */
  getPartCommittedValue(part) {
    // @ts-expect-error - private
    return part._$committedValue;
  },
  /**
   * @param { Part } part
   * @param { unknown } value
   */
  setPartCommittedValue(part, value) {
    // @ts-expect-error - private
    part._$committedValue = value;
  },
  /**
   * @param { InstanceType<TemplateInstance> } instance
   * @param { Part } part
   */
  templateInstanceAddPart(instance, part) {
    // @ts-expect-error - private
    instance._parts.push(part);
  },
  /**
   * @param { InstanceType<TemplateInstance> } instance
   * @param { number } index
   * @returns { Part | undefined }
   */
  getTemplateInstanceTemplatePart(instance, index) {
    // @ts-expect-error - private
    return instance._$template.parts[index];
  },
  /**
   * @param { AttributePart } part
   * @param { unknown } value
   * @param { number } index
   * @param { boolean } noCommit
   */
  setAttributePartValue(part, value, index, noCommit) {
    // @ts-expect-error - private
    part._$setValue(value, part, index, noCommit);
  },
  /**
   * @param { TemplateResult } value
   */
  getChildPartTemplate(value) {
    // @ts-expect-error - private
    return ChildPart.prototype._$getTemplate(value);
  },
  /**
   * @param { InstanceType<ChildPart> } part
   * @param { Comment } marker
   */
  setChildPartEndNode(part, marker) {
    // @ts-expect-error - private
    part._$endNode = marker;
  },
};
