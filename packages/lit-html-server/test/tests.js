// @ts-nocheck
import { PartialHydrationMixin } from '@popeindustries/lit-html/partial-hydration-mixin.js';

export const tests = [
  {
    title: 'plain text',
    template: (h) => h`<div>text</div>`,
    metadata: true,
    result: '<!--lit-child pxc8m9UUJbo=--><div>text</div><!--/lit-child-->',
  },
  {
    title: 'text child',
    template: (h) => h`<div>${'text'}</div>`,
    metadata: true,
    result: '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child-->text<!--/lit-child--></div><!--/lit-child-->',
  },
  {
    title: 'number child',
    template: (h) => h`<div>${1}</div>`,
    metadata: true,
    result: '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child-->1<!--/lit-child--></div><!--/lit-child-->',
  },
  {
    title: 'boolean child',
    template: (h) => h`<div>${true}</div>`,
    metadata: true,
    result: '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child-->true<!--/lit-child--></div><!--/lit-child-->',
  },
  {
    title: 'null child',
    template: (h) => h`<div>${null}</div>`,
    metadata: true,
    result: '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child--><!--/lit-child--></div><!--/lit-child-->',
  },
  {
    title: 'undefined child',
    template: (h) => h`<div>${undefined}</div>`,
    metadata: true,
    result: '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child--><!--/lit-child--></div><!--/lit-child-->',
  },
  {
    title: 'array child',
    template: (h) => h`<div>${[1, 2, 3]}</div>`,
    metadata: true,
    result:
      '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child--><!--lit-child-->1<!--/lit-child--><!--lit-child-->2<!--/lit-child--><!--lit-child-->3<!--/lit-child--><!--/lit-child--></div><!--/lit-child-->',
  },
  {
    title: 'nested array child',
    template: (h) => h`<div>${[1, 2, [3, [4, 5]]]}</div>`,
    metadata: true,
    result:
      '<!--lit-child AEmR7W+R0Ak=--><div><!--lit-child--><!--lit-child-->1<!--/lit-child--><!--lit-child-->2<!--/lit-child--><!--lit-child--><!--lit-child-->3<!--/lit-child--><!--lit-child--><!--lit-child-->4<!--/lit-child--><!--lit-child-->5<!--/lit-child--><!--/lit-child--><!--/lit-child--><!--/lit-child--></div><!--/lit-child-->',
  },
  {
    title: 'template child',
    template: (h) => h`<div>some ${h`text`}</div>`,
    metadata: true,
    result:
      '<!--lit-child qjs5mhF6hQ0=--><div>some <!--lit-child iW9ZALRtWQA=-->text<!--/lit-child--></div><!--/lit-child-->',
  },
  {
    title: 'Promise child',
    template: (h) => h`<div>${Promise.resolve('some')} text</div>`,
    metadata: false,
    result: '<div>some text</div>',
  },
  {
    title: 'Promise template child',
    template: (h) => h`<div>${Promise.resolve(h`some`)} text</div>`,
    metadata: false,
    result: '<div>some text</div>',
  },
  {
    skip: true,
    title: 'sync iterator child',
    template: (h) =>
      h`<div>Well ${['hello ', 'there ', 'world', [', hows ', 'it ', 'going']][Symbol.iterator]()}?</div>`,
    metadata: true,
    result:
      '<!--lit-child AB0dAcJ7zUo=--><div>Well <!--lit-child--><!--lit-child-->hello <!--/lit-child--><!--lit-child-->there <!--/lit-child--><!--lit-child-->world<!--/lit-child--><!--lit-child--><!--lit-child-->, hows <!--/lit-child--><!--lit-child-->it <!--/lit-child--><!--lit-child-->going<!--/lit-child--><!--/lit-child--><!--/lit-child-->?</div><!--/lit-child-->',
  },
  {
    title: 'array of nested child templates',
    template: (h) => h`<div>some ${[1, 2, 3].map((i) => h`${i}`)} text</div>`,
    metadata: true,
    result:
      '<!--lit-child rQEcjeuOsoE=--><div>some <!--lit-child--><!--lit-child BRUAAAUVAAA=--><!--lit-child-->1<!--/lit-child--><!--/lit-child--><!--lit-child BRUAAAUVAAA=--><!--lit-child-->2<!--/lit-child--><!--/lit-child--><!--lit-child BRUAAAUVAAA=--><!--lit-child-->3<!--/lit-child--><!--/lit-child--><!--/lit-child--> text</div><!--/lit-child-->',
  },
  {
    skip: true,
    title: 'AsyncIterator child',
    template: (h) => h`<div>${createAsyncIterable(['some', ' async'])} text</div>`,
    metadata: true,
    result:
      '<!--lit-child h+ilbtUUJbo=--><div><!--lit-child-->some<!--/lit-child--><!--lit-child--> async<!--/lit-child--> text</div><!--/lit-child-->',
  },
  {
    skip: true,
    title: 'AsyncIterator child templates',
    template: (h) => h`<div>${createAsyncIterable([h`some`, h` async`])} text</div>`,
    metadata: true,
    result:
      '<!--lit-child h+ilbtUUJbo=--><div><!--lit-child +3BZAG9vWQA=-->some<!--/lit-child--><!--lit-child eDGGC741hws=--> async<!--/lit-child--> text</div><!--/lit-child-->',
  },
  {
    title: 'static attributes',
    template: (h) => h`<div a="text" b></div>`,
    metadata: true,
    result: '<!--lit-child TyQRGSNSqEo=--><div a="text" b></div><!--/lit-child-->',
  },
  {
    title: 'quoted text attribute',
    template: (h) => h`<div a="${'text'}"></div>`,
    metadata: true,
    result: '<!--lit-child gYgzm5LkVDI=--><div a="text"><!--lit-attr 0--></div><!--/lit-child-->',
  },
  {
    title: 'quoted array attribute',
    template: (h) => h`<div a="${[1, 2, 3]}"></div>`,
    metadata: true,
    result: '<!--lit-child gYgzm5LkVDI=--><div a="1,2,3"><!--lit-attr 0--></div><!--/lit-child-->',
  },
  {
    title: 'unquoted text attribute',
    template: (h) => h`<div a=${'text'}></div>`,
    metadata: true,
    result: '<!--lit-child K+c1m3iKv0M=--><div a="text"><!--lit-attr 0--></div><!--/lit-child-->',
  },
  {
    title: 'quoted text attribute with extra whitespace',
    template: (h) => h`<div a=" ${'text'} "></div>`,
    metadata: true,
    result: '<!--lit-child K8pqMbhSWzI=--><div a=" text "><!--lit-attr 0--></div><!--/lit-child-->',
  },
  {
    title: 'quoted text attribute with extra strings',
    template: (h) => h`<div a="some ${'text'}"></div>`,
    metadata: true,
    result: '<!--lit-child f8xfJ7hWEaU=--><div a="some text"><!--lit-attr 0--></div><!--/lit-child-->',
  },
  {
    title: 'quoted text attribute with multiple strings/values',
    template: (h) => h`<div a="this is ${'some'} ${'text'}"></div>`,
    metadata: true,
    result: '<!--lit-child D6xN2GCdvaE=--><div a="this is some text"><!--lit-attr 0--></div><!--/lit-child-->',
  },
  {
    title: 'static and quoted text attribute with multiple strings/values',
    template: (h) => h`<div a="text" b c="this is ${'some'} ${'text'}" d="more" e ?f=${true}></div>`,
    metadata: true,
    result:
      '<!--lit-child fGabAZ9SnBM=--><div a="text" b c="this is some text" d="more" e f><!--lit-attr 0--></div><!--/lit-child-->',
  },
  {
    title: 'truthy boolean attribute',
    template: (h) => h`<div ?a="${true}"></div>`,
    metadata: true,
    result: '<!--lit-child X7msddNbKag=--><div a><!--lit-attr 0--></div><!--/lit-child-->',
  },
  {
    title: 'falsey boolean attribute',
    template: (h) => h`<div ?a="${false}"></div>`,
    metadata: true,
    result: '<!--lit-child X7msddNbKag=--><div><!--lit-attr 0--></div><!--/lit-child-->',
  },
  {
    title: 'element attribute',
    template: (h) => h`<div ${() => {}}></div>`,
    metadata: true,
    result: '<!--lit-child liPcn9lj0Ak=--><div><!--lit-attr 0--></div><!--/lit-child-->',
  },
  {
    title: 'event attribute',
    template: (h) => h`<div @a="${'event'}"></div>`,
    metadata: true,
    result: '<!--lit-child X7msdUw8k34=--><div><!--lit-attr 0--></div><!--/lit-child-->',
  },
  {
    title: 'property attribute',
    template: (h) => h`<div .a="${'prop'}"></div>`,
    metadata: true,
    result: '<!--lit-child X7msdWIx9Mg=--><div><!--lit-attr 0--></div><!--/lit-child-->',
  },
  {
    title: 'raw text',
    template: (h) =>
      h`<script ?defer="${true}">
        var t = ${'true'};
      </script>`,
    metadata: true,
    result: '<!--lit-child QGlntsotObw=--><script defer>var t = true;</script><!--/lit-child-->',
  },
  {
    title: 'custom element with static attributes',
    template: (h) => h`<my-el a="text" b></my-el>`,
    metadata: true,
    result:
      '<!--lit-child RFW6pSjk80E=--><my-el a="text" b><!--lit-attr 0--><!--lit-child--><!--/lit-child--></my-el><!--/lit-child-->',
  },
  {
    title: 'custom element with static and dynamic attributes',
    template: (h) => h`<my-el a="text" ?b=${true} .c=${{ c: true }}></my-el>`,
    metadata: true,
    result:
      '<!--lit-child 5ElCYNqBmr4=--><my-el a="text" b><!--lit-attr 0--><!--lit-child--><!--/lit-child--></my-el><!--/lit-child-->',
  },
  {
    title: 'custom element with property reflection',
    template: (h) => {
      class MyEl extends HTMLElement {
        set a(value) {
          this.setAttribute('a', value);
        }
      }
      customElements.define('my-el1', MyEl);
      return h`<my-el1 .a=${'a'}></my-el1>`;
    },
    metadata: true,
    result:
      '<!--lit-child u23TLub2CpA=--><my-el1 a="a"><!--lit-attr 0--><!--lit-child--><!--/lit-child--></my-el1><!--/lit-child-->',
  },
  {
    title: 'custom element with attribute set during connectedCallback',
    template: (h) => {
      class MyEl extends HTMLElement {
        connectedCallback() {
          this.setAttribute('a', 'a');
        }
      }
      customElements.define('my-el2', MyEl);
      return h`<my-el2></my-el2>`;
    },
    metadata: true,
    result:
      '<!--lit-child mcimSba/om0=--><my-el2 a="a"><!--lit-attr 0--><!--lit-child--><!--/lit-child--></my-el2><!--/lit-child-->',
  },
  {
    title: 'custom element with innerHTML set during construction',
    template: (h) => {
      class MyEl extends HTMLElement {
        constructor() {
          super();
          this.innerHTML = 'text';
        }
      }
      customElements.define('my-el3', MyEl);
      return h`<my-el3></my-el3>`;
    },
    metadata: true,
    result:
      '<!--lit-child +I/NQre/om0=--><my-el3><!--lit-attr 0--><!--lit-child-->text<!--/lit-child--></my-el3><!--/lit-child-->',
  },
  {
    title: 'custom element with innerHTML set during connectedCallback',
    template: (h) => {
      class MyEl extends HTMLElement {
        connectedCallback() {
          this.innerHTML = 'text';
        }
      }
      customElements.define('my-el4', MyEl);
      return h`<my-el4></my-el4>`;
    },
    metadata: true,
    result:
      '<!--lit-child 31Y0PLC/om0=--><my-el4><!--lit-attr 0--><!--lit-child-->text<!--/lit-child--></my-el4><!--/lit-child-->',
  },
  {
    title: 'custom element with shadowDOM innerHTML set during construction',
    template: (h) => {
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
    metadata: true,
    result:
      '<!--lit-child Ph5bNbG/om0=--><my-el5><!--lit-attr 0--><!--lit-child--><template shadowroot="open">text</template><!--/lit-child--></my-el5><!--/lit-child-->',
  },
  {
    title: 'custom element with "render:client" attribute',
    template: (h) => {
      class MyEl extends HTMLElement {
        constructor() {
          super();
          this.innerHTML = 'text';
        }
      }
      customElements.define('my-el6', MyEl);
      return h`<my-el6 ?render:client=${true}><span slot="my-text">some text</span></my-el6>`;
    },
    metadata: true,
    result:
      '<!--lit-child l8hegyhGWbE=--><my-el6 render:client><span slot="my-text">some text</span></my-el6><!--/lit-child-->',
  },
  {
    only: true,
    title: 'nested custom elements with...',
    template: (h, hydrateOrRender) => {
      class Base extends HTMLElement {
        connectedCallback() {
          hydrateOrRender(this.render(), this, { host: this });
        }
      }
      class MyEl7 extends PartialHydrationMixin(Base) {
        render() {
          return h`<div ?a="${this.hasAttribute('a')}">my <my-el8 .a="${this.hasAttribute('a')}"></my-el8></div>`;
        }
      }
      class MyEl8 extends PartialHydrationMixin(Base) {
        a = null;
        render() {
          return h`<div>text ${this.a ? h`has "a"` : h`missing "a"`}</div>`;
        }
      }
      customElements.define('my-el8', MyEl8);
      customElements.define('my-el7', MyEl7);
      return h`<h1>Title</h1><my-el7 ?a="${true}"></my-el7><div b="${'b'}">${'some more text'}</div>`;
    },
    metadata: true,
    result:
      '<!--lit lJKtXaezMNE=--><h1>Title</h1><my-el7 hydrate:defer a><!--lit-attr 1--><!--lit Zzpy/eJ8XLk=--><div a><!--lit-attr 1-->my <my-el8 hydrate:defer><!--lit-attr 1--><!--lit kcY7myOR0f4=--><div>text <!--lit-child XrJxfIU6hws=-->has "a"<!--/lit-child--></div><!--/lit--></my-el8></div><!--/lit--></my-el7><div b="b"><!--lit-attr 1--><!--lit-child-->some more text<!--/lit-child--></div><!--/lit-->',
  },
];
