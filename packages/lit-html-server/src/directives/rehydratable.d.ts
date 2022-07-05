import { Directive, DirectiveResult } from 'lit-html/directive.js';

declare class RehydratableDirective extends Directive {
  /**
   * Server renders an html subtree with rehydration metadata.
   * On the client, pass the same `value: TemplateResult` to `hydrateOrRender()`
   * to rehydrate the server-rendered DOM into an active lit-html template.
   */
  render(value: TemplateResult): TemplateResult;
}

export function rehydratable(value: TemplateResult): DirectiveResult<typeof RehydratableDirective>;

export type { RehydratableDirective };
