import { isArray, isAsyncIterator, isBuffer, isPromise, isTemplateResult } from '../src/internal/is.js';
import { Buffer } from 'buffer';

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
 * @param { RenderOptions } [options]
 */
export function readTemplateResult(result, options) {
  let buffer = EMPTY_STRING_BUFFER;
  let chunk;
  /** @type { Array<Buffer> | undefined } */
  let chunks;

  while ((chunk = result.readChunk(options)) !== null) {
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
    return chunks.length > 1 ? chunks : chunks[0];
  }

  return buffer;
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
