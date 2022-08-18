// @ts-nocheck
import { html, render } from '@popeindustries/lit-html';
import { tests } from '../../../tests/templates.js';

describe('hydrate', () => {
  const only = tests.filter(({ only }) => only);
  /** @type { HTMLDivElement } */
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    // container.hidden = true;
    document.body.appendChild(container);
  });
  afterEach(() => {
    // container.remove();
  });

  for (let { title, template, metadata, result, skip } of only.length ? only : tests) {
    const fullTitle = `${title}`;

    if (skip) {
      it.skip(fullTitle);
    } else if (metadata) {
      it(fullTitle, async () => {
        template = template(html, render);
        const doc = new DOMParser().parseFromString(`<html><head></head><body>${result}</body></html>`, 'text/html', {
          includeShadowRoots: true,
        });
        while (doc.body.childNodes.length > 0) {
          container.appendChild(doc.body.firstChild);
        }
        // Hydrate once, then render
        render(template, container);
        render(template, container);
        const rendered = container.innerHTML.replace(/=""/g, '');
        result = result.replace(/ hydrate:defer/g, '');
        if (rendered !== result) {
          console.log(`${title}:\n${result}\n${rendered}`);
        }
      });
    }
  }

  it.skip('hydration error clears nodes and renders', () => {
    container.innerHTML = `<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child--><!--lit-child-->1<!--/lit-child--><!--lit-child-->2<!--/lit-child--><!--lit-child-->3<!--/lit-child--><!--/lit-child--></div><!--/lit-child-->`;
    const template = html`<div>${[1, 2]}</div>`;
    render(template, container);
    const rendered = container.innerHTML;
    if (
      !rendered.startsWith('<!----><div><!--?lit$') &&
      !rendered.endsWith('--><!---->1<!----><!---->2<!----></div>')
    ) {
      throw Error(`unexpected rendered output: ${rendered}`);
    }
  });
  it('event bindings are registered via hydration');
});
