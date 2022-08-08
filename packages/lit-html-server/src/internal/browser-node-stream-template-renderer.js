/**
 * Factory for NodeStreamTemplateRenderer instances.
 * Not supported in browser environments
 * @param { TemplateInstance } result - a template result returned from call to "html`...`"
 * @param { InternalRenderOptions } [options]
 */
export function nodeStreamTemplateRenderer(result, options) {
  throw Error('not supported in browser environments. Try `renderToWebStream()` instead');
}
