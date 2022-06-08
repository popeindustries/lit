import { directive, PartType } from 'lit-html/directive.js';
import { AsyncDirective } from 'lit-html/async-directive.js';

/**
 * @template T
 */
class AsyncAppendDirective extends AsyncDirective {
  /**
   * Constructor
   * @param { import('lit-html/directive').PartInfo } partInfo
   */
  constructor(partInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.CHILD) {
      throw new Error('asyncAppend can only be used in child expressions');
    }
  }

  /**
   * Server render "value" asynchronously, appending items until the iterator has completed
   * @param { AsyncIterable<T> } value
   * @param { (value: T, index?: number) => unknown } mapper
   */
  render(value, mapper) {
    const val = /** @type { AsyncIterableIterator<T> } */ (value);
    const map = /** @type { (value: T, index: number) => unknown } */ (mapper);

    if (mapper !== undefined) {
      // @ts-ignore
      value = createMappedAsyncIterable(val, map);
    }

    return value;
  }
}

export const asyncAppend = directive(AsyncAppendDirective);

/**
 * Create new asyncIterator from "asuncIterable" that maps results with "mapper"
 * @template T
 * @param { AsyncIterableIterator<T> } asyncIterable
 * @param { (value: T, index: number) => unknown } mapper
 */
async function* createMappedAsyncIterable(asyncIterable, mapper) {
  let i = 0;

  for await (const item of asyncIterable) {
    yield mapper(item, i++);
  }
}
