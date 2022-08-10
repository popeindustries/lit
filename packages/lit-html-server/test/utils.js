import { partType } from '../src/internal/parts.js';
import { render } from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';

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
 * @param { import('lit-html').TemplateResult } template
 */
export function renderLitTemplate(template) {
  let buffer = '';
  for (const chunk of render(template)) {
    buffer += chunk;
  }
  return buffer.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;quot;', '"').replaceAll('&quot;', '"');
}

/**
 * @param { Template } template
 */
export function templateToString(template) {
  const { strings, parts } = template;
  let result = '';
  let i = 0;
  for (; i < strings.length - 1; i++) {
    const string = strings[i];
    const part = parts[i];
    result += string.toString();
    result += partTypeToName(part);
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
    case partType.METADATA:
      return '[METADATA]';
    case partType.CUSTOMELEMENT:
      return '[CUSTOM-ELEMENT]';
  }
}
