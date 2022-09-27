import { Directive, DirectiveResult } from '@popeindustries/lit-html/directive.js';

declare class HydratableDirective extends Directive {
  render(value: TemplateResult | Promise<TemplateResult>): TemplateResult | Promise<TemplateResult>;
}

/**
 * Server renders an html sub-tree with hydration metadata.
 * On the client, pass the same `value: TemplateResult` to `render()`
 * to hydrate the server-rendered DOM into an active lit-html template.
 */
export function hydratable(value: TemplateResult): DirectiveResult<typeof HydratableDirective>;

export type { HydratableDirective };
