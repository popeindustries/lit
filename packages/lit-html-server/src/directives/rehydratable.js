import { directive, Directive, PartType } from 'lit-html/directive.js';

class RehydratableDirective extends Directive {
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
   * Server renders an html subtree with rehydration metadata.
   * On the client, pass the same `TemplateResult` resolved by `value` to `hydrateOrRender()`
   * to rehydrate the server-rendered DOM into an active lit-html template.
   * @param { TemplateResult | Promise<TemplateResult> } value
   */
  render(value) {
    if (isPromise(value)) {
      return value.then((result) => {
        result.rehydratable = true;
        return result;
      });
    }
    value.rehydratable = true;
    return value;
  }
}

export const rehydratable = directive(RehydratableDirective);

/**
 * Determine if "promise" is a Promise instance
 * @param { unknown } promise
 * @returns { promise is Promise<unknown> }
 */
function isPromise(promise) {
  return promise != null && /** @type { Promise<unknown> } */ (promise).then != null;
}
