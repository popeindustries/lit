import { Buffer } from '#buffer';

/**
 * Generate hash from template "strings".
 * Unable to use version imported from lit-html because of reliance on global `btoa`
 * (`btoa` is now a global in Node, but should be avoided at all costs),
 * so copied and modified here instead.
 * @see https://github.com/lit/lit/blob/72877fd1de43ccdd579778d5df407e960cb64b03/packages/lit-html/src/experimental-hydrate.ts#L423
 * @param { TemplateStringsArray } strings
 */
export function digestForTemplateStrings(strings) {
  const digestSize = 2;
  const hashes = new Uint32Array(digestSize).fill(5381);

  for (const s of strings) {
    for (let i = 0; i < s.length; i++) {
      hashes[i % digestSize] = (hashes[i % digestSize] * 33) ^ s.charCodeAt(i);
    }
  }

  return Buffer.from(String.fromCharCode(...new Uint8Array(hashes.buffer)), 'binary').toString('base64');
}
