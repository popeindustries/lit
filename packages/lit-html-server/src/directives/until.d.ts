import { AsyncDirective } from 'lit-html/async-directive';
import { DirectiveResult } from 'lit-html/directive';

class UntilDirective extends AsyncDirective {
  /**
   * Renders one of a series of values, including Promises, in priority order.
   * Not possible to render more than once in a server context, so primitive
   * sync values are prioritised over async, unless there are no more pending
   * values, in which case the last value is always rendered regardless.
   */
  render(...values: Array<unknown>): unknown;
}

export function until(...values: Array<unknown>): DirectiveResult<typeof UntilDirective>;

export type { UntilDirective };
