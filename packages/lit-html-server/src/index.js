import './dom-shim.js'; // Needs to be bundled as "external" in order to shim before lit-html imports
import { isTemplateResult } from './internal/is.js';
import { promiseTemplateRenderer } from './internal/promise-template-renderer.js';
import { nodeStreamTemplateRenderer } from '#node-stream-template-renderer';
import { Template } from './internal/template.js';
import { TemplateResult } from './internal/template-result.js';
import { webStreamTemplateRenderer } from './internal/web-stream-template-renderer.js';

export { noChange, nothing } from 'lit-html';
export { ElementRenderer } from './internal/element-renderer.js';

/**
 * Default templateResult factory
 * @param { unknown } value
 * @returns { TemplateResult }
 */
const DEFAULT_TEMPLATE_FN = (value) => html`${value}`;

const templateCache = new Map();

/**
 * Interprets a template literal as an HTML template that can be
 * rendered as a Readable stream, string, or Buffer.
 * @param { TemplateStringsArray } strings
 * @param  { ...unknown } values
 * @returns { TemplateResult }
 */
export function html(strings, ...values) {
  const template = getTemplate(strings);
  return new TemplateResult(template, values);
}

export { html as svg };

/**
 * Retrieve `Template` instance
 * @param { TemplateStringsArray } strings
 * @returns { Template }
 */
function getTemplate(strings) {
  let template = templateCache.get(strings);

  if (template === undefined) {
    template = new Template(strings);
    templateCache.set(strings, template);
  }

  return template;
}

/**
 * Render a template result to a Node Readable stream
 * @param { unknown } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { import('stream').Readable }
 */
export function renderToNodeStream(result, options) {
  return nodeStreamTemplateRenderer(getRenderResult(result), { ...options });
}

/**
 * Render a template result to a Readable stream
 * @param { unknown } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { ReadableStream }
 */
export function renderToWebStream(result, options) {
  return webStreamTemplateRenderer(getRenderResult(result), { ...options });
}

/**
 * Render a template result to a string resolving Promise.
 * @param { unknown } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { Promise<string> }
 */
export function renderToString(result, options) {
  return promiseTemplateRenderer(getRenderResult(result), false, { ...options });
}

/**
 * Render a template result to a Buffer resolving Promise.
 * @param { unknown } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { Promise<Buffer> }
 */
export function renderToBuffer(result, options) {
  return promiseTemplateRenderer(getRenderResult(result), true, { ...options });
}

/**
 * Retrieve TemplateResult for render
 * @param { unknown } result
 * @returns { TemplateResult }
 */
function getRenderResult(result) {
  const templateResult = !isTemplateResult(result)
    ? DEFAULT_TEMPLATE_FN(result)
    : /** @type { TemplateResult } */ (result);
  templateResult.root = 'light';
  return templateResult;
}
