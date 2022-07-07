// @ts-nocheck
import { getTemplates, renderLitTemplate } from './utils.js';
import assert from 'node:assert';
import { renderToString } from '../src/index.js';

describe('Compatibility', () => {
  const tests = [
    {
      title: 'plain text',
      template: 'html`<div>text</div>`',
      result: '<!--lit-part pxc8m9UUJbo=--><div>text</div><!--/lit-part-->',
    },
    {
      title: 'text value',
      template: "html`<div>${'text'}</div>`",
      result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part-->text<!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'number value',
      template: 'html`<div>${1}</div>`',
      result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part-->1<!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'boolean value',
      template: 'html`<div>${true}</div>`',
      result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part-->true<!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'null value',
      template: 'html`<div>${null}</div>`',
      result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part--><!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'undefined value',
      template: 'html`<div>${undefined}</div>`',
      result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part--><!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'array value',
      template: 'html`<div>${[1, 2, 3]}</div>`',
      result:
        '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part--><!--lit-part-->1<!--/lit-part--><!--lit-part-->2<!--/lit-part--><!--lit-part-->3<!--/lit-part--><!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'nested array value',
      template: 'html`<div>${[1, 2, [3, [4, 5]]]}</div>`',
      result:
        '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part--><!--lit-part-->1<!--/lit-part--><!--lit-part-->2<!--/lit-part--><!--lit-part--><!--lit-part-->3<!--/lit-part--><!--lit-part--><!--lit-part-->4<!--/lit-part--><!--lit-part-->5<!--/lit-part--><!--/lit-part--><!--/lit-part--><!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'template value',
      template: 'html`<div>some ${html`text`}</div>`',
      result:
        '<!--lit-part qjs5mhF6hQ0=--><div>some <!--lit-part iW9ZALRtWQA=-->text<!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'array of nested template values',
      template: 'html`<div>some ${[1, 2, 3].map((i) => html`${i}`)} text</div>`',
      result:
        '<!--lit-part rQEcjeuOsoE=--><div>some <!--lit-part--><!--lit-part BRUAAAUVAAA=--><!--lit-part-->1<!--/lit-part--><!--/lit-part--><!--lit-part BRUAAAUVAAA=--><!--lit-part-->2<!--/lit-part--><!--/lit-part--><!--lit-part BRUAAAUVAAA=--><!--lit-part-->3<!--/lit-part--><!--/lit-part--><!--/lit-part--> text</div><!--/lit-part-->',
    },
    {
      title: 'quoted text attribute',
      template: 'html`<div a="${"text"}"></div>`',
      result: '<!--lit-part gYgzm5LkVDI=--><div a="text"><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'quoted array attribute',
      template: 'html`<div a="${[1,2,3]}"></div>`',
      result: '<!--lit-part gYgzm5LkVDI=--><div a="1,2,3"><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'unquoted text attribute',
      template: 'html`<div a=${"text"}></div>`',
      result: '<!--lit-part K+c1m3iKv0M=--><div a="text"><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'quoted text attribute with extra whitespace',
      template: 'html`<div a=" ${"text"} "></div>`',
      result: '<!--lit-part K8pqMbhSWzI=--><div a=" text "><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'quoted text attribute with extra strings',
      template: 'html`<div a="some ${"text"}"></div>`',
      result: '<!--lit-part f8xfJ7hWEaU=--><div a="some text"><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'quoted text attribute with multiple strings/values',
      template: 'html`<div a="this is ${"some"} ${"text"}"></div>`',
      result: '<!--lit-part D6xN2GCdvaE=--><div a="this is some text"><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'truthy boolean attribute',
      template: 'html`<div ?a="${true}"></div>`',
      result: '<!--lit-part X7msddNbKag=--><div a><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'falsey boolean attribute',
      template: 'html`<div ?a="${false}"></div>`',
      result: '<!--lit-part X7msddNbKag=--><div ><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'element attribute',
      template: 'html`<div ${()=>{}}></div>`',
      result: '<!--lit-part liPcn9lj0Ak=--><div ><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'event attribute',
      template: 'html`<div @a="${"event"}"></div>`',
      result: '<!--lit-part X7msdUw8k34=--><div ><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'property attribute',
      template: 'html`<div .a="${"event"}"></div>`',
      result: '<!--lit-part X7msdWIx9Mg=--><div ><!--lit-node 0--></div><!--/lit-part-->',
    },
    // {
    //   title: 'raw text',
    //   template: 'html`<script ?defer="${true}">var t = true;</script>`',
    //   result: '<!--lit-part IVsa+r3gBKE=--><script defer><!--lit-node 0-->var t = true;</script><!--/lit-part-->',
    // },
    {
      title: 'unsafeHTML directive',
      template: 'html`<div>${unsafeHTML("<span>hi</span>")}</div>`',
      result:
        '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part f/pfTVHPXqM=--><span>hi</span><!--/lit-part--></div><!--/lit-part-->',
    },
  ];
  const only = tests.filter(({ only }) => only);

  for (const { title, template, result, skip } of only.length ? only : tests) {
    const fullTitle = `${title}`;

    if (skip) {
      it.skip(fullTitle);
    } else {
      it(fullTitle, async () => {
        const [h, l] = getTemplates(template);
        const string = await renderToString(h, { includeRehydrationMetadata: true });
        const lit = renderLitTemplate(l);
        try {
          assert.equal(string, result);
        } catch (err) {
          console.error(`not valid with lit ssr: \n  ${string}\n  ${lit}`);
          throw err;
        }
      });
    }
  }
});
