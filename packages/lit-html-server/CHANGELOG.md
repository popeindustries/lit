# @popeindustries/lit-html-server

## 6.1.3

### Patch Changes

- Updated dependencies [0eebb50]
  - @popeindustries/lit-html@5.2.4

## 6.1.2

### Patch Changes

- Updated dependencies [679c575]
  - @popeindustries/lit-html@5.2.3

## 6.1.1

### Patch Changes

- Updated dependencies [e3e4d0c]
  - @popeindustries/lit-html@5.2.2

## 6.1.0

### Minor Changes

- b1ad2f2: Updates built lit-html-server.js to import from `@popeindustries/lit-html` rather than bundle itself.

## 6.0.1

### Patch Changes

- d213c5b: Removing console.warn about a custom tag being an undefined custom element
- Updated dependencies [dbbde2d]
  - @popeindustries/lit-html@5.2.1

## 6.0.0

### Major Changes

- b8fa4c0: [**Breaking** `@popeindustries/lit-html-server`] No longer shim `window` object in server environment.

  Upgrade vendored `lit/*` packages to latest versions.

### Patch Changes

- Updated dependencies [b8fa4c0]
  - @popeindustries/lit-html@5.2.0

## 5.1.1

### Patch Changes

- 3fbb659: Fix hydration of `unsafeSVG` and `unsafeHTML` directives
- ebe456a: Fix bug in RE_CUSTOM_ELEMENT only matching cd tag names with one dash, not multiple.

## 5.1.0

### Minor Changes

- 696d2be: Upgrade to `lit@2.4.0`
  Add `isServer: boolean` utility
  Upgrade dev dependencies

### Patch Changes

- Updated dependencies [696d2be]
  - @popeindustries/lit-html@5.1.0

## 5.0.6

### Patch Changes

- a4e93d9: fix memory leak when handling unsafeHTML/unsafeSVG directives

## 5.0.5

### Patch Changes

- 018ee84: - Fix minification of vendored modules
  - (lit-html-server) import from `@popeindustries/lit-html`
  - upgrade dev dependencies
- Updated dependencies [018ee84]
  - @popeindustries/lit-html@5.0.6

## 5.0.4

### Patch Changes

- 2f15655: Fix package.json exports to avoid wildcards

## 5.0.3

### Patch Changes

- 1b29988: Fix re-render of empty child node

## 5.0.2

### Patch Changes

- 0870117: remove `options.hydratableWebComponents`

## 5.0.1

### Patch Changes

- 148cc28: fix dom-shim and hydration error log
