import { AsyncDirective } from 'lit-html/async-directive.js';
import { DirectiveResult } from 'lit-html/directive.js';

declare class AsyncReplaceDirective extends AsyncDirective {
  render<T>(value: AsyncIterable<T>, mapper?: (value: T, index?: number) => unknown): Promise<unknown>;
}

/**
 * Server render "value" asynchronously, rendering the first iterated value before completing
 */
export function asyncReplace(
  value: AsyncIterable<unknown>,
  mapper?: (value: unknown, index?: number) => unknown,
): DirectiveResult<typeof AsyncReplaceDirective>;

export type { AsyncReplaceDirective };
