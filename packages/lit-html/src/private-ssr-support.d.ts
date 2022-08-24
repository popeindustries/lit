import { _$LH as p, AttributePart, Part, TemplateResult } from './vendor/lit-html.js';

type ChildPart = typeof p['_ChildPart'];
type TemplateInstance = typeof p['_TemplateInstance'];

export const _$LH: {
  ChildPart: ChildPart;
  ElementPart: typeof p['_ElementPart'];
  resolveDirective: typeof p['_resolveDirective'];
  TemplateInstance: TemplateInstance;
  getPartCommittedValue(part: Part): unknown;
  setPartCommittedValue(part: Part, value: unknown): void;
  templateInstanceAddPart(instance: InstanceType<TemplateInstance>, part: Part): void;
  getTemplateInstanceTemplatePart(instance: InstanceType<TemplateInstance>, index: number): Part | undefined;
  setAttributePartValue(part: AttributePart, value: unknown, index: number, noCommit: boolean): void;
  getChildPartTemplate(value: TemplateResult): any;
  setChildPartEndNode(part: InstanceType<ChildPart>, marker: Comment): void;
};
