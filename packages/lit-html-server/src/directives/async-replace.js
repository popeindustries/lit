import { AsyncDirective } from '@popeindustries/lit-html/async-directive.js';
import { directive } from '@popeindustries/lit-html/directive.js';

/**
 * @template T
 */
class AsyncReplaceDirective extends AsyncDirective {
  /**
   * Server render "value" asynchronously, rendering the first iterated value before completing
   * @param { AsyncIterable<T> } value
   * @param { (value: T, index?: number) => unknown } mapper
   */
  render(value, mapper) {
    const val = /** @type { AsyncIterableIterator<T> } */ (value);
    const map = /** @type { (value: T, index: number) => unknown } */ (mapper);

    return val.next().then(({ value }) => {
      if (mapper !== undefined) {
        value = map(value, 0);
      }

      return value;
    });
  }
}

export const asyncReplace = directive(AsyncReplaceDirective);
