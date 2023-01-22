[![NPM Version](https://img.shields.io/npm/v/@popeindustries/lit-html-server.svg?style=flat)](https://npmjs.org/package/@popeindustries/lit-html-server)

# @popeindustries/lit-html-server

Efficiently render streaming [lit-html](https://lit.dev/docs/libraries/standalone-templates/) templates on the server (or in a `ServiceWorker`!).

## Features

- 6-7x faster than **@lit-labs/ssr**
- render full HTML pages (not just `<body>`)
- stream responses in Node.js and `ServiceWorker`, with first-class `Promise` and `AsyncIterator` support
- render optional hydration metadata with `hydratable` directive
- render web components with light or shadow DOM
- default web component rendering with `element.innerHTML` and `element.render()` support
- customisable web component rendering with `ElementRenderer`
- compatible with `lit-html/directives/*`

## Usage

Install with `npm/yarn/pnpm`:

```bash
$ npm install --save @popeindustries/lit-html-server
```

...write your **lit-html** template:

```js
import { html } from '@popeindustries/lit-html-server';
// Most lit-html directives are compatible...
import { classMap } from 'lit-html/directives/class-map.js';
// ...except for the async ones ('async-append', 'async-replace', and 'until')
import { until } from '@popeindustries/lit-html-server/directives/until.js';

function Layout(data) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${data.title}</title>
      </head>
      <body>
        ${until(renderBody(data.api))}
      </body>
    </html>
  `;
}

async function renderBody(api) {
  // Some Promise-based request method
  const data = await fetchRemoteData(api);

  return html`
    <h1>${data.title}</h1>
    <my-el ?enabled="${data.hasWidget}"></my-el>
    <p class="${classMap({ negative: data.invertedText })}">${data.text}</p>
  `;
}
```

...and render (plain HTTP server example, though similar for Express/Fastify/etc):

```js
import http from 'node:http';
import { renderToNodeStream } from '@popeindustries/lit-html-server';

http.createServer((request, response) => {
  const data = { title: 'Home', api: '/api/home' };
  response.writeHead(200);
  // Returns a Node.js Readable stream which can be piped to "response"
  renderToNodeStream(Layout(data)).pipe(response);
});
```

## Hydration

Server rendered HTML may be converted to live **lit-html** templates with the help of inline metadata. This process of reusing static HTML to seamlessly bootstrap dynamic templates is referred to as _hydration_.

**lit-html-server** does not output hydration metadata by default, but instead requires that a sub-tree is designated as _hydratable_ via the `hydratable` directive:

```js
import { hydratable } from '@popeindustries/lit-html-server/directives/hydratable.js';

function Layout(data) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${data.title}</title>
      </head>
      <body>
        <h1>Some ${data.title}</h1>
        ${hydratable(renderMenu(data.api))}
        <p>
          Some paragraph of text to show that multiple<br />
          hydration sub-trees can exist in the same container.
        </p>
        ${hydratable(renderPage(data.api))}
        <footer>Some footer</footer>
      </body>
    </html>
  `;
}
```

...which generates output similar to:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Title</title>
  </head>
  <body>
    <h1>Some Title</h1>
    <!--lit qKZ2lAadfCg=-->
    <nav negative>
      <!--lit-attr 1--><!--lit-child--><!--lit-child zRvOSEJDeXc=--><button><!--lit-child-->one<!--/lit-child--></button
      ><!--/lit-child--><!--lit-child zRvOSEJDeXc=--><button><!--lit-child-->two<!--/lit-child--></button
      ><!--/lit-child--><!--lit-child zRvOSEJDeXc=--><button><!--lit-child-->three<!--/lit-child--></button
      ><!--/lit-child--><!--/lit-child-->
    </nav>
    <!--/lit-->
    <p>
      Some paragraph of text to show that multiple<br />
      hydration sub-trees can exist in the same container.
    </p>
    <!--lit 83OJYYYBUzs=-->
    <main>This is the main page content.</main>
    <!--/lit-->
    <footer>Some footer</footer>
  </body>
</html>
```

In order to efficiently reuse templates on the client (`renderMenu` and `renderPage` in the example above), they should be hydrated and rendered with the help of [@popeindustries/lit-html](https://github.com/popeindustries/lit/tree/main/packages/lit-html).

## Web Components

The rendering of web component content is largely handled by custom `ElementRenderer` instances that adhere to the following interface:

```ts
declare class ElementRenderer {
  /**
   * Should return true when given custom element class and/or tag name
   * should be handled by this renderer.
   */
  static matchesClass(ceClass: typeof HTMLElement, tagName: string): boolean;
  /**
   * The custom element instance
   */
  readonly element: HTMLElement;
  /**
   * The custom element tag name
   */
  readonly tagName: string;
  /**
   * The element's observed attributes
   */
  readonly observedAttributes: Array<string>;
  /**
   * Constructor
   */
  constructor(tagName: string);
  /**
   * Function called when element is to be rendered
   */
  connectedCallback(): void;
  /**
   * Function called when observed element attribute value has changed
   */
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
  /**
   * Update element property value
   */
  setProperty(name: string, value: unknown): void;
  /**
   * Update element attribute value
   */
  setAttribute(name: string, value: string): void;
  /**
   * Render element attributes as string
   */
  renderAttributes(): string;
  /**
   * Render element styles as string for applying to shadow DOM
   */
  renderStyles(): string;
  /**
   * Render element content
   */
  render(): TemplateResult | string | null | undefined;
}
```

Custom `ElementRenderer` instances should subclass the default renderer, and be passed along to the render function:

```js
import { renderToNodeStream } from '@popeindustries/lit-html-server';
import { ElementRenderer } from '@popeindustries/lit-html-server/element-renderer.js';

class MyElementRenderer extends ElementRenderer {
  static matchesClass(ceClass, tagName) {
    return '__myElementIdentifier__' in ceClass;
  }

  render() {
    return this.element.myElementRenderFn();
  }
}

const stream = renderToNodeStream(Layout(data), {
  elementRenderers: [MyElementRenderer],
});
```

> **Note**
> the default `ElementRenderer` will render `innerHTML` strings, or content returned by `this.element.render()`, in either light or shadow DOM.

See [@popeindustries/lit-element](https://github.com/popeindustries/lit/tree/main/packages/lit-element) for `LitElement` support.

### Shadow DOM

If `attachShadow()` has been called by an element during construction/connection, **lit-html-server** will render the custom element content in a [declarative Shadow DOM](https://web.dev/declarative-shadow-dom/):

```html
<!--lit Ph5bNbG/om0=-->
<my-el>
  <!--lit-attr 0-->
  <template shadowroot="open"> <!--lit iW9ZALRtWQA=-->text<!--/lit--> </template>
</my-el>
<!--/lit-->
```

### Disabling server render

For web components that will only be rendered on the client, add the `render:client` attribute to disable server-rendering for that component:

```js
html`<my-el render:client><span slot="my-text">some text</span></my-el>`;
```

### Lazy (partial/deferred) hydration

When rendering web components, **lit-html-server** adds `hydrate:defer` attributes to nested custom elements. This provides a mechanism to control and defer the hydration order of components that may be dependant on data passed from a parent. See [lazy-hydration-mixin](https://github.com/popeindustries/lit/tree/main/packages/lit-html#lazy-hydration-mixin) for more on lazy hydration.

### DOM polyfills

In order to support importing and evaluating custom element code in Node, minimal DOM polyfills are attached to the Node `global` when `@popeindustries/lit-html-server` is imported. See [dom-shim.js](https://github.com/popeindustries/lit/blob/main/packages/lit-html-server/src/dom-shim.js) for details.

> **Warning**
> Depending on the order of imports, the Node process may exit with a `ReferenceError: window is not defined` error. Avoid this error by moving the import of `@popeindustries/lit-html-server` to the top of your file, or import `@popeindustries/lit-html-server/dom-shim.js` directly before all others.

## Directives

_Most_ of the built-in `lit-html/directives/*` already support server-rendering, and work as expected in **lit-html-server**, the exception being those directives that are asynchronous. **lit-html-server** supports the rendering of `Promise` and `AsyncInterator` as first-class primitives, so versions of `async-append.js`, `async-replace.js`, and `until.js` should be imported from `@popeindustries/lit-html-server/directives`.

## Benchmarks

Benchmarks for rendering a complex template in **lit-html-server** vs. [@lit-labs/ssr](https://github.com/lit/lit/tree/main/packages/labs/ssr):

```bash
# @popeindustries/lit-html-server
$ node ./benchmark/perf.js
┌─────────┬────────┬────────┬────────┬────────┬───────────┬──────────┬────────┐
│ Stat    │ 2.5%   │ 50%    │ 97.5%  │ 99%    │ Avg       │ Stdev    │ Max    │
├─────────┼────────┼────────┼────────┼────────┼───────────┼──────────┼────────┤
│ Latency │ 381 ms │ 541 ms │ 553 ms │ 588 ms │ 509.52 ms │ 66.97 ms │ 761 ms │
└─────────┴────────┴────────┴────────┴────────┴───────────┴──────────┴────────┘
┌───────────┬────────┬────────┬────────┬────────┬─────────┬─────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%    │ 97.5%  │ Avg     │ Stdev   │ Min    │
├───────────┼────────┼────────┼────────┼────────┼─────────┼─────────┼────────┤
│ Req/Sec   │ 7939   │ 7939   │ 9207   │ 9327   │ 9092.55 │ 370.06  │ 7938   │
├───────────┼────────┼────────┼────────┼────────┼─────────┼─────────┼────────┤
│ Bytes/Sec │ 150 MB │ 150 MB │ 174 MB │ 175 MB │ 172 MB  │ 6.89 MB │ 150 MB │
└───────────┴────────┴────────┴────────┴────────┴─────────┴─────────┴────────┘
```

```bash
# @lit-labs/ssr
$ node ./benchmark/perf.js ssr
┌─────────┬────────┬─────────┬─────────┬─────────┬────────────┬────────────┬─────────┐
│ Stat    │ 2.5%   │ 50%     │ 97.5%   │ 99%     │ Avg        │ Stdev      │ Max     │
├─────────┼────────┼─────────┼─────────┼─────────┼────────────┼────────────┼─────────┤
│ Latency │ 633 ms │ 4605 ms │ 6353 ms │ 6588 ms │ 3987.46 ms │ 1641.11 ms │ 7517 ms │
└─────────┴────────┴─────────┴─────────┴─────────┴────────────┴────────────┴─────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev  │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼────────┼─────────┤
│ Req/Sec   │ 975     │ 975     │ 1280    │ 1581    │ 1322.7  │ 165.19 │ 975     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼────────┼─────────┤
│ Bytes/Sec │ 20.5 MB │ 20.5 MB │ 26.8 MB │ 33.8 MB │ 27.9 MB │ 3.6 MB │ 20.5 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴────────┴─────────┘
```

(Results from local run on 2022 Macbook Air with Node@19.4.0)

## API

#### `RenderOptions`

The following render methods accept an `options` object with the following properties:

- **`elementRenderers?: Array<ElementRendererConstructor>`** - `ElementRenderer` subclasses for rendering of custom elements.

#### `renderToNodeStream(value: unknown, options?: RenderOptions): Readable`

Returns the `value` (generally the result of a template tagged by `html`) as a Node.js `Readable` stream of markup:

```js
import { html, renderToNodeStream } from '@popeindustries/lit-html-server';

const name = 'Bob';
renderToNodeStream(html`<h1>Hello ${name}!</h1>`).pipe(response);
```

#### `renderToWebStream(value: unknown, options?: RenderOptions): ReadableStream`

Returns the `value` (generally the result of a template tagged by `html`) as a web `ReadableStream` stream of markup:

```js
import { html, renderToWebStream } from '@popeindustries/lit-html-server';

self.addEventListener('fetch', (event) => {
  const name = 'Bob';
  const stream = renderToWebStream(html`<h1>Hello ${name}!</h1>`);
  const response = new Response(stream, {
    headers: {
      'content-type': 'text/html',
    },
  });

  event.respondWith(response);
});
```

> Note: due to the slight differences when running in Node or the browser, a separate version for running in a browser environment is exported as `@popeindustries/lit-html-server/lit-html-service-worker.js`. For those dev servers/bundlers that support conditional `package.json#exports`, exports are provided to enable importing directly from `@popeindustries/lit-html-server`.

### `renderToString(value: unknown, options?: RenderOptions): Promise<string>`

Returns the `value` (generally the result of a template tagged by `html`) as a Promise which resolves to a string of markup:

```js
import { html, renderToString } from '@popeindustries/lit-html-server';

const name = 'Bob';
const markup = await renderToString(html` <h1>Hello ${name}!</h1> `);
response.end(markup);
```

### `renderToBuffer(value: unknown, options?: RenderOptions): Promise<Buffer>`

Returns the `value` (generally the result of a template tagged by `html`) as a Promise which resolves to a `Buffer` of markup:

```js
import { html, renderToBuffer } from '@popeindustries/lit-html-server';

const name = 'Bob';
const markup = await renderToBuffer(html` <h1>Hello ${name}!</h1> `);
response.end(markup);
```
