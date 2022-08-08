export { noChange, nothing } from 'lit-html';

/**
 * Interprets a template literal as an HTML template that can be
 * rendered as a stream, string, or Buffer
 */
export const html: (strings: TemplateStringsArray, ...values: Array<unknown>) => TemplateInstance;
/**
 * Interprets a template literal as a SVG template that can be
 * rendered as a stream, string, or Buffer
 */
export const svg: (strings: TemplateStringsArray, ...values: Array<unknown>) => TemplateInstance;
/**
 * Renders a value, usually a `TemplateResult` returned from using the `html` tagged template literal, to a Buffer resolving Promise
 */
export function renderToBuffer(value: unknown, options?: RenderOptions): Promise<Buffer>;
/**
 * Renders a value, usually a `TemplateResult` returned from using the `html` tagged template literal, to a Readable stream
 */
export function renderToNodeStream(value: unknown, options?: RenderOptions): import('stream').Readable;
/**
 * Renders a value, usually a `TemplateResult` returned from using the `html` tagged template literal, to a string resolving Promise
 */
export function renderToString(value: unknown, options?: RenderOptions): Promise<string>;
/**
 * Renders a value, usually a `TemplateResult` returned from using the `html` tagged template literal, to a Readable stream
 */
export function renderToWebStream(value: unknown, options?: RenderOptions): ReadableStream;
