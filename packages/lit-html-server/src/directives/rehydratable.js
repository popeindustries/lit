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
   * On the client, pass the same `value: TemplateResult` to `hydrateOrRender()`
   * to rehydrate the server-rendered DOM into an active lit-html template.
   * @param { TemplateResult } value
   */
  render(value) {
    value.rehydratable = true;
    return value;
  }
}

export const rehydratable = directive(RehydratableDirective);
