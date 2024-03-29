[![NPM Version](https://img.shields.io/npm/v/@popeindustries/lit.svg?style=flat)](https://npmjs.org/package/@popeindustries/lit)

# @popeindustries/lit

A convenient, all-in-one package for server-rendering and hydrating [**lit**](https://lit.dev) templates and web components.

## Features

- fast, streaming, Node.js server or `ServiceWorker` rendering
- seamless and efficient client-hydration via `render()`
- compatible with all synchronous directives
- proxies asynchronous directives for server streaming
- extensive web component features:
  - server render and hydrate light or shadow DOM
  - default support for `element.innerHTML` and `element.render()`
  - lazy client-hydration with `hydrate:idle` and `hydrate:visible` attributes
  - `LitElement` base class support
  - render any base class with a custom `ElementRenderer`

## Usage

Install with `npm/yarn/pnpm`:

```bash
$ npm install --save @popeindustries/lit
```

Author templates (see [lit-html](https://github.com/popeindustries/lit/tree/main/packages/lit-html)):

```js
import { html, svg, render } from '@popeindustries/lit';
import { directive } from '@popeindustries/lit/directive.js';
import { until } from '@popeindustries/lit/directives/until.js';
```

Author LitElement web components (see [lit-element](https://github.com/popeindustries/lit/tree/main/packages/lit-element)):

```js
import { css, LitElement } from '@popeindustries/lit';
import { LitElementRenderer } from '@popeindustries/lit/lit-element-renderer.js';
```

Author custom web components (see [lit-html-server](https://github.com/popeindustries/lit/tree/main/packages/lit-html-server)):

```js
import { ElementRenderer } from '@popeindustries/lit/element-renderer.js';
import { lazyHydrationMixin } from '@popeindustries/lit/lazy-hydration-mixin.js';
```

Server render templates and web components (see [lit-html-server](https://github.com/popeindustries/lit/tree/main/packages/lit-html-server)):

```js
import { renderToNodeStream, renderToString, renderToWebStream } from '@popeindustries/lit/html-server.js';
```
