import './dom-shim.js'; // Needs to be bundled as "external" in order to shim before lit-html imports
import { getTemplateInstance } from './internal/template-instance.js';
import { html } from '@popeindustries/lit-html';
import { isTemplateResult } from './internal/is.js';
import { nodeStreamTemplateRenderer } from '#node-stream-template-renderer';
import { promiseTemplateRenderer } from './internal/promise-template-renderer.js';
import { webStreamTemplateRenderer } from './internal/web-stream-template-renderer.js';

export { html, noChange, nothing, svg } from '@popeindustries/lit-html';
// Secret export for use by `hydratable` directive
export { getTemplateInstance as __internalGetTemplateInstance__ } from './internal/template-instance.js';

/**
 * Render a template result to a Node Readable stream
 * @param { unknown } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { import('stream').Readable }
 */
export function renderToNodeStream(result, options) {
  return nodeStreamTemplateRenderer(getRootTemplateInstance(result), { ...options, customElementStack: [] });
}

/**
 * Render a template result to a Readable stream
 * @param { unknown } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { ReadableStream }
 */
export function renderToWebStream(result, options) {
  return webStreamTemplateRenderer(getRootTemplateInstance(result), { ...options, customElementStack: [] });
}

/**
 * Render a template result to a string resolving Promise.
 * @param { unknown } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { Promise<string> }
 */
export function renderToString(result, options) {
  return promiseTemplateRenderer(getRootTemplateInstance(result), false, { ...options, customElementStack: [] });
}

/**
 * Render a template result to a Buffer resolving Promise.
 * @param { unknown } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { Promise<Buffer> }
 */
export function renderToBuffer(result, options) {
  return promiseTemplateRenderer(getRootTemplateInstance(result), true, { ...options, customElementStack: [] });
}

/**
 * Retrieve root TemplateInstance for render
 * @param { unknown } result
 * @returns { TemplateInstance }
 */
function getRootTemplateInstance(result) {
  if (!isTemplateResult(result)) {
    result = html`${result}`;
  }
  const instance = getTemplateInstance(/** @type { TemplateResult } */ (result));
  instance.setAsRoot('light');
  return instance;
}
