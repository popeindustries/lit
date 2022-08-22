This is a repo for the `@popeindustries/lit*` family of libraries, which enable fast server-rendering and client-hydration of [lit-html]() templates and web components:

- [`@popeindustries/lit`](): A convenient, all-in-one package for rendering and hydrating templates and web components.
- [`@popeindustries/lit-html`](): Use server rendered HTML to hydrate templates and web components in the browser.
- [`@popeindustries/lit-html-server`](): Render streaming templates on the server or in a ServiceWorker.
- [`@popeindustries/lit-element`](): Use server rendered HTML to hydrate `LitElement` web components in the browser.

## Why does this exist?

In 2018, a year or so after Google announced [lit-html](https://www.youtube.com/watch?v=Io6JjgckHbg), `@popeindustries/lit-html-server` was created to explore the possibility of using tagged-template literals, and the lit-html syntax, as a DSL for a streaming HTML rendering library. Initially inspired by [`stream-template`](https://github.com/almost/stream-template), the early prototype worked remarkably well, and the project was made public and presented to the lit-html team. At that time, server rendering was very low on the priority list, so work continued, and `lit-html-server` was put into production.

Three years later, Google introduced their own answer to server-rendered lit-html in the form of [`@lit-labs/ssr`](https://github.com/lit/lit/tree/main/packages/labs/ssr). This experimental renderer for the new **lit** ecosystem turned out to be very different than `lit-html-server`, both architecturally and strategically. Basically, Google wanted a server solution to render templates and web components _exactly_ as they are rendered on the client: inside the `<body>`, without async expressions, and packaged in a shadow DOM (for web components). `lit-html-server`, on the other hand, has always embraced the lit-html syntax as a clean and simple language for renderering _all_ of HTML, with first-class async expression (Promises and AsyncIterators) support for in-order streaming.

Although it was a dissapointment that `@lit-labs/ssr` wasn't going to be a feature-for-feature replacement for `lit-html-server`, it did supply an answer to the missing half of a complete server-rendering solution: client-side rehydration of server-rendered templates! The new `hydrate()` support made an efficient end-to-end solution possible, but on closer inspection, it appeared that it too had missing features.

So, although it was always the plan to retire this project if/when official support for server-rendering landed, the limitations proved too numerous, and in the summer of 2022, work was started on an improved, and complete, server-rendering and client-hydration solution.

### The differences between `lit` and `@popeindustries/lit`

#### Server-rendering

- 6-7x faster for production workloads
- full HTML support (`<html>`, `<head>`, and `<body>`)
- first-class async expression support (Promise, AsyncIterator, etc)
- optional hydration metadata
- web component rendering to light or shadow DOM
- web component rendering with `innerHTML`
- render to web stream in a ServiceWorker

#### Client-hydration

- seamless hydration or render with single `render()` function
- multiple hydration roots in same container
- automatic recovery from hydration errors
- lazy-hydration with `hydrate:idle` and `hydrate:visible`
