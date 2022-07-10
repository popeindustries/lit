// @ts-nocheck
import { html as h, renderToStream, renderToString } from '../src/index.js';
import { createAsyncIterable, streamAsPromise } from './utils.js';
import assert from 'node:assert';

describe('Render', () => {
  beforeEach(() => {
    customElements._registry.clear();
  });

  const tests = [
    {
      title: 'plain text',
      template: h`<div>text</div>`,
      result: '<!--lit-part pxc8m9UUJbo=--><div>text</div><!--/lit-part-->',
    },
    {
      title: 'text child',
      template: h`<div>${'text'}</div>`,
      result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part-->text<!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'number child',
      template: h`<div>${1}</div>`,
      result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part-->1<!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'boolean child',
      template: h`<div>${true}</div>`,
      result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part-->true<!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'null child',
      template: h`<div>${null}</div>`,
      result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part--><!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'undefined child',
      template: h`<div>${undefined}</div>`,
      result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part--><!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'array child',
      template: h`<div>${[1, 2, 3]}</div>`,
      result:
        '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part--><!--lit-part-->1<!--/lit-part--><!--lit-part-->2<!--/lit-part--><!--lit-part-->3<!--/lit-part--><!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'nested array child',
      template: h`<div>${[1, 2, [3, [4, 5]]]}</div>`,
      result:
        '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part--><!--lit-part-->1<!--/lit-part--><!--lit-part-->2<!--/lit-part--><!--lit-part--><!--lit-part-->3<!--/lit-part--><!--lit-part--><!--lit-part-->4<!--/lit-part--><!--lit-part-->5<!--/lit-part--><!--/lit-part--><!--/lit-part--><!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'template child',
      template: h`<div>some ${h`text`}</div>`,
      result:
        '<!--lit-part qjs5mhF6hQ0=--><div>some <!--lit-part iW9ZALRtWQA=-->text<!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'Promise child',
      template: h`<div>${Promise.resolve('some')} text</div>`,
      result: '<!--lit-part h+ilbtUUJbo=--><div><!--lit-part-->some<!--/lit-part--> text</div><!--/lit-part-->',
    },
    {
      title: 'Promise template child',
      template: h`<div>${Promise.resolve(h`some`)} text</div>`,
      result:
        '<!--lit-part h+ilbtUUJbo=--><div><!--lit-part +3BZAG9vWQA=-->some<!--/lit-part--> text</div><!--/lit-part-->',
    },
    {
      skip: true,
      title: 'sync iterator child',
      template: h`<div>Well ${['hello ', 'there ', 'world', [', hows ', 'it ', 'going']][Symbol.iterator]()}?</div>`,
      result:
        '<!--lit-part AB0dAcJ7zUo=--><div>Well <!--lit-part--><!--lit-part-->hello <!--/lit-part--><!--lit-part-->there <!--/lit-part--><!--lit-part-->world<!--/lit-part--><!--lit-part--><!--lit-part-->, hows <!--/lit-part--><!--lit-part-->it <!--/lit-part--><!--lit-part-->going<!--/lit-part--><!--/lit-part--><!--/lit-part-->?</div><!--/lit-part-->',
    },
    {
      title: 'array of nested child templates',
      template: h`<div>some ${[1, 2, 3].map((i) => h`${i}`)} text</div>`,
      result:
        '<!--lit-part rQEcjeuOsoE=--><div>some <!--lit-part--><!--lit-part BRUAAAUVAAA=--><!--lit-part-->1<!--/lit-part--><!--/lit-part--><!--lit-part BRUAAAUVAAA=--><!--lit-part-->2<!--/lit-part--><!--/lit-part--><!--lit-part BRUAAAUVAAA=--><!--lit-part-->3<!--/lit-part--><!--/lit-part--><!--/lit-part--> text</div><!--/lit-part-->',
    },
    {
      skip: true,
      title: 'AsyncIterator child',
      template: h`<div>${createAsyncIterable(['some', ' async'])} text</div>`,
      result:
        '<!--lit-part h+ilbtUUJbo=--><div><!--lit-part-->some<!--/lit-part--><!--lit-part--> async<!--/lit-part--> text</div><!--/lit-part-->',
    },
    {
      skip: true,
      title: 'AsyncIterator child templates',
      template: h`<div>${createAsyncIterable([h`some`, h` async`])} text</div>`,
      result:
        '<!--lit-part h+ilbtUUJbo=--><div><!--lit-part +3BZAG9vWQA=-->some<!--/lit-part--><!--lit-part eDGGC741hws=--> async<!--/lit-part--> text</div><!--/lit-part-->',
    },
    {
      title: 'static attributes',
      template: h`<div a="text" b></div>`,
      result: '<!--lit-part TyQRGSNSqEo=--><div a="text" b></div><!--/lit-part-->',
    },
    {
      title: 'quoted text attribute',
      template: h`<div a="${'text'}"></div>`,
      result: '<!--lit-part gYgzm5LkVDI=--><div a="text"><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'quoted array attribute',
      template: h`<div a="${[1, 2, 3]}"></div>`,
      result: '<!--lit-part gYgzm5LkVDI=--><div a="1,2,3"><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'unquoted text attribute',
      template: h`<div a=${'text'}></div>`,
      result: '<!--lit-part K+c1m3iKv0M=--><div a="text"><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'quoted text attribute with extra whitespace',
      template: h`<div a=" ${'text'} "></div>`,
      result: '<!--lit-part K8pqMbhSWzI=--><div a=" text "><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'quoted text attribute with extra strings',
      template: h`<div a="some ${'text'}"></div>`,
      result: '<!--lit-part f8xfJ7hWEaU=--><div a="some text"><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'quoted text attribute with multiple strings/values',
      template: h`<div a="this is ${'some'} ${'text'}"></div>`,
      result: '<!--lit-part D6xN2GCdvaE=--><div a="this is some text"><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'static and quoted text attribute with multiple strings/values',
      template: h`<div a="text" b c="this is ${'some'} ${'text'}" d="more" e ?f=${true}></div>`,
      result:
        '<!--lit-part fGabAZ9SnBM=--><div a="text" b c="this is some text" d="more" e f><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'truthy boolean attribute',
      template: h`<div ?a="${true}"></div>`,
      result: '<!--lit-part X7msddNbKag=--><div a><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'falsey boolean attribute',
      template: h`<div ?a="${false}"></div>`,
      result: '<!--lit-part X7msddNbKag=--><div ><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'element attribute',
      template: h`<div ${() => {}}></div>`,
      result: '<!--lit-part liPcn9lj0Ak=--><div ><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'event attribute',
      template: h`<div @a="${'event'}"></div>`,
      result: '<!--lit-part X7msdUw8k34=--><div ><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'property attribute',
      template: h`<div .a="${'prop'}"></div>`,
      result: '<!--lit-part X7msdWIx9Mg=--><div><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'raw text',
      template: h`<script ?defer="${true}">var t = ${'true'};</script>`,
      result: '<!--lit-part QGlntsotObw=--><script defer>var t = true;</script><!--/lit-part-->',
    },
    {
      title: 'custom element with static attributes',
      template: h`<my-el a="text" b></my-el>`,
      result:
        '<!--lit-part RFW6pSjk80E=--><my-el a="text" b><!--lit-node 0--><!--lit-part--><!--/lit-part--></my-el><!--/lit-part-->',
    },
    {
      title: 'custom element with static and dynamic attributes',
      template: h`<my-el a="text" ?b=${true} .c=${{ c: true }}></my-el>`,
      result:
        '<!--lit-part 5ElCYNqBmr4=--><my-el a="text" b><!--lit-node 0--><!--lit-part--><!--/lit-part--></my-el><!--/lit-part-->',
    },
    {
      title: 'custom element with property reflection',
      template: () => {
        class MyEl extends HTMLElement {
          set a(value) {
            this.setAttribute('a', value);
          }
        }
        customElements.define('my-el', MyEl);
        return h`<my-el .a=${'a'}></my-el>`;
      },
      result:
        '<!--lit-part V4/fxcqoz/0=--><my-el a="a"><!--lit-node 0--><!--lit-part--><!--/lit-part--></my-el><!--/lit-part-->',
    },
    {
      title: 'custom element with attribute set during connectedCallback',
      template: () => {
        class MyEl extends HTMLElement {
          connectedCallback() {
            this.setAttribute('a', 'a');
          }
        }
        customElements.define('my-el', MyEl);
        return h`<my-el></my-el>`;
      },
      result:
        '<!--lit-part 9t1WSFm5xNQ=--><my-el a="a"><!--lit-node 0--><!--lit-part--><!--/lit-part--></my-el><!--/lit-part-->',
    },
    {
      title: 'custom element with innerHTML set during construction',
      template: () => {
        class MyEl extends HTMLElement {
          constructor() {
            super();
            this.innerHTML = 'text';
          }
        }
        customElements.define('my-el', MyEl);
        return h`<my-el></my-el>`;
      },
      result:
        '<!--lit-part 9t1WSFm5xNQ=--><my-el><!--lit-node 0--><!--lit-part-->text<!--/lit-part--></my-el><!--/lit-part-->',
    },
    {
      title: 'custom element with innerHTML set during connectedCallback',
      template: () => {
        class MyEl extends HTMLElement {
          connectedCallback() {
            this.innerHTML = 'text';
          }
        }
        customElements.define('my-el', MyEl);
        return h`<my-el></my-el>`;
      },
      result:
        '<!--lit-part 9t1WSFm5xNQ=--><my-el><!--lit-node 0--><!--lit-part-->text<!--/lit-part--></my-el><!--/lit-part-->',
    },
    {
      title: 'custom element with shadowDOM innerHTML set during construction',
      template: () => {
        class MyEl extends HTMLElement {
          constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            shadow.innerHTML = 'text';
          }
        }
        customElements.define('my-el', MyEl);
        return h`<my-el></my-el>`;
      },
      result:
        '<!--lit-part 9t1WSFm5xNQ=--><my-el><!--lit-node 0--><!--lit-part--><template shadowroot="open">text</template><!--/lit-part--></my-el><!--/lit-part-->',
    },
  ];
  const only = tests.filter(({ only }) => only);

  for (let { title, template, result, skip } of only.length ? only : tests) {
    const fullTitle = `${title}`;

    if (skip) {
      it.skip(fullTitle);
    } else {
      it(fullTitle, async () => {
        if (typeof template === 'function') {
          template = template();
        }
        const string = await renderToString(template, { includeRehydrationMetadata: true });
        // const stream = await streamAsPromise(renderToStream(template, { includeRehydrationMetadata: true }));
        // assert.equal(string, stream);
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
