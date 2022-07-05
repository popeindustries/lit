export { noChange, nothing } from 'lit-html';

/**
 * Interprets a template literal as an HTML template that can be
 * rendered as a Readable stream, string, or Buffer
 */
export const html: (strings: TemplateStringsArray, ...values: Array<unknown>) => TemplateResult;
/**
 * Interprets a template literal as a SVG template that can be
 * rendered as a Readable stream, string, or Buffer
 */
export const svg: (strings: TemplateStringsArray, ...values: Array<unknown>) => TemplateResult;
/**
 * Renders a value, usually a lit-html TemplateResult, to a string resolving Promise
 */
export function renderToString(value: unknown, options?: RenderOptions): Promise<string>;
/**
 * Renders a value, usually a lit-html TemplateResult, to a Readable stream
 */
export function renderToStream(value: unknown, options?: RenderOptions): import('stream').Readable;
/**
 * Renders a value, usually a lit-html TemplateResult, to a Buffer resolving Promise
 */
export function renderToBuffer(value: unknown, options?: RenderOptions): Promise<Buffer>;
