import { css, LitElement } from '@popeindustries/lit-element/lit-element.js';
import { html as h, render } from '@popeindustries/lit-html';
import { lazyHydrationMixin } from '@popeindustries/lit-html/lazy-hydration-mixin.js';
import { unsafeHTML } from '@popeindustries/lit-html/directives/unsafe-html.js';
import { unsafeSVG } from '@popeindustries/lit-html/directives/unsafe-svg.js';

export const common = [
  {
    title: 'plain text',
    template: () => h`<div>text</div>`,
    result: '<!--lit pxc8m9UUJbo=--><div>text</div><!--/lit-->',
  },
  {
    title: 'text child',
    template: () => h`<div>${'text'}</div>`,
    result: '<!--lit AEmR7W+R0Ak=--><div><!--lit-child-->text<!--/lit-child--></div><!--/lit-->',
  },
  {
    title: 'number child',
    template: () => h`<div>${1}</div>`,
    result: '<!--lit AEmR7W+R0Ak=--><div><!--lit-child-->1<!--/lit-child--></div><!--/lit-->',
  },
  {
    title: 'boolean child',
    template: () => h`<div>${true}</div>`,
    result: '<!--lit AEmR7W+R0Ak=--><div><!--lit-child-->true<!--/lit-child--></div><!--/lit-->',
  },
  {
    title: 'null child',
    template: () => h`<div>${null}</div>`,
    result: '<!--lit AEmR7W+R0Ak=--><div><!--lit-child--> <!--/lit-child--></div><!--/lit-->',
  },
  {
    title: 'undefined child',
    template: () => h`<div>${undefined}</div>`,
    result: '<!--lit AEmR7W+R0Ak=--><div><!--lit-child--> <!--/lit-child--></div><!--/lit-->',
  },
  {
    title: 'array child',
    template: () => h`<div>${[1, 2, 3]}</div>`,
    result:
      '<!--lit AEmR7W+R0Ak=--><div><!--lit-child--><!--lit-child-->1<!--/lit-child--><!--lit-child-->2<!--/lit-child--><!--lit-child-->3<!--/lit-child--><!--/lit-child--></div><!--/lit-->',
  },
  {
    title: 'nested array child',
    template: () => h`<div>${[1, 2, [3, [4, 5]]]}</div>`,
    result:
      '<!--lit AEmR7W+R0Ak=--><div><!--lit-child--><!--lit-child-->1<!--/lit-child--><!--lit-child-->2<!--/lit-child--><!--lit-child--><!--lit-child-->3<!--/lit-child--><!--lit-child--><!--lit-child-->4<!--/lit-child--><!--lit-child-->5<!--/lit-child--><!--/lit-child--><!--/lit-child--><!--/lit-child--></div><!--/lit-->',
  },
  {
    title: 'template child',
    template: () => h`<div>some ${h`text`}</div>`,
    result: '<!--lit qjs5mhF6hQ0=--><div>some <!--lit-child iW9ZALRtWQA=-->text<!--/lit-child--></div><!--/lit-->',
  },
  {
    title: 'sync iterator child',
    template: () => h`<div>Well ${new Set(['hello ', 'there ', 'world', new Set([', hows ', 'it ', 'going'])])}?</div>`,
    result:
      '<!--lit AB0dAcJ7zUo=--><div>Well <!--lit-child--><!--lit-child-->hello <!--/lit-child--><!--lit-child-->there <!--/lit-child--><!--lit-child-->world<!--/lit-child--><!--lit-child--><!--lit-child-->, hows <!--/lit-child--><!--lit-child-->it <!--/lit-child--><!--lit-child-->going<!--/lit-child--><!--/lit-child--><!--/lit-child-->?</div><!--/lit-->',
  },
  {
    title: 'array of nested child templates',
    template: () => h`<div>some ${[1, 2, 3].map((i) => h`${i}`)} text</div>`,
    result:
      '<!--lit rQEcjeuOsoE=--><div>some <!--lit-child--><!--lit-child BRUAAAUVAAA=--><!--lit-child-->1<!--/lit-child--><!--/lit-child--><!--lit-child BRUAAAUVAAA=--><!--lit-child-->2<!--/lit-child--><!--/lit-child--><!--lit-child BRUAAAUVAAA=--><!--lit-child-->3<!--/lit-child--><!--/lit-child--><!--/lit-child--> text</div><!--/lit-->',
  },
  {
    title: 'static attributes',
    template: () => h`<div a="text" b></div>`,
    result: '<!--lit TyQRGSNSqEo=--><div a="text" b></div><!--/lit-->',
  },
  {
    title: 'quoted text attribute',
    template: () => h`<div a="${'text'}"></div>`,
    result: '<!--lit gYgzm5LkVDI=--><div a="text"><!--lit-attr 1--></div><!--/lit-->',
  },
  {
    title: 'quoted array attribute',
    template: () => h`<div a="${[1, 2, 3]}"></div>`,
    result: '<!--lit gYgzm5LkVDI=--><div a="1,2,3"><!--lit-attr 1--></div><!--/lit-->',
  },
  {
    title: 'unquoted text attribute',
    template: () => h`<div a=${'text'}></div>`,
    result: '<!--lit K+c1m3iKv0M=--><div a="text"><!--lit-attr 1--></div><!--/lit-->',
  },
  {
    title: 'quoted text attribute with extra whitespace',
    template: () => h`<div a=" ${'text'} "></div>`,
    result: '<!--lit K8pqMbhSWzI=--><div a=" text "><!--lit-attr 1--></div><!--/lit-->',
  },
  {
    title: 'quoted text attribute with extra strings',
    template: () => h`<div a="some ${'text'}"></div>`,
    result: '<!--lit f8xfJ7hWEaU=--><div a="some text"><!--lit-attr 1--></div><!--/lit-->',
  },
  {
    title: 'quoted text attribute with multiple strings/values',
    template: () => h`<div a="this is ${'some'} ${'text'}"></div>`,
    result: '<!--lit D6xN2GCdvaE=--><div a="this is some text"><!--lit-attr 2--></div><!--/lit-->',
  },
  {
    title: 'static and quoted text attribute with multiple strings/values',
    template: () => h`<div a="text" b c="this is ${'some'} ${'text'}" d="more" e ?f=${true}></div>`,
    result:
      '<!--lit fGabAZ9SnBM=--><div a="text" b c="this is some text" d="more" e f><!--lit-attr 3--></div><!--/lit-->',
  },
  {
    title: 'truthy boolean attribute',
    template: () => h`<div ?a="${true}"></div>`,
    result: '<!--lit X7msddNbKag=--><div a><!--lit-attr 1--></div><!--/lit-->',
  },
  {
    title: 'falsey boolean attribute',
    template: () => h`<div ?a="${false}"></div>`,
    result: '<!--lit X7msddNbKag=--><div><!--lit-attr 1--></div><!--/lit-->',
  },
  {
    title: 'element attribute',
    template: () => h`<div ${() => {}}></div>`,
    result: '<!--lit liPcn9lj0Ak=--><div><!--lit-attr 1--></div><!--/lit-->',
  },
  {
    title: 'event attribute',
    template: () => h`<div @a="${'event'}"></div>`,
    metadata: true,
    result: '<!--lit X7msdUw8k34=--><div><!--lit-attr 1--></div><!--/lit-->',
  },
  {
    title: 'property attribute',
    template: () => h`<div .a="${'prop'}"></div>`,
    result: '<!--lit X7msdWIx9Mg=--><div><!--lit-attr 1--></div><!--/lit-->',
  },
  {
    title: 'raw text',
    template: () => h`<script ?defer="${true}">var t = ${'true'};</script>`,
    result: '<!--lit QGlntsotObw=--><script defer>var t = true;</script><!--/lit-->',
  },
  {
    title: 'unsafeHTML',
    template: () =>
      h`<div>${unsafeHTML(
        '<svg viewBox="0 0 100 100"><path d="M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z" /></svg>',
      )}</div>`,
    result:
      '<!--lit AEmR7W+R0Ak=--><div><!--lit-child ZznyNIfRlSo=--><svg viewBox="0 0 100 100"><path d="M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z" /></svg><!--/lit-child--></div><!--/lit-->',
  },
  {
    title: 'unsafeSVG',
    template: () =>
      h`<div><svg viewBox="0 0 100 100">${unsafeSVG(
        '<path d="M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z" />',
      )}</svg></div>`,
    result:
      '<!--lit Fcvsu9AcvDY=--><div><svg viewBox="0 0 100 100"><!--lit-child skAwzViS45w=--><path d="M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z" /><!--/lit-child--></svg></div><!--/lit-->',
  },
  {
    title: 'custom element with static attributes',
    template: () => h`<my-el a="text" b></my-el>`,
    result: '<!--lit RFW6pSjk80E=--><my-el a="text" b hydrate:defer><!--lit-attr 0--></my-el><!--/lit-->',
  },
  {
    title: 'custom element with static and dynamic attributes',
    template: () => h`<my-el a="text" ?b=${true} .c=${{ c: true }}></my-el>`,
    result: '<!--lit 5ElCYNqBmr4=--><my-el a="text" b hydrate:defer><!--lit-attr 2--></my-el><!--/lit-->',
  },
  {
    title: 'custom element with property reflection',
    template: () => {
      class MyEl extends HTMLElement {
        set a(value) {
          this.setAttribute('a', value);
        }
      }
      customElements.define('my-el1', MyEl);
      return h`<my-el1 .a=${'a'}></my-el1>`;
    },
    result: '<!--lit u23TLub2CpA=--><my-el1 a="a" hydrate:defer><!--lit-attr 1--></my-el1><!--/lit-->',
  },
  {
    title: 'custom element with attribute set during connectedCallback',
    template: () => {
      class MyEl extends HTMLElement {
        connectedCallback() {
          this.setAttribute('a', 'a');
        }
      }
      customElements.define('my-el2', MyEl);
      return h`<my-el2></my-el2>`;
    },
    result: '<!--lit mcimSba/om0=--><my-el2 a="a" hydrate:defer><!--lit-attr 0--></my-el2><!--/lit-->',
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
      customElements.define('my-el3', MyEl);
      return h`<my-el3></my-el3>`;
    },
    result:
      '<!--lit +I/NQre/om0=--><my-el3 hydrate:defer><!--lit-attr 0--><!--lit BRUAAAUVAAA=--><!--lit-child-->text<!--/lit-child--><!--/lit--></my-el3><!--/lit-->',
  },
  {
    title: 'custom element with innerHTML set during connectedCallback',
    template: () => {
      class MyEl extends HTMLElement {
        connectedCallback() {
          this.innerHTML = 'text';
        }
      }
      customElements.define('my-el4', MyEl);
      return h`<my-el4></my-el4>`;
    },
    result:
      '<!--lit 31Y0PLC/om0=--><my-el4 hydrate:defer><!--lit-attr 0--><!--lit BRUAAAUVAAA=--><!--lit-child-->text<!--/lit-child--><!--/lit--></my-el4><!--/lit-->',
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
      customElements.define('my-el5', MyEl);
      return h`<my-el5></my-el5>`;
    },
    result:
      '<!--lit Ph5bNbG/om0=--><my-el5 hydrate:defer><!--lit-attr 0--><template shadowroot="open"><!--lit BRUAAAUVAAA=--><!--lit-child-->text<!--/lit-child--><!--/lit--></template></my-el5><!--/lit-->',
  },
  {
    title: 'custom element with "render:client" attribute',
    template: () => {
      class MyEl extends HTMLElement {
        constructor() {
          super();
          this.innerHTML = 'text';
        }
      }
      customElements.define('my-el6', MyEl);
      return h`<my-el6 ?render:client=${true}><span slot="my-text">some text</span></my-el6>`;
    },
    result:
      '<!--lit l8hegyhGWbE=--><my-el6 render:client><!--lit-attr 1--><span slot="my-text">some text</span></my-el6><!--/lit-->',
  },
  {
    title: 'nested custom elements with lazy hydration',
    template: () => {
      class Base extends HTMLElement {
        connectedCallback() {
          render(this.render(), this, { host: this });
        }
      }
      class MyEl7 extends lazyHydrationMixin(Base) {
        render() {
          return h`<div ?a="${this.hasAttribute('a')}">my <my-el8 .a="${this.hasAttribute('a')}"></my-el8></div>`;
        }
      }
      class MyEl8 extends lazyHydrationMixin(Base) {
        a = null;
        render() {
          return h`<div>text ${this.a ? h`has "a"` : h`missing "a"`}</div>`;
        }
      }
      customElements.define('my-el8', MyEl8);
      customElements.define('my-el7', MyEl7);
      return h`<h1>Title</h1><my-el7 ?a="${true}"></my-el7><div b="${'b'}">${'some more text'}</div>`;
    },
    result:
      '<!--lit lJKtXaezMNE=--><h1>Title</h1><my-el7 a hydrate:defer><!--lit-attr 1--><!--lit Zzpy/eJ8XLk=--><div a><!--lit-attr 1-->my <my-el8 hydrate:defer><!--lit-attr 1--><!--lit kcY7myOR0f4=--><div>text <!--lit-child XrJxfIU6hws=-->has "a"<!--/lit-child--></div><!--/lit--></my-el8></div><!--/lit--></my-el7><div b="b"><!--lit-attr 1--><!--lit-child-->some more text<!--/lit-child--></div><!--/lit-->',
  },
  {
    title: 'nested custom elements with shadowDOM and lazy hydration',
    template: () => {
      class Base extends HTMLElement {
        constructor() {
          super();
          if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' });
          }
        }
        connectedCallback() {
          render(this.render(), this.shadowRoot, { host: this });
        }
      }
      class MyEl9 extends lazyHydrationMixin(Base) {
        render() {
          return h`<div ?a="${this.hasAttribute('a')}">my <my-el10 .a="${this.hasAttribute('a')}"></my-el10></div>`;
        }
      }
      class MyEl10 extends lazyHydrationMixin(Base) {
        a = null;
        render() {
          return h`<div>text ${this.a ? h`has "a"` : h`missing "a"`}</div>`;
        }
      }
      customElements.define('my-el10', MyEl10);
      customElements.define('my-el9', MyEl9);
      return h`<h1>Title</h1><my-el9 ?a="${true}"></my-el9><div b="${'b'}">${'some more text'}</div>`;
    },
    result:
      '<!--lit GpJxfqkCRnw=--><h1>Title</h1><my-el9 a hydrate:defer><!--lit-attr 1--><template shadowroot="open"><!--lit /0wYmzo69CE=--><div a><!--lit-attr 1-->my <my-el10 hydrate:defer><!--lit-attr 1--><template shadowroot="open"><!--lit kcY7myOR0f4=--><div>text <!--lit-child XrJxfIU6hws=-->has "a"<!--/lit-child--></div><!--/lit--></template></my-el10></div><!--/lit--></template></my-el9><div b="b"><!--lit-attr 1--><!--lit-child-->some more text<!--/lit-child--></div><!--/lit-->',
  },
  {
    title: 'LitElement custom element',
    template: () => {
      class MyEl11 extends LitElement {
        static styles = css`
          p {
            color: green;
          }
        `;
        render() {
          return h`<p>I am green!</p>`;
        }
      }
      customElements.define('my-el11', MyEl11);
      return h`<my-el11></my-el11>`;
    },
    result:
      '<!--lit dk2BC/krgh4=--><my-el11 hydrate:defer><!--lit-attr 0--><template shadowroot="open"><style>p{color:green;}</style><!--lit ymb4EFq7aMg=--><p>I am green!</p><!--/lit--></template></my-el11><!--/lit-->',
  },
];

