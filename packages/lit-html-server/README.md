[![NPM Version](https://img.shields.io/npm/v/@popeindustries/lit-html-server.svg?style=flat)](https://npmjs.org/package/@popeindustries/lit-html-server)
[![Build Status](https://img.shields.io/github/workflow/status/popeindustries/lit-html-server/test/master)](https://github.com/popeindustries/lit-html-server/actions)

# lit-html-server

Render [**lit-html**](https://github.com/lit/lit) templates on the server as strings or streams (and in the browser too!). Supports all **lit-html** types, special attribute expressions, and many of the standard directives.

> Although based on **lit-html** semantics, **lit-html-server** is a great general purpose HTML template streaming library. Tagged template literals are a native JavaScript feature, and the HTML rendered is 100% standard markup, with no special syntax or runtime required!

## Usage

Install with `npm/yarn/pnpm`:

```bash
$ npm install --save @popeindustries/lit-html-server
```

...write your **lit-html** template:

```js
import { html } from 'lit-html'; // or from '@popeindustries/lit-html-server'
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
    <my-widget ?enabled="${data.hasWidget}"></my-widget>
    <p class="${classMap({ negative: data.invertedText })}">${data.text}</p>
  `;
}
```

...and render (plain HTTP server example, though similar for Express/Fastify/etc):

```js
import http from 'http';
import { renderToNodeStream } from '@popeindustries/lit-html-server';

http.createServer((request, response) => {
  const data = { title: 'Home', api: '/api/home' };
  response.writeHead(200);
  // Returns a Node.js Readable stream which can be piped to "response"
  renderToNodeStream(Layout(data)).pipe(response);
});
```

## Hydration

Server rendered HTML may be converted to live **lit-html** templates with the help of inline metadata. This process of reusing static HTML to seemlessly bootstrap dynamic templates is often referred to as _hydration_. **lit-html-server** does not output hydration metadata by default, but instead requires that a sub-tree is designated as _hydratable_ via the `rehydratable` directive:

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

In order to efficiently reuse templates on the client (`renderMenu` and `renderPage` in the example above), they should be hydrated and rendered with the help of [`@popeindustries/lit-html`]().

## Web Components

The rendering of custom element content is largely handled by custom `ElementRenderer` instances that adhere to the following interface:

```ts
declare class ElementRenderer {
  /**
   * Should return true when given custom element class and/or tag name
   * should be handled by this renderer.
   */
  static matchesClass(ceClass: typeof HTMLElement, tagName: string): boolean;
  /**
   * The custom element instance.
   */
  element: HTMLElement;
  /**
   * The custom element tag name.
   */
  tagName: string;
  /**
   * Constructor.
   */
  constructor(tagName: string);
  /**
   * Function called when element is to be rendered.
   */
  connectedCallback(): void;
  /**
   * Function called when observed element attribute value has changed.
   */
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
  /**
   * Update element property value.
   */
  setProperty(name: string, value: unknown): void;
  /**
   * Update element attribute value.
   */
  setAttribute(name: string, value: string): void;
  /**
   * Render element attributes as string.
   */
  renderAttributes(): string;
  /**
   * Render element content.
   */
  render(): TemplateResult | string | null;
}
```

Custom `ElementRenderer` instances should subclass the default renderer, and be passed along to the render function:

```js
import { ElementRenderer, renderToNodeStream } from '@popeindustries/lit-html-server';

class MyElementRenderer extends ElementRenderer {
  static matchesClass(ceClass, tagName) {
    return '__myCompIdentifier__' in ceClass;
  }

  render() {
    return this.element.myCompRenderFn();
  }
}

const stream = renderToNodeStream(Layout(data), { elementRenderers: [MyElementRenderer] });
```

Note that the default `ElementRenderer` will render `innerHTML` content or content returned by `this.element.render()`.

### Shadow DOM

If `attachShadow` has been called by an element during construction/connection, **lit-html-server** will render the custom element content in a [declarative Shadow DOM](https://web.dev/declarative-shadow-dom/):

```html
<!--lit Ph5bNbG/om0=-->
<my-el hydrate:defer>
  <!--lit-attr 0--><template shadowroot="open"><!--lit iW9ZALRtWQA=-->text<!--/lit--> </template>
</my-el>
<!--/lit-->
```

### DOM polyfills

In order to support importing and evaluating custom element code in Node, minimal DOM polyfills are attached to the Node `global` when **lit-html-server** is imported. See [`dom-shim.js`](/src/dom-shim.js) for details.

## Directives

_Most_ of the built-in `lit-html/directives/*` already support server rendering, and work as expected in **lit-html-server**, the exception being those directives that are asynchronous. **lit-html-server** supports the rendering of Promises and AsyncInterators as first-class primitives, so special versions of `async-append.js`, `async-replace.js`, and `until.js` are included in `lit-html-server/directives`.

## API (Node.js)

> The following render methods accept an `options` object with the following properties:
>
> - **`elementRenderers?: Array<ElementRendererConstructor>`** - ElementRenderer subclasses for rendering of custom elements

### `renderToNodeStream(value: unknown, options?: RenderOptions): Readable`

Returns the `value` (generally the result of a template tagged by `html`) as a Node.js `Readable` stream of markup:

```js
import { html, renderToNodeStream } from '@popeindustries/lit-html-server';

const name = 'Bob';
renderToNodeStream(html`<h1>Hello ${name}!</h1>`).pipe(response);
```

### `renderToWebStream(value: unknown, options?: RenderOptions): ReadableStream`

Returns the `value` (generally the result of a template tagged by `html`) as a web `ReadableStream` stream of markup:

```js
import { html, renderToWebStream } from '@popeindustries/lit-html-server';

self.addEventListener('fetch', (event) => {
  const name = 'Bob';
  const stream = renderToStream(html`<h1>Hello ${name}!</h1>`);
  const response = new Response(stream, {
    headers: {
      'content-type': 'text/html',
    },
  });

  event.respondWith(response);
});
```

> Note: due to the slight differences when running in Node or the browser, a separate version for running in the browser is exported as `@popeindustries/lit-html-server/lit-html-server-in-worker.js`. For those dev servers/bundlers that support conditional `package.json#exports`, exports are provided for (`browser/worker/serviceworker/sw`) to allow seamlessly importing directly from `@popeindustries/lit-html-server`.

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
