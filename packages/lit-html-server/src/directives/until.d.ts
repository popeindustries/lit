import { AsyncDirective } from '@popeindustries/lit-html/async-directive.js';
import { DirectiveResult } from '@popeindustries/lit-html/directive.js';

declare class UntilDirective extends AsyncDirective {
  render(...values: Array<unknown>): unknown;
}

/**
 * Renders one of a series of values, including Promises, in priority order.
 * Not possible to render more than once in a server context, so primitive
 * sync values are prioritised over async, unless there are no more pending
 * values, in which case the last value is always rendered regardless.
 */
export function until(...values: Array<unknown>): DirectiveResult<typeof UntilDirective>;

export type { UntilDirective };
