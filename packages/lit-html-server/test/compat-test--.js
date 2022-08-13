// @ts-nocheck
import { getTemplates, renderLitTemplate } from './utils.js';
import assert from 'node:assert';
import { renderToString } from '../src/lit-html-server.js';

describe.skip('Compatibility', () => {
  const tests = [
    {
      title: 'plain text',
      template: 'html`<div>text</div>`',
      result: '<!--lit-child pxc8m9UUJbo=--><div>text</div><!--/lit-child-->',
    },
    {
      title: 'text value',
      template: "html`<div>${'text'}</div>`",
      result: '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child-->text<!--/lit-child--></div><!--/lit-child-->',
    },
    {
      title: 'number value',
      template: 'html`<div>${1}</div>`',
      result: '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child-->1<!--/lit-child--></div><!--/lit-child-->',
    },
    {
      title: 'boolean value',
      template: 'html`<div>${true}</div>`',
      result: '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child-->true<!--/lit-child--></div><!--/lit-child-->',
    },
    {
      title: 'null value',
      template: 'html`<div>${null}</div>`',
      result: '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child--><!--/lit-child--></div><!--/lit-child-->',
    },
    {
      title: 'undefined value',
      template: 'html`<div>${undefined}</div>`',
      result: '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child--><!--/lit-child--></div><!--/lit-child-->',
    },
    {
      title: 'array value',
      template: 'html`<div>${[1, 2, 3]}</div>`',
      result:
        '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child--><!--lit-child-->1<!--/lit-child--><!--lit-child-->2<!--/lit-child--><!--lit-child-->3<!--/lit-child--><!--/lit-child--></div><!--/lit-child-->',
    },
    {
      title: 'nested array value',
      template: 'html`<div>${[1, 2, [3, [4, 5]]]}</div>`',
      result:
        '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child--><!--lit-child-->1<!--/lit-child--><!--lit-child-->2<!--/lit-child--><!--lit-child--><!--lit-child-->3<!--/lit-child--><!--lit-child--><!--lit-child-->4<!--/lit-child--><!--lit-child-->5<!--/lit-child--><!--/lit-child--><!--/lit-child--><!--/lit-child--></div><!--/lit-child-->',
    },
    {
      title: 'template value',
      template: 'html`<div>some ${html`text`}</div>`',
      result:
        '<!--lit-child qjs5mhF6hQ0=--><div>some <!--lit-child iW9ZALRtWQA=-->text<!--/lit-child--></div><!--/lit-child-->',
    },
    {
      title: 'array of nested template values',
      template: 'html`<div>some ${[1, 2, 3].map((i) => html`${i}`)} text</div>`',
      result:
        '<!--lit-child rQEcjeuOsoE=--><div>some <!--lit-child--><!--lit-child BRUAAAUVAAA=--><!--lit-child-->1<!--/lit-child--><!--/lit-child--><!--lit-child BRUAAAUVAAA=--><!--lit-child-->2<!--/lit-child--><!--/lit-child--><!--lit-child BRUAAAUVAAA=--><!--lit-child-->3<!--/lit-child--><!--/lit-child--><!--/lit-child--> text</div><!--/lit-child-->',
    },
    {
      title: 'quoted text attribute',
      template: 'html`<div a="${"text"}"></div>`',
      result: '<!--lit-child gYgzm5LkVDI=--><div a="text"><!--lit-attr 0--></div><!--/lit-child-->',
    },
    {
      title: 'quoted array attribute',
      template: 'html`<div a="${[1,2,3]}"></div>`',
      result: '<!--lit-child gYgzm5LkVDI=--><div a="1,2,3"><!--lit-attr 0--></div><!--/lit-child-->',
    },
    {
      title: 'unquoted text attribute',
      template: 'html`<div a=${"text"}></div>`',
      result: '<!--lit-child K+c1m3iKv0M=--><div a="text"><!--lit-attr 0--></div><!--/lit-child-->',
    },
    {
      title: 'quoted text attribute with extra whitespace',
      template: 'html`<div a=" ${"text"} "></div>`',
      result: '<!--lit-child K8pqMbhSWzI=--><div a=" text "><!--lit-attr 0--></div><!--/lit-child-->',
    },
    {
      title: 'quoted text attribute with extra strings',
      template: 'html`<div a="some ${"text"}"></div>`',
      result: '<!--lit-child f8xfJ7hWEaU=--><div a="some text"><!--lit-attr 0--></div><!--/lit-child-->',
    },
    {
      title: 'quoted text attribute with multiple strings/values',
      template: 'html`<div a="this is ${"some"} ${"text"}"></div>`',
      result: '<!--lit-child D6xN2GCdvaE=--><div a="this is some text"><!--lit-attr 0--></div><!--/lit-child-->',
    },
    {
      title: 'truthy boolean attribute',
      template: 'html`<div ?a="${true}"></div>`',
      result: '<!--lit-child X7msddNbKag=--><div a><!--lit-attr 0--></div><!--/lit-child-->',
    },
    {
      title: 'falsey boolean attribute',
      template: 'html`<div ?a="${false}"></div>`',
      result: '<!--lit-child X7msddNbKag=--><div ><!--lit-attr 0--></div><!--/lit-child-->',
    },
    {
      title: 'element attribute',
      template: 'html`<div ${()=>{}}></div>`',
      result: '<!--lit-child liPcn9lj0Ak=--><div ><!--lit-attr 0--></div><!--/lit-child-->',
    },
    {
      title: 'event attribute',
      template: 'html`<div @a="${"event"}"></div>`',
      result: '<!--lit-child X7msdUw8k34=--><div ><!--lit-attr 0--></div><!--/lit-child-->',
    },
    {
      title: 'property attribute',
      template: 'html`<div .a="${"event"}"></div>`',
      result: '<!--lit-child X7msdWIx9Mg=--><div ><!--lit-attr 0--></div><!--/lit-child-->',
    },
    // {
    //   title: 'raw text',
    //   template: 'html`<script ?defer="${true}">var t = true;</script>`',
    //   result: '<!--lit-child IVsa+r3gBKE=--><script defer><!--lit-attr 0-->var t = true;</script><!--/lit-child-->',
    // },
    {
      title: 'unsafeHTML directive',
      template: 'html`<div>${unsafeHTML("<span>hi</span>")}</div>`',
      result:
        '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child f/pfTVHPXqM=--><span>hi</span><!--/lit-child--></div><!--/lit-child-->',
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
        const string = await renderToString(h, { includeHydrationMetadata: true });
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
