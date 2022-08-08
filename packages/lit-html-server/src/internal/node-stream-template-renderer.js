import { getProcessor } from './template-result-processor.js';
import { Readable } from 'node:stream';

/**
 * Factory for NodeStreamTemplateRenderer instances
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @param { InternalRenderOptions } [options]
 * @returns { Readable }
 */
export function nodeStreamTemplateRenderer(result, options) {
  return new NodeStreamTemplateRenderer(result, options);
}

/**
 * A custom `Readable` stream class for rendering a template result to a Node stream
 */
class NodeStreamTemplateRenderer extends Readable {
  /**
   * Constructor
   * @param { TemplateResult } result - a template result returned from call to "html`...`"
   * @param { InternalRenderOptions } [options]
   */
  constructor(result, options) {
    super({ autoDestroy: true });

    this.stack = [result];
    this.process = getProcessor(this, this.stack, 16384, options);
  }

  /**
   * Extend Readable.read()
   */
  _read() {
    if (this.process !== undefined) {
      this.process();
    }
  }

  /**
   * Extend Readalbe.destroy()
   * @param { Error | null } [err]
   */
  _destroy(err) {
    if (err) {
      this.emit('error', err);
    }
    this.emit('close');

    // @ts-ignore
    this.process = undefined;
    // @ts-ignore
    this.stack = undefined;
    this.removeAllListeners();
  }
}
