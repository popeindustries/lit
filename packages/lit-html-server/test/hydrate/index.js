// @ts-nocheck
import { html, render } from 'lit-html';
import { hydrateOrRender } from '../../src/hydrate.js';
import { tests } from '../templates.js';

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

  for (let { title, template, result, skip } of only.length ? only : tests) {
    const fullTitle = `${title}`;

    if (skip) {
      it.skip(fullTitle);
    } else {
      it(fullTitle, async () => {
        if (typeof template === 'function') {
          template = template();
        }
        container.innerHTML = result;
        // Evaluate template with lit-html's `html` tag
        template = eval(template);
        // Hydrate once, then render
        hydrateOrRender(template, container);
        hydrateOrRender(template, container);
        const rendered = container.innerHTML.replace(/=""/g, '');
        if (rendered !== result) {
          console.log(`${title}:\n${result}\n${rendered}`);
        }
      });
    }
  }
});