export const server = [
  {
    title: 'Promise child',
    template: () => h`<div>${Promise.resolve('some')} text</div>`,
    result: '<div>some text</div>',
  },
  {
    title: 'Promise template child',
    template: () => h`<div>${Promise.resolve(h`some`)} text</div>`,
    result: '<div>some text</div>',
  },
  {
    title: 'AsyncIterator child',
    template: () => {
      const iter = createAsyncIterable(['some', ' async']);
      return h`<div>${iter} text</div>`;
    },
    result: '<div>some async text</div>',
  },
  {
    title: 'AsyncIterator child templates',
    template: () => {
      const iter = createAsyncIterable([h`some`, h` async`]);
      return h`<div>${iter} text</div>`;
    },
    result: '<div>some async text</div>',
  },
  {
    title: 'handle Promise reject',
    template: () => h`${Promise.reject(Error('errored!'))}`,
    error: 'errored!',
  },
  {
    title: 'handle Promise thrown error',
    template: () =>
      h`${new Promise(() => {
        throw Error('errored!');
      })}`,
    error: 'errored!',
  },
];

export const client = [];

/**
 * Convert "syncIterable" to an AsyncIterable
 * @param { Iterable<unknown> } syncIterable
 * @returns { AsyncIterable<unknown> }
 */
export async function* createAsyncIterable(syncIterable) {
  for (const elem of syncIterable) {
    yield elem;
  }
}
