import { directive, Directive, PartType } from 'lit-html/directive.js';
import { getTemplateInstance } from '@popeindustries/lit-html-server';

class HydratableDirective extends Directive {
  /**
   * Constructor
   * @param { import('lit-html/directive.js').PartInfo } partInfo
   */
  constructor(partInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.CHILD) {
      throw new Error('asyncAppend can only be used in child expressions');
    }
  }

  /**
   * Server renders an html sub-tree with hydration metadata.
   * On the client, pass the same `TemplateResult` resolved by `value` to `render()`
   * to hydrate the server-rendered DOM into an active lit-html template.
   * @param { TemplateResult | Promise<TemplateResult> } value
   */
  render(value) {
    if (isPromise(value)) {
      return value.then((value) => resolveTemplateResult(value));
    }
    return resolveTemplateResult(value);
  }
}

export const hydratable = directive(HydratableDirective);

/**
 * Convert `result` to TemplateInstance
 * @param { TemplateResult } result
 */
function resolveTemplateResult(result) {
  const instance = getTemplateInstance(result);
  instance.hydratable = true;
  instance.root = 'light';
  return instance;
}

/**
 * Determine if "promise" is a Promise instance
 * @param { unknown } promise
 * @returns { promise is Promise<unknown> }
 */
function isPromise(promise) {
  return promise != null && /** @type { Promise<unknown> } */ (promise).then != null;
}
