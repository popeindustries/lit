/**
 * Convert `string` to fake TemplateResult
 * @param { string } string
 */
export function getFakeTemplateResult(string) {
  /** @type { Array<string> & { raw?: Array<string> }} */
  const fakeStrings = [string];
  fakeStrings.raw = fakeStrings;
  const strings = /** @type { TemplateStringsArray } */ (fakeStrings);

  return /** @type { TemplateResult } */ ({
    _$litType$: 1,
    strings,
    values: [],
  });
}
