/**
 * @license
 * Some of this code is copied and modified from `lit-html/experimental-hydrate.js`
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { ChildPart, RenderOptions, RootPart, SanitizerFactory, TemplateResult } from 'lit-html';

export * from 'lit-html';

/**
 * Hydrate or render existing server-rendered markup inside of a `container` element.
 * Can be called multiple times, automatically hydrating on first call,
 * and efficiently updating via `lit-html#render()` thereafter.
 * More than one hydration sub-tree may be present in the same `container`.
 * Use `options.renderBefore` to identify placement of the hydration sub-tree,
 * otherwise the last sub-tree in `container` will be targeted.
 *
 * Hydration sub-trees are demarcated by `<!--lit XXXXXXXXX-->` and `<!--/lit-->` comment nodes.
 * Sub-trees may be nested and hydrated separately at a later time, as for example with custom element child content.
 */
export const render: {
  (value: unknown, container: HTMLElement | DocumentFragment, options?: RenderOptions): RootPart;
  setSanitizer: (newSanitizer: SanitizerFactory) => void;
  createSanitizer: SanitizerFactory;
};

export type HydrationChildPartState =
  | {
      type: 'leaf';
      part: ChildPart;
    }
  | {
      type: 'iterable';
      part: ChildPart;
      value: Iterable<unknown>;
      iterator: Iterator<unknown>;
      done: boolean;
    }
  | {
      type: 'template-instance';
      part: ChildPart;
      result: TemplateResult;
      instance: InstanceType<typeof import('lit-html')['_$LH']['_TemplateInstance']>;
      templatePartIndex: number;
      instancePartIndex: number;
    };
