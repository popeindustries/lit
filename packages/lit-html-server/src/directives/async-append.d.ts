import { AsyncDirective } from 'lit-html/async-directive.js';
import { DirectiveResult } from 'lit-html/directive.js';

declare class AsyncAppendDirective extends AsyncDirective {
  /**
   * Server render "value" asynchronously, appending items until the iterator has completed
   */
  render<T>(value: AsyncIterable<T>, mapper?: (value: T, index?: number) => unknown): AsyncIterable<unknown>;
}

export function asyncAppend(
  value: AsyncIterable<unknown>,
  mapper?: (value: unknown, index?: number) => unknown,
): DirectiveResult<typeof AsyncAppendDirective>;

export type { AsyncAppendDirective };
