[![NPM Version](https://img.shields.io/npm/v/@popeindustries/lit-element.svg?style=flat)](https://npmjs.org/package/@popeindustries/lit-element)

# @popeindustries/lit-element

Seamlessly and efficiently use [**@popeindustries/lit-html-server**]() rendered HTML to hydrate **lit-element** web components in the browser, including lazy hydration with `hydrate:idle` or `hydrate:visible` attributes.

## Usage

Install with `npm/yarn/pnpm`:

```bash
$ npm install --save @popeindustries/lit-element
```

Create a web component:

```js
import { css, html, LitElement } from '@popeindustries/lit-element';

class MyEl extends LitElement {
  static styles = css`
    p {
      color: green;
    }
  `;
  render() {
    return html`<p>I am green!</p>`;
  }
}

customElements.define('my-el', MyEl);
```

...render a page template on the server with [`@popeindustries/lit-html-server`]():

```js
import './my-el.js';
import { html, renderToNodeStream } from '@popeindustries/lit-html-server';
import { LitElementRenderer } from '@popeindustries/lit-element/lit-element-renderer.js';
import http from 'node:http';

http.createServer(
  (request, response) => {
    response.writeHead(200);
    renderToNodeStream(html`<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>LitElement example</title>
        </head>
        <body>
          <my-el></my-el>
        </body>
      </html>`).pipe(response);
  },
  {
    // Register a renderer for LitElement components
    renderers: [LitElementRenderer],
    // Enable hydration metadata for all web component sub-trees
    hydratableWebComponents: true,
  },
);
```

...and import the same web component in the browser to trigger hydration/render on changes:

```js
import './my-el.js';
```

> **Note**
> Due to how the `lit*` family of packages are minified and mangled for production, the `@popeindustries/lit-element` package is forced to _vendor_ all dependencies to `lit-element` and `@lit/reactive-element` packages. This shouldn't affect normal use as long as application code does not mix imports from `@popeindustries/lit-element` and `lit-element`.
