import { AsyncDirective } from 'lit-html/async-directive';
import { DirectiveResult } from 'lit-html/directive';

class AsyncReplaceDirective extends AsyncDirective {
  /**
   * Server render "value" asynchronously, rendering the first iterated value before completing
   */
  render<T>(value: AsyncIterable<T>, mapper?: (value: T, index?: number) => unknown): Promise<unknown>;
}

export function asyncReplace(
  value: AsyncIterable<unknown>,
  mapper?: (value: unknown, index?: number) => unknown,
): DirectiveResult<typeof AsyncReplaceDirective>;

export type { AsyncReplaceDirective };
