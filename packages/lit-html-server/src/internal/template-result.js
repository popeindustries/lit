/** @type { Map<string, TemplateResult> } */
const templateResultCache = new Map();

/**
 * Convert `string` to fake TemplateResult.
 * Fake instances are cached to prevent growing the `templateCache` in './template-instance.js'
 * @param { string } string
 */
export function getFakeTemplateResult(string) {
  let templateResult = templateResultCache.get(string);

  if (templateResult === undefined) {
    /** @type { Array<string> & { raw?: Array<string> }} */
    const fakeStrings = [string];
    fakeStrings.raw = fakeStrings;
    const strings = /** @type { TemplateStringsArray } */ (fakeStrings);

    templateResult = /** @type { TemplateResult } */ ({
      _$litType$: 1,
      strings,
      values: [],
    });
    templateResultCache.set(string, templateResult);
  }

  return templateResult;
}
