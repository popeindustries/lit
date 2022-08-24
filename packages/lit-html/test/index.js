import { common, client } from '../../../tests/templates.js';
import { html as h, render } from '@popeindustries/lit-html';

const tests = [...common, ...client];

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
        template = template();
        attachResult(container, result);
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

  it('hydration error clears nodes and renders', () => {
    attachResult(
      container,
      `<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child--><!--lit-child-->1<!--/lit-child--><!--lit-child-->2<!--/lit-child--><!--lit-child-->3<!--/lit-child--><!--/lit-child--></div><!--/lit-child-->`,
    );
    const template = h`<div>${[1, 2]}</div>`;
    render(template, container);
    const rendered = container.innerHTML;
    if (
      !rendered.startsWith('<!----><div><!--?lit$') &&
      !rendered.endsWith('--><!---->1<!----><!---->2<!----></div>')
    ) {
      throw Error(`unexpected rendered output: ${rendered}`);
    }
  });
  it('event bindings are registered via hydration', () => {
    attachResult(container, `<!--lit PXcZdQFYf9E=--><button><!--lit-attr 1--></button><!--/lit-->`);
    const template = h`<button @click="${function () {
      window.clicked = true;
    }}"></button>`;
    render(template, container);
    container.firstElementChild.click();
    if (!window.clicked) {
      throw Error(`event bindings not registered`);
    }
  });
});

function attachResult(container, result) {
  const doc = new DOMParser().parseFromString(`<html><head></head><body>${result}</body></html>`, 'text/html', {
    includeShadowRoots: true,
  });
  while (doc.body.childNodes.length > 0) {
    container.appendChild(doc.body.firstChild);
  }
}
