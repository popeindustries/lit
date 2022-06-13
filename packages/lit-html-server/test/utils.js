import { isArray, isAsyncIterator, isBuffer, isPromise, isTemplateResult } from '../src/internal/is.js';
import { Buffer } from 'buffer';
import { render } from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';
import { partType } from '../src/internal/parts.js';

const EMPTY_STRING_BUFFER = Buffer.from('');

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
 * @param { TemplateResult } result
 */
export async function readTemplateResult(result) {
  let buffer = EMPTY_STRING_BUFFER;
  let chunk;
  /** @type { Array<Buffer> | undefined } */
  let chunks;

  while ((chunk = result.readChunk({ includeRehydrationMetadata: true })) !== null) {
    if (isBuffer(chunk)) {
      buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);
    } else {
      if (chunks === undefined) {
        chunks = [];
      }
      buffer = reduce(buffer, chunks, chunk) || EMPTY_STRING_BUFFER;
    }
  }

  if (chunks !== undefined) {
    chunks.push(buffer);
    for await (const chunk of chunks) {
      buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);
    }
  }

  return buffer.toString();
}

/**
 * Commit "chunk" to string "buffer".
 * Returns new "buffer" value.
 * @param { Buffer } buffer
 * @param { Array<unknown> } chunks
 * @param { unknown } chunk
 * @returns { Buffer | undefined }
 */
function reduce(buffer, chunks, chunk) {
  if (isBuffer(chunk)) {
    return Buffer.concat([buffer, chunk], buffer.length + chunk.length);
  } else if (isTemplateResult(chunk)) {
    chunks.push(buffer, chunk);
    return EMPTY_STRING_BUFFER;
  } else if (isArray(chunk)) {
    // @ts-ignore
    return chunk.reduce((buffer, chunk) => reduce(buffer, chunks, chunk), buffer);
  } else if (isPromise(chunk) || isAsyncIterator(chunk)) {
    chunks.push(buffer, chunk);
    return EMPTY_STRING_BUFFER;
  }
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
 * @param { import('lit-html').TemplateResult } template
 */
export function renderLitTemplate(template) {
  let buffer = '';
  for (const chunk of render(template)) {
    buffer += chunk;
  }
  return buffer.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;quot;', '"').replaceAll('&quot;', '"');
}
