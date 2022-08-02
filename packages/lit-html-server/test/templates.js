// @ts-nocheck
export const tests = [
  {
    title: 'plain text',
    template: 'html`<div>text</div>`',
    metadata: true,
    result: '<!--lit-part pxc8m9UUJbo=--><div>text</div><!--/lit-part-->',
  },
  {
    title: 'text child',
    template: 'html`<div>${"text"}</div>`',
    metadata: true,
    result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part-->text<!--/lit-part--></div><!--/lit-part-->',
  },
  {
    title: 'number child',
    template: 'html`<div>${1}</div>`',
    metadata: true,
    result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part-->1<!--/lit-part--></div><!--/lit-part-->',
  },
  {
    title: 'boolean child',
    template: 'html`<div>${true}</div>`',
    metadata: true,
    result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part-->true<!--/lit-part--></div><!--/lit-part-->',
  },
  {
    title: 'null child',
    template: 'html`<div>${null}</div>`',
    metadata: true,
    result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part--><!--/lit-part--></div><!--/lit-part-->',
  },
  {
    title: 'undefined child',
    template: 'html`<div>${undefined}</div>`',
    metadata: true,
    result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part--><!--/lit-part--></div><!--/lit-part-->',
  },
  {
    title: 'array child',
    template: 'html`<div>${[1, 2, 3]}</div>`',
    metadata: true,
    result:
      '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part--><!--lit-part-->1<!--/lit-part--><!--lit-part-->2<!--/lit-part--><!--lit-part-->3<!--/lit-part--><!--/lit-part--></div><!--/lit-part-->',
  },
  {
    title: 'nested array child',
    template: 'html`<div>${[1, 2, [3, [4, 5]]]}</div>`',
    metadata: true,
    result:
      '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part--><!--lit-part-->1<!--/lit-part--><!--lit-part-->2<!--/lit-part--><!--lit-part--><!--lit-part-->3<!--/lit-part--><!--lit-part--><!--lit-part-->4<!--/lit-part--><!--lit-part-->5<!--/lit-part--><!--/lit-part--><!--/lit-part--><!--/lit-part--></div><!--/lit-part-->',
  },
  {
    title: 'template child',
    template: 'html`<div>some ${html`text`}</div>`',
    metadata: true,
    result:
      '<!--lit-part qjs5mhF6hQ0=--><div>some <!--lit-part iW9ZALRtWQA=-->text<!--/lit-part--></div><!--/lit-part-->',
  },
  {
    title: 'Promise child',
    template: 'html`<div>${Promise.resolve("some")} text</div>`',
    metadata: false,
    result: '<div>some text</div>',
  },
  {
    title: 'Promise template child',
    template: 'html`<div>${Promise.resolve(html`some`)} text</div>`',
    metadata: false,
    result: '<div>some text</div>',
  },
  {
    skip: true,
    title: 'sync iterator child',
    template: "html`<div>Well ${['hello ', 'there ', 'world', [', hows ', 'it ', 'going']][Symbol.iterator]()}?</div>`",
    metadata: true,
    result:
      '<!--lit-part AB0dAcJ7zUo=--><div>Well <!--lit-part--><!--lit-part-->hello <!--/lit-part--><!--lit-part-->there <!--/lit-part--><!--lit-part-->world<!--/lit-part--><!--lit-part--><!--lit-part-->, hows <!--/lit-part--><!--lit-part-->it <!--/lit-part--><!--lit-part-->going<!--/lit-part--><!--/lit-part--><!--/lit-part-->?</div><!--/lit-part-->',
  },
  {
    title: 'array of nested child templates',
    template: 'html`<div>some ${[1, 2, 3].map((i) => html`${i}`)} text</div>`',
    metadata: true,
    result:
      '<!--lit-part rQEcjeuOsoE=--><div>some <!--lit-part--><!--lit-part BRUAAAUVAAA=--><!--lit-part-->1<!--/lit-part--><!--/lit-part--><!--lit-part BRUAAAUVAAA=--><!--lit-part-->2<!--/lit-part--><!--/lit-part--><!--lit-part BRUAAAUVAAA=--><!--lit-part-->3<!--/lit-part--><!--/lit-part--><!--/lit-part--> text</div><!--/lit-part-->',
  },
  {
    skip: true,
    title: 'AsyncIterator child',
    template: "html`<div>${createAsyncIterable(['some', ' async'])} text</div>`",
    metadata: true,
    result:
      '<!--lit-part h+ilbtUUJbo=--><div><!--lit-part-->some<!--/lit-part--><!--lit-part--> async<!--/lit-part--> text</div><!--/lit-part-->',
  },
  {
    skip: true,
    title: 'AsyncIterator child templates',
    template: 'html`<div>${createAsyncIterable([html`some`, html` async`])} text</div>`',
    metadata: true,
    result:
      '<!--lit-part h+ilbtUUJbo=--><div><!--lit-part +3BZAG9vWQA=-->some<!--/lit-part--><!--lit-part eDGGC741hws=--> async<!--/lit-part--> text</div><!--/lit-part-->',
  },
  {
    title: 'static attributes',
    template: 'html`<div a="text" b></div>`',
    metadata: true,
    result: '<!--lit-part TyQRGSNSqEo=--><div a="text" b></div><!--/lit-part-->',
  },
  {
    title: 'quoted text attribute',
    template: 'html`<div a="${"text"}"></div>`',
    metadata: true,
    result: '<!--lit-part gYgzm5LkVDI=--><div a="text"><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'quoted array attribute',
    template: 'html`<div a="${[1, 2, 3]}"></div>`',
    metadata: true,
    result: '<!--lit-part gYgzm5LkVDI=--><div a="1,2,3"><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'unquoted text attribute',
    template: 'html`<div a=${"text"}></div>`',
    metadata: true,
    result: '<!--lit-part K+c1m3iKv0M=--><div a="text"><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'quoted text attribute with extra whitespace',
    template: 'html`<div a=" ${"text"} "></div>`',
    metadata: true,
    result: '<!--lit-part K8pqMbhSWzI=--><div a=" text "><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'quoted text attribute with extra strings',
    template: 'html`<div a="some ${"text"}"></div>`',
    metadata: true,
    result: '<!--lit-part f8xfJ7hWEaU=--><div a="some text"><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'quoted text attribute with multiple strings/values',
    template: 'html`<div a="this is ${"some"} ${"text"}"></div>`',
    metadata: true,
    result: '<!--lit-part D6xN2GCdvaE=--><div a="this is some text"><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'static and quoted text attribute with multiple strings/values',
    template: 'html`<div a="text" b c="this is ${"some"} ${"text"}" d="more" e ?f=${true}></div>`',
    metadata: true,
    result:
      '<!--lit-part fGabAZ9SnBM=--><div a="text" b c="this is some text" d="more" e f><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'truthy boolean attribute',
    template: 'html`<div ?a="${true}"></div>`',
    metadata: true,
    result: '<!--lit-part X7msddNbKag=--><div a><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'falsey boolean attribute',
    template: 'html`<div ?a="${false}"></div>`',
    metadata: true,
    result: '<!--lit-part X7msddNbKag=--><div><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'element attribute',
    template: 'html`<div ${() => {}}></div>`',
    metadata: true,
    result: '<!--lit-part liPcn9lj0Ak=--><div><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'event attribute',
    template: 'html`<div @a="${"event"}"></div>`',
    metadata: true,
    result: '<!--lit-part X7msdUw8k34=--><div><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'property attribute',
    template: 'html`<div .a="${"prop"}"></div>`',
    metadata: true,
    result: '<!--lit-part X7msdWIx9Mg=--><div><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'raw text',
    template: 'html`<script ?defer="${true}">var t = ${"true"};</script>`',
    metadata: true,
    result: '<!--lit-part QGlntsotObw=--><script defer>var t = true;</script><!--/lit-part-->',
  },
  {
    title: 'custom element with static attributes',
    template: 'html`<my-el a="text" b></my-el>`',
    metadata: true,
    result:
      '<!--lit-part RFW6pSjk80E=--><my-el a="text" b><!--lit-node 0--><!--lit-part--><!--/lit-part--></my-el><!--/lit-part-->',
  },
  {
    title: 'custom element with static and dynamic attributes',
    template: 'html`<my-el a="text" ?b=${true} .c=${{ c: true }}></my-el>`',
    metadata: true,
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
      customElements.define('my-el1', MyEl);
      return 'html`<my-el1 .a=${"a"}></my-el1>`';
    },
    metadata: true,
    result:
      '<!--lit-part u23TLub2CpA=--><my-el1 a="a"><!--lit-node 0--><!--lit-part--><!--/lit-part--></my-el1><!--/lit-part-->',
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
      return 'html`<my-el2></my-el2>`';
    },
    metadata: true,
    result:
      '<!--lit-part mcimSba/om0=--><my-el2 a="a"><!--lit-node 0--><!--lit-part--><!--/lit-part--></my-el2><!--/lit-part-->',
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
      return 'html`<my-el3></my-el3>`';
    },
    metadata: true,
    result:
      '<!--lit-part +I/NQre/om0=--><my-el3><!--lit-node 0--><!--lit-part-->text<!--/lit-part--></my-el3><!--/lit-part-->',
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
      return 'html`<my-el4></my-el4>`';
    },
    metadata: true,
    result:
      '<!--lit-part 31Y0PLC/om0=--><my-el4><!--lit-node 0--><!--lit-part-->text<!--/lit-part--></my-el4><!--/lit-part-->',
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
      return 'html`<my-el5></my-el5>`';
    },
    metadata: true,
    result:
      '<!--lit-part Ph5bNbG/om0=--><my-el5><!--lit-node 0--><!--lit-part--><template shadowroot="open">text</template><!--/lit-part--></my-el5><!--/lit-part-->',
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
      return 'html`<my-el6 ?render:client=${true}><span slot="my-text">some text</span></my-el6>`';
    },
    metadata: true,
    result:
      '<!--lit-part l8hegyhGWbE=--><my-el6 render:client><span slot="my-text">some text</span></my-el6><!--/lit-part-->',
  },
];
