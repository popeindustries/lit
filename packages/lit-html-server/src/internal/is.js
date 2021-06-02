import { Buffer } from 'buffer';
import { PartType } from 'lit-html/directive.js';

export { isDirectiveResult as isDirective } from 'lit-html/directive-helpers.js';

/**
 * Determine if "part" is an AttributePart
 *
 * @param { unknown } part
 * @returns { part is AttributePart }
 */
export function isAttributePart(part) {
  return part != null && /** @type { Part } */ (part).type !== PartType.CHILD;
}

/**
 * Determine if "value" is a primitive
 *
 * @param { unknown } value
 * @returns { value is null|string|boolean|number }
 */
export function isPrimitive(value) {
  const type = typeof value;
  return value === null || !(type === 'object' || type === 'function');
}

/**
 * Determine whether "result" is a TemplateResult
 *
 * @param { unknown } result
 * @returns { result is TemplateResult }
 */
export function isTemplateResult(result) {
  const r = /** @type { TemplateResult } */ (result);
  return result != null && typeof r.template !== 'undefined' && typeof r.values !== 'undefined';
}

/**
 * Determine if "promise" is a Promise instance
 *
 * @param { unknown } promise
 * @returns { promise is Promise<unknown> }
 */
export function isPromise(promise) {
  return promise != null && /** @type { Promise<unknown> } */ (promise).then != null;
}

/**
 * Determine if "iterator" is an synchronous iterator
 *
 * @param { unknown } iterator
 * @returns { iterator is IterableIterator<unknown> }
 */
export function isSyncIterator(iterator) {
  return (
    iterator != null &&
    // Ignore strings (which are also iterable)
    typeof iterator !== 'string' &&
    typeof (/** @type { IterableIterator<unknown> } */ (iterator)[Symbol.iterator]) === 'function'
  );
}

/**
 * Determine if "iterator" is an asynchronous iterator
 *
 * @param { unknown } iterator
 * @returns { iterator is AsyncIterable<unknown> }
 */
export function isAsyncIterator(iterator) {
  return (
    iterator != null && typeof (/** @type { AsyncIterable<unknown> } */ (iterator)[Symbol.asyncIterator]) === 'function'
  );
}

/**
 * Determine if "result" is an iterator result object
 *
 * @param { unknown } result
 * @returns { result is IteratorResult<unknown, unknown> }
 */
export function isIteratorResult(result) {
  // @ts-ignore
  return result != null && typeof result === 'object' && 'value' in result && 'done' in result;
}

/**
 * Determine if "value" is an object
 *
 * @param { unknown } value
 * @returns { value is object }
 */
export function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Determine if "value" is a Buffer
 *
 * @param { unknown } value
 * @returns { value is Buffer }
 */
export function isBuffer(value) {
  return Buffer.isBuffer(value);
}

/**
 * Determine if "value" is an Array
 *
 * @param { unknown } value
 * @returns { value is Array<unknown> }
 */
export function isArray(value) {
  return Array.isArray(value);
}
