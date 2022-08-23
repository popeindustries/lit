[![NPM Version](https://img.shields.io/npm/v/@popeindustries/lit-html.svg?style=flat)](https://npmjs.org/package/@popeindustries/lit-html)

# @popeindustries/lit-html

Seamlessly and efficiently use [@popeindustries/lit-html-server](https://github.com/popeindustries/lit/tree/main/packages/lit-html-server/) rendered HTML to hydrate **lit-html** templates in the browser.

## Features

- seamless hydration: first call to `render()` will hydrate if possible, with subsequent calls updating the existing DOM by forwarding to `lit-html.render()`.
- hydration errors will cause the server rendered markup to be cleared and replaced with the result of `lit-html.render()`.
- render multiple sub-trees in the same container.
- easily enable lazy (partial/deferred) web component hydration with `lazy-hydration-mixin` and `hydrate:idle` or `hydrate:visible` attributes.

## Usage

Install with `npm/yarn/pnpm`:

```bash
$ npm install --save @popeindustries/lit-html
```

Given the following server rendered HTML:

```html
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
```

...import your **lit-html** templates used on the server:

```js
import { html } from '@popeindustries/lit-html';

function renderMenu(data) {
  const { negative, sections } = data;
  return html`<nav ?negative="${negative}">${sections.map((section) => html`<button>${section}</button>`)}</nav>`;
}
function renderPage(data) {
  return html`<main>This is the main page content.</main>`;
}
```

...and render:

```js
import { render } from '@popeindustries/lit-html';

render(renderMenu(data), document.body, { renderBefore: document.querySelector('body > p') });
render(renderPage(data), document.body, { renderBefore: document.querySelector('body > footer') });
```

> **Note**
> Due to how the `lit*` family of packages are minified and mangled for production, the `@popeindustries/lit-html` package is forced to _vendor_ the `lit-html` package. This shouldn't affect normal use as long as application code does not mix imports from `@popeindustries/lit-html` and `lit-html`.

## `lazy-hydration-mixin`

When hydrating sub-trees containing nested web components, it is often necessary to control the hydration order to allow parent elements to pass data down to their children. When rendering web components on the server, **lit-html-server** adds a `hydrate:defer` attribute that may be used to determine when hydration should take place.

The `lazy-hydration-mixin` is an easy way to add support for basic hydration deferral by delaying the call to the base class's `connectedCallback()` method:

```js
import { html, render } from '@popeindustries/lit-html';
import { partialHydrationMixin } from '@popeindustries/lit-html/lazy-hydration-mixin.js';

class MyBaseClass extends HTMLElement {
  // Called when `hydrate:defer` attribute is removed
  connectedCallback() {
    render(this.render(), this, { host: this });
  }
}

class MyEl extends partialHydrationMixin(MyBaseClass) {
  // Called by browser when instance connected
  connectedCallback() {
    super.connectedCallback(); // `super` here is the mixin class
  }
  render() {
    return html`<span>some content</span>`;
  }
}
```

This simple mechanism also enables additional forms of deferral, and the `lazy-hydration-mixin` includes two additional strategies:

#### `hydrate:idle`

Adding the `hydrate:idle` attribute to the element waits until the browser has performed any pending high priority work before hydrating the element (requires the `requestIdleCallback` API, otherwise it falls back to default behaviour):

```html
<my-el hydrate:idle></my-el>
```

#### `hydrate:visible`

Adding the `hydrate:visible` attribute to the element waits until the element is visible in the viewport before hydrating the element (requires the `IntersectionObserver` API, otherwise it falls back to default behaviour).

```html
<my-el hydrate:visible></my-el>
```
