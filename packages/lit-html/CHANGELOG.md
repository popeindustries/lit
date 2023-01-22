# @popeindustries/lit-html

## 5.2.0

### Minor Changes

- b8fa4c0: [**Breaking** `@popeindustries/lit-html-server`] No longer shim `window` object in server environment.

  Upgrade vendored `lit/*` packages to latest versions.

## 5.1.0

### Minor Changes

- 696d2be: Upgrade to `lit@2.4.0`
  Add `isServer: boolean` utility
  Upgrade dev dependencies

## 5.0.6

### Patch Changes

- 018ee84: - Fix minification of vendored modules
  - (lit-html-server) import from `@popeindustries/lit-html`
  - upgrade dev dependencies

## 5.0.5

### Patch Changes

- c816b31: Add directives folder to package.json#file to include directives folder in package, but keep it ignored from git

## 5.0.4

### Patch Changes

- 2f15655: Fix package.json exports to avoid wildcards

## 5.0.3

### Patch Changes

- e3e91a4: Fix types for vendored packages

## 5.0.2

### Patch Changes

- 148cc28: fix dom-shim and hydration error log

## 5.0.1

### Patch Changes

- 15c7be9: Upgrade vendored dependencies
