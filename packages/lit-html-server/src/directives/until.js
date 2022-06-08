import { AsyncDirective } from 'lit-html/async-directive.js';
import { directive } from 'lit-html/directive.js';

class UntilDirective extends AsyncDirective {
  /**
   * Render one of a series of values, including Promises, in priority order.
   * Not possible to render more than once in a server context, so primitive
   * sync values are prioritised over async, unless there are no more pending
   * values, in which case the last value is always rendered regardless.
   * @param { ...unknown } values
   */
  render(...values) {
    for (let i = 0, n = values.length; i < n; i++) {
      const value = values[i];

      // Render sync values immediately,
      // or last value (async included) if no more values pending
      if (isPrimitive(value) || i === n - 1) {
        return value;
      }
    }
  }
}

export const until = directive(UntilDirective);

/**
 * Determine if "value" is a primitive
 * @param { unknown } value
 * @returns { value is null|string|boolean|number }
 */
function isPrimitive(value) {
  const type = typeof value;
  return value === null || !(type === 'object' || type === 'function');
}
