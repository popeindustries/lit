// @ts-nocheck
import { html } from '../src/index.js';
import { html as litHtml } from 'lit';
import { render } from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';
import { partType } from '../src/internal/parts.js';
import { until } from 'lit/directives/until.js';

/**
 * @param { string } template
 */
export function getTemplates(template) {
  return [html, litHtml].map((fn) => {
    const html = fn;
    return eval(template);
  });
}

/**
 * Convert "syncIterable" to an AsyncIterable
 * @param { Iterable<unknown> } syncIterable
 * @returns { AsyncIterable<unknown> }
 */
export async function* createAsyncIterable(syncIterable) {
  for (const elem of syncIterable) {
    yield elem;
  }
}

/**
 * Convert stream to a Promise
 * @param { import('stream').Readable } stream
 * @returns { Promise<string> }
 */
export function streamAsPromise(stream) {
  return new Promise((resolve, reject) => {
    let result = '';
    stream.on('error', reject);
    stream.on('data', (chunk) => {
      result += chunk.toString();
    });
    stream.on('end', () => {
      resolve(result);
    });
  });
}

/**
 * @param { Template } template
 * @param { Array<unknown> } [values]
 */
export function templateToString(template, values) {
  const { strings, parts } = template;
  let result = '';
  let i = 0;
  for (; i < strings.length - 1; i++) {
    const string = strings[i];
    const part = parts[i];
    result += string.toString();

    if (values && part.type !== partType.METADATA) {
      const value = values.shift();
      // @ts-ignore
      result += part.value ?? part.resolveValue(value);
    } else {
      result += partTypeToName(part);
    }
  }

  result += strings[i].toString();
  return result;
}

/**
 * @param { Part } part
 */
function partTypeToName(part) {
  switch (part.type) {
    case partType.CHILD:
      return '[CHILD]';
    case partType.ATTRIBUTE:
      return '[ATTR]';
    case partType.BOOLEAN:
      return '[BOOL]';
    case partType.ELEMENT:
      return '[ELEMENT]';
    case partType.EVENT:
      return '[EVENT]';
    case partType.METADATA:
      // @ts-ignore
      return part.value.toString();
    case partType.PROPERTY:
      return '[PROPERTY]';
    default:
      return '[PART]';
  }
}

/**
 * @param { import('lit').TemplateResult } template
 */
export function renderLitTemplate(template) {
  let buffer = '';
  for (const chunk of render(template)) {
    buffer += chunk;
  }
  return buffer.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;quot;', '"').replaceAll('&quot;', '"');
}
