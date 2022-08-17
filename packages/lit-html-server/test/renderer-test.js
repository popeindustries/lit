// @ts-nocheck
import { renderToNodeStream, renderToString } from '../src/lit-html-server.js';
import assert from 'node:assert';
import { LitElementRenderer } from '@popeindustries/lit-element/lit-element-renderer.js';
import { streamAsPromise } from './utils.js';
import { tests } from '../../../tests/tests.js';

describe.only('Render', () => {
  const only = tests.filter(({ only }) => only);

  for (let { title, template, metadata, result, skip } of only.length ? only : tests) {
    const fullTitle = `${title}`;

    if (skip) {
      it.skip(fullTitle);
    } else {
      it(fullTitle, async () => {
        customElements._registry.clear();
        let t = template();
        const string = await renderToString(t, {
          includeHydrationMetadata: metadata,
          elementRenderers: [LitElementRenderer],
        });
        customElements._registry.clear();
        t = template = template();
        const stream = await streamAsPromise(
          renderToNodeStream(t, { includeHydrationMetadata: metadata, elementRenderers: [LitElementRenderer] }),
        );
        assert.equal(string, stream);
        assert.equal(string, result);
      });
    }
  }

  /**describe.skip('text', () => {
    it('should not render a template with Promise errors', async () => {
      const result = () => h`${Promise.reject(Error('errored!'))}`;
      try {
        const html = await renderToString(result());
        assert(html).to.not.exist;
      } catch (err) {
        assert(err).to.have.property('message', 'errored!');
      }
      try {
        const html = await streamAsPromise(renderToStream(result()));
        assert(html).to.not.exist;
      } catch (err) {
        assert(err).to.have.property('message', 'errored!');
      }
    });
    it('should not render a template with Promises that throw errors', async () => {
      const result = () =>
        h`${new Promise(() => {
          throw Error('errored!');
        })}`;
      try {
        const html = await renderToString(result());
        assert(html).to.not.exist;
      } catch (err) {
        assert(err).to.have.property('message', 'errored!');
      }
      try {
        const html = await streamAsPromise(renderToStream(result()));
        assert(html).to.not.exist;
      } catch (err) {
        assert(err).to.have.property('message', 'errored!');
      }
    });
    it('should render a template with deeply nested sync/async templates', async () => {
      const data = { title: 'title', body: 'this is body text' };
      const nestedVeryDeep = async () => ['and ', "don't ", 'forget ', ['this']];
      const nestedDeep = async () => h`<div>this too ${nestedVeryDeep()}</div>`;
      const nested = async (body) => h`<div>${body} ${nestedDeep()}</div>`;
      const result = () => h`<main><h1>${data.title}</h1>${nested(data.body)}</main>`;
      const expected =
        '<main><h1>title</h1><div>this is body text <div>this too and don&#x27;t forget this</div></div></main>';
      assert((await renderToString(result())) === expected);
      assert((await streamAsPromise(renderToStream(result()))) === expected);
    });
  });

*/
});
