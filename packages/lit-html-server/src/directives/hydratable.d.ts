import { Directive, DirectiveResult } from 'lit-html/directive.js';

declare class HydratableDirective extends Directive {
  /**
   * Server renders an html sub-tree with hydration metadata.
   * On the client, pass the same `value: TemplateResult` to `render()`
   * to hydrate the server-rendered DOM into an active lit-html template.
   */
  render(value: TemplateResult | Promise<TemplateResult>): TemplateResult | Promise<TemplateResult>;
}

export function hydratable(value: TemplateResult): DirectiveResult<typeof HydratableDirective>;

export type { HydratableDirective };
