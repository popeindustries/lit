[![NPM Version](https://img.shields.io/npm/v/@popeindustries/lit.svg?style=flat)](https://npmjs.org/package/@popeindustries/lit)

# @popeindustries/lit

A convenient, all-in-one package for server rendering and hydrating [**lit-html**]() templates and web components.

## Features

- fast, streaming, Node.js server or ServiceWorker rendering
- seamless and efficient client hydration via `render()`
- compatible with all synchronous **lit-html** directives
- proxies asynchronous directives for true server streaming
- extensive web component features:
  - server render and hydrate _light_ or _shadow_ DOM
  - default support for `innerHTML` and `render()`
  - lazy client hydration with `hydrate:idle` and `hydrate:visible` attributes
  - **LitElement** base class support
  - render any base class with a custom `ElementRenderer`

## Usage

Install with `npm/yarn/pnpm`:

```bash
$ npm install --save @popeindustries/lit
```
