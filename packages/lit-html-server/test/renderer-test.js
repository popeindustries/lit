import { common, server } from '../../../tests/templates.js';
import { css, LitElement } from '@popeindustries/lit-element/lit-element.js';
import { html as h, renderToNodeStream, renderToString } from '../src/lit-html-server.js';
import assert from 'node:assert';
import { LitElementRenderer } from '@popeindustries/lit-element/lit-element-renderer.js';
import { streamAsPromise } from './utils.js';

const tests = [...common, ...server];

describe('Render', () => {
  const only = tests.filter(({ only }) => only);

  for (const test of only.length ? only : tests) {
    let { error, title, template, result, skip } = test;
    const includeHydrationMetadata = !server.includes(test);
    const fullTitle = `${title}`;

    if (skip) {
      it.skip(fullTitle);
    } else {
      it(fullTitle, async () => {
        customElements._registry.clear();
        let string, stream, t;
        try {
          t = template();
          string = await renderToString(t, {
            includeHydrationMetadata,
            elementRenderers: [LitElementRenderer],
          });
          assert.equal(string, result);
        } catch (err) {
          if (error) {
            assert.equal(error, err.message);
          } else {
            throw err;
          }
        }
        customElements._registry.clear();
        try {
          t = template = template();
          stream = await streamAsPromise(
            renderToNodeStream(t, { includeHydrationMetadata, elementRenderers: [LitElementRenderer] }),
          );
          assert.equal(string, stream);
        } catch (err) {
          if (error) {
            assert.equal(error, err.message);
          } else {
            throw err;
          }
        }
      });
    }
  }
});
