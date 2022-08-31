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

  it('render custom element with options.hydratableWebComponents = true', async () => {
    class MyEl12 extends HTMLElement {
      render() {
        return h`<p>text</p>`;
      }
    }
    customElements.define('my-el12', MyEl12);
    const template = h`<div><my-el12></my-el12></div>`;
    const string = await renderToString(template, {
      hydratableWebComponents: true,
    });
    const result = '<div><my-el12><!--lit-attr 0--><!--lit x7og6JXjJAs=--><p>text</p><!--/lit--></my-el12></div>';
    assert.equal(string, result);
  });
  it('render LitElement with options.hydratableWebComponents = true', async () => {
    class MyEl13 extends LitElement {
      static styles = css`
        p {
          color: green;
        }
      `;
      render() {
        return h`<p>I am green!</p>`;
      }
    }
    customElements.define('my-el13', MyEl13);
    const template = h`<my-el13></my-el13>`;
    const string = await renderToString(template, {
      elementRenderers: [LitElementRenderer],
      hydratableWebComponents: true,
    });
    const result =
      '<my-el13><!--lit-attr 0--><template shadowroot="open"><style>p{color:green;}</style><!--lit ymb4EFq7aMg=--><p>I am green!</p><!--/lit--></template></my-el13>';
    assert.equal(string, result);
  });
});
