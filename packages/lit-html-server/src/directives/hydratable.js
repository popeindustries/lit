import { directive, Directive, PartType } from 'lit-html/directive.js';

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
   * @param { TemplateInstance | Promise<TemplateInstance> } value
   */
  render(value) {
    if (isPromise(value)) {
      return value.then((result) => {
        result.hydratable = true;
        return result;
      });
    }
    value.hydratable = true;
    return value;
  }
}

export const hydratable = directive(HydratableDirective);

/**
 * Determine if "promise" is a Promise instance
 * @param { unknown } promise
 * @returns { promise is Promise<unknown> }
 */
function isPromise(promise) {
  return promise != null && /** @type { Promise<unknown> } */ (promise).then != null;
}
