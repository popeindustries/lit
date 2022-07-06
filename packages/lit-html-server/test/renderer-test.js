// @ts-nocheck
import { getTemplates, renderLitTemplate } from './utils.js';
import { renderToStream, renderToString } from '../src/index.js';
import assert from 'node:assert';
import { streamAsPromise } from './utils.js';

describe('Render', () => {
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
      title: 'Promise value',
      template: "html`<div>${Promise.resolve('some')} text</div>`",
      result: '<!--lit-part h+ilbtUUJbo=--><div><!--lit-part-->some<!--/lit-part--> text</div><!--/lit-part-->',
    },
    {
      title: 'Promise template value',
      template: 'html`<div>${Promise.resolve(html`some`)} text</div>`',
      result:
        '<!--lit-part h+ilbtUUJbo=--><div><!--lit-part +3BZAG9vWQA=-->some<!--/lit-part--> text</div><!--/lit-part-->',
    },
    {
      skip: true,
      title: 'sync iterator value',
      template:
        "html`<div>Well ${['hello ', 'there ', 'world', [', hows ', 'it ', 'going']][Symbol.iterator]()}?</div>`",
      result:
        '<!--lit-part AB0dAcJ7zUo=--><div>Well <!--lit-part--><!--lit-part-->hello <!--/lit-part--><!--lit-part-->there <!--/lit-part--><!--lit-part-->world<!--/lit-part--><!--lit-part--><!--lit-part-->, hows <!--/lit-part--><!--lit-part-->it <!--/lit-part--><!--lit-part-->going<!--/lit-part--><!--/lit-part--><!--/lit-part-->?</div><!--/lit-part-->',
    },
    {
      title: 'array of nested template values',
      template: 'html`<div>some ${[1, 2, 3].map((i) => html`${i}`)} text</div>`',
      result:
        '<!--lit-part rQEcjeuOsoE=--><div>some <!--lit-part--><!--lit-part BRUAAAUVAAA=--><!--lit-part-->1<!--/lit-part--><!--/lit-part--><!--lit-part BRUAAAUVAAA=--><!--lit-part-->2<!--/lit-part--><!--/lit-part--><!--lit-part BRUAAAUVAAA=--><!--lit-part-->3<!--/lit-part--><!--/lit-part--><!--/lit-part--> text</div><!--/lit-part-->',
    },
    {
      skip: true,
      title: 'AsyncIterator value',
      template: "html`<div>${createAsyncIterable(['some', ' async'])} text</div>`",
      result:
        '<!--lit-part h+ilbtUUJbo=--><div><!--lit-part-->some<!--/lit-part--><!--lit-part--> async<!--/lit-part--> text</div><!--/lit-part-->',
    },
    {
      skip: true,
      title: 'AsyncIterator template value',
      template: 'html`<div>${createAsyncIterable([html`some`, html` async`])} text</div>`',
      result:
        '<!--lit-part h+ilbtUUJbo=--><div><!--lit-part +3BZAG9vWQA=-->some<!--/lit-part--><!--lit-part eDGGC741hws=--> async<!--/lit-part--> text</div><!--/lit-part-->',
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
    {
      title: 'raw text',
      template: 'html`<script ?defer="${true}">var t = true;</script>`',
      result: '<!--lit-part IVsa+r3gBKE=--><script defer><!--lit-node 0-->var t = true;</script><!--/lit-part-->',
    },
    {
      title: 'unsafeHTML directive',
      template: 'html`<div>${unsafeHTML("<span>hi</span>")}</div>`',
      result:
        '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part f/pfTVHPXqM=--><span>hi</span><!--/lit-part--></div><!--/lit-part-->',
    },
  ];
  const only = tests.filter(({ only }) => only);

  for (const { title, template, result, skip } of only.length ? only : tests) {
    const fullTitle = `should generate result with ${title}`;

    if (skip) {
      it.skip(fullTitle);
    } else {
      it(fullTitle, async () => {
        const [h, l] = getTemplates(template);
        const string = await renderToString(h, { includeRehydrationMetadata: true });
        const stream = await streamAsPromise(renderToStream(h, { includeRehydrationMetadata: true }));
        const lit = renderLitTemplate(l);
        if (string !== lit) {
          console.warn(`not valid with lit ssr: \n  ${string}\n  ${lit}`);
        }
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
