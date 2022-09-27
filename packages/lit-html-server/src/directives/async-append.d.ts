import { AsyncDirective } from '@popeindustries/lit-html/async-directive.js';
import { DirectiveResult } from '@popeindustries/lit-html/directive.js';

declare class AsyncAppendDirective extends AsyncDirective {
  render<T>(value: AsyncIterable<T>, mapper?: (value: T, index?: number) => unknown): AsyncIterable<unknown>;
}

/**
 * Server render "value" asynchronously, appending items until the iterator has completed
 */
export function asyncAppend(
  value: AsyncIterable<unknown>,
  mapper?: (value: unknown, index?: number) => unknown,
): DirectiveResult<typeof AsyncAppendDirective>;

export type { AsyncAppendDirective };
