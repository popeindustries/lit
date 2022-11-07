# @popeindustries/lit-html-server

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
