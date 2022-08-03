// @ts-nocheck
import { html, render } from 'lit-html';
import { hydrateOrRender } from '../../src/hydrate.js';
import { tests } from '../tests.js';

describe('hydrate', () => {
  const only = tests.filter(({ only }) => only);
  /** @type { HTMLDivElement } */
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.hidden = true;
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  for (let { title, template, metadata, result, skip } of only.length ? only : tests) {
    const fullTitle = `${title}`;

    if (skip) {
      it.skip(fullTitle);
    } else if (metadata) {
      it(fullTitle, async () => {
        if (typeof template === 'function') {
          template = template(html);
        }
        container.innerHTML = result;
        // Evaluate template with lit-html's `html` tag
        template = eval(template);
        hydrateOrRender(template, container);
        // Hydrate once, then render
        hydrateOrRender(template, container);
        const rendered = container.innerHTML.replace(/=""/g, '');
        if (rendered !== result) {
          console.log(`${title}:\n${result}\n${rendered}`);
        }
      });
    }
  }

  it.skip('hydration error clears nodes and renders', () => {
    container.innerHTML = `<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part--><!--lit-part-->1<!--/lit-part--><!--lit-part-->2<!--/lit-part--><!--lit-part-->3<!--/lit-part--><!--/lit-part--></div><!--/lit-part-->`;
    const template = html`<div>${[1, 2]}</div>`;
    hydrateOrRender(template, container);
    const rendered = container.innerHTML;
    if (
      !rendered.startsWith('<!----><div><!--?lit$') &&
      !rendered.endsWith('--><!---->1<!----><!---->2<!----></div>')
    ) {
      throw Error(`unexpected rendered output: ${rendered}`);
    }
  });
});
