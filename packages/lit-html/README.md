[![NPM Version](https://img.shields.io/npm/v/@popeindustries/lit-html.svg?style=flat)](https://npmjs.org/package/@popeindustries/lit-html)

# @popeindustries/lit-html

Enable hydration of **lit-html** templates rendered on the server with [@popeindustries/lit-html-server]().

## Usage

Install with `npm/yarn/pnpm`:

```bash
$ npm install --save @popeindustries/lit-html
```

...import your **lit-html** template used on the server:

```js
function renderMenu(data) {
  const { negative, sections } = data;
  return html`<nav ?negative="${negative}">${sections.map((section) => html`<button>${section}</button>`)}</nav>`;
}
```

...and render:

```js
import { render } from '@popeindustries/lit-html';

render(renderMenu(data), document.body, { renderBefore: document.querySelector('body > p') });
```

## Features

- fist call to `render()` on a container with valid server rendered metadata will efficiently hydrate the template.
- subsequent calls to `render()` will be forwarded to `lit-html.render()`.
- any hydration errors will cause the server rendered markup to be cleared and replaced with the result of `lit-html.render()`.
- multiple sub-trees supported in the same container.

## `partial-hydration-mixin`
