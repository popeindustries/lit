import { html, renderToString } from '@popeindustries/lit-html-server';
import { html as litHtml, render } from 'lit-html';
// import { hydrate } from '../src/hydrate.js';
import { hydrate } from 'lit-html/experimental-hydrate.js';

describe('hydrate', () => {
  /** @type { Array<{ title: string, template: string, only?: boolean, skip?: boolean }> } */
  const tests = [
    {
      title: 'plain text',
      template: '',
    },
    {
      title: 'text value',
      template: "html`<div>${'text'}</div>`",
    },
    {
      title: 'number value',
      template: 'html`<div>${1}</div>`',
    },
    {
      title: 'boolean value',
      template: 'html`<div>${true}</div>`',
    },
    {
      title: 'null value',
      template: 'html`<div>${null}</div>`',
    },
    {
      title: 'undefined value',
      template: 'html`<div>${undefined}</div>`',
    },
    {
      title: 'array value',
      template: 'html`<div>${[1, 2, 3]}</div>`',
    },
    {
      title: 'nested array value',
      template: 'html`<div>${[1, 2, [3, [4, 5]]]}</div>`',
    },
    {
      title: 'template value',
      template: 'html`<div>some ${html`text`}</div>`',
    },
    {
      title: 'array of nested template values',
      template: 'html`<div>some ${[1, 2, 3].map((i) => html`${i}`)} text</div>`',
    },
    {
      title: 'quoted text attribute',
      template: 'html`<div a="${"text"}"></div>`',
    },
    {
      title: 'quoted array attribute',
      template: 'html`<div a="${[1,2,3]}"></div>`',
    },
    {
      title: 'unquoted text attribute',
      template: 'html`<div a=${"text"}></div>`',
    },
    {
      title: 'quoted text attribute with extra whitespace',
      template: 'html`<div a=" ${"text"} "></div>`',
    },
    {
      title: 'quoted text attribute with extra strings',
      template: 'html`<div a="some ${"text"}"></div>`',
    },
    {
      title: 'quoted text attribute with multiple strings/values',
      template: 'html`<div a="this is ${"some"} ${"text"}"></div>`',
    },
    {
      title: 'truthy boolean attribute',
      template: 'html`<div ?a="${true}"></div>`',
    },
    {
      title: 'falsey boolean attribute',
      template: 'html`<div ?a="${false}"></div>`',
    },
    {
      title: 'event attribute',
      template: 'html`<div @a="${"event"}"></div>`',
    },
    {
      title: 'property attribute',
      template: 'html`<div .a="${"event"}"></div>`',
    },
  ];
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

  for (const { title, template, skip } of only.length ? only : tests) {
    const fullTitle = `should hydrate template with ${title}`;

    if (skip) {
      it.skip(fullTitle);
    } else {
      it(fullTitle, async () => {
        const [h, l] = getTemplates(template);
        const string = await renderToString(h, { includeRehydrationMetadata: true });
        console.log(string);
        container.innerHTML = string;
        hydrate(l, container);
        render(l, container);
      });
    }
  }
});

/**
 * @param { string } template
 */
export function getTemplates(template) {
  return [html, litHtml].map((fn) => {
    const html = fn;
    return eval(template);
  });
}
