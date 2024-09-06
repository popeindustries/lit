/**
 * @license
 * Some of this code is copied and modified from `lit-html/experimental-hydrate.js`
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @typedef { import('./index.js').HydrationChildPartState } HydrationChildPartState
 * @typedef { import('./vendor/lit-html.js').AttributePart } AttributePart
 * @typedef { import('./vendor/lit-html.js').ChildPart } ChildPart
 * @typedef { import('./vendor/lit-html.js').ElementPart } ElementPart
 * @typedef { import('./vendor/lit-html.js').RenderOptions } RenderOptions
 * @typedef { import('./vendor/lit-html.js').RootPart } RootPart
 */

import { isPrimitive, isSingleExpression, isTemplateResult } from './vendor/directive-helpers.js';
import { noChange, render as litRender } from './vendor/lit-html.js';
import { PartType } from './vendor/directive.js';
import { _$LH } from './private-ssr-support.js';

export { html, noChange, nothing, svg } from './vendor/lit-html.js';

const {
  ChildPart,
  ElementPart,
  resolveDirective,
  TemplateInstance,
  getPartCommittedValue,
  setPartCommittedValue,
  templateInstanceAddPart,
  getTemplateInstanceTemplatePart,
  setAttributePartValue,
  setChildPartEndNode,
  getChildPartTemplate,
} = _$LH;

const RE_CHILD_MARKER = /^lit |^lit-child/;
const RE_ATTR_LENGTH = /^lit-attr (\d+)/;
const NO_META_ERROR = 'NIL';

/**
 * Hydrate or render existing server-rendered markup inside of a `container` element.
 * @param { unknown } value
 * @param { HTMLElement | DocumentFragment } container
 * @param { RenderOptions } [options]
 * @returns { RootPart }
 */
export function render(value, container, options = {}) {
  const partOwnerNode = options.renderBefore ?? container;

  // @ts-expect-error - internal property
  if (partOwnerNode['_$litPart$'] !== undefined) {
    // Already hydrated, so render instead
    litRender(value, container, options);
    // @ts-expect-error - internal property
    return partOwnerNode['_$litPart$'];
  }

  /** @type { Comment | null } */
  let openingComment = null;
  /** @type { Comment | null } */
  let closingComment = null;

  try {
    // Since `container` can have more than one hydratable template,
    // find nearest closing and opening *sibling* comments to isolate hydratable elements.
    // Start from last `container` child, or `renderBefore` node if specified.
    const startNode = /** @type { Node } */ (options.renderBefore ?? container.lastChild);
    [openingComment, closingComment] = findEnclosingCommentNodes(startNode);

    let active = false;
    /** @type { HTMLElement | null } */
    let nestedTreeParent = null;
    // Walk comment nodes, ignoring those outside of our opening/closing comment nodes,
    // and skipping any nested roots found in between.
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_COMMENT, (node) => {
      const markerText = /** @type { Comment } */ (node).data;

      // Begin walking when opening comment found...
      if (node === openingComment) {
        active = true;
        return NodeFilter.FILTER_ACCEPT;
      }
      // ...but disable walking if we encounter a nested root...
      else if (active && markerText.startsWith('lit ')) {
        active = false;
        // Store parent element to use to later identify closing node (which must be a sibling)
        nestedTreeParent = node.parentElement;
        return NodeFilter.FILTER_SKIP;
      }
      // ...and re-enable walking when end of nested root found...
      else if (!active && markerText === '/lit' && node.parentElement === nestedTreeParent) {
        active = true;
        nestedTreeParent = null;
        return NodeFilter.FILTER_SKIP;
      }
      // ...and stop walking when closing comment found
      else if (node === closingComment) {
        active = false;
        return NodeFilter.FILTER_ACCEPT;
      }

      return active ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    });
    /** @type { RootPart | undefined } */
    let rootPart = undefined;
    /** @type { ChildPart | undefined } */
    let currentChildPart = undefined;
    /** @type { Comment | null } */
    let marker;

    /** @type { Array<HydrationChildPartState> } */
    const stack = [];

    // @ts-expect-error - only walking comments
    while ((marker = walker.nextNode()) !== null) {
      const markerText = marker.data;

      if (RE_CHILD_MARKER.test(markerText)) {
        if (stack.length === 0 && rootPart !== undefined) {
          throw Error('must be only one root part per container');
        }
        // Create a new ChildPart and push to top of stack
        currentChildPart = openChildPart(value, marker, stack, options);
        rootPart ??= /** @type { RootPart } */ (currentChildPart);
      } else if (markerText.startsWith('lit-attr')) {
        // Create AttributeParts for current ChildPart at top of the stack
        createAttributeParts(marker, stack, options);
      } else if (markerText.startsWith('/lit-child')) {
        if (stack.length === 1 && currentChildPart !== rootPart) {
          throw Error('internal error');
        }
        // Close current ChildPart, and pop off the stack
        currentChildPart = closeChildPart(marker, currentChildPart, stack);
      }
    }
    if (rootPart === undefined) {
      throw Error('there should be exactly one root part in a render container');
    }

    // @ts-expect-error - internal property
    partOwnerNode['_$litPart$'] = rootPart;
    return rootPart;
  } catch (err) {
    if (err && /** @type { Error } */ (err).message !== NO_META_ERROR) {
      console.error(err);
    }

    // Clear all server rendered elements if we have found opening/closing comments
    if (openingComment !== null && closingComment !== null) {
      console.error(
        `Hydration failed at lit comment: "${openingComment.data}". Clearing nodes and performing clean render`,
      );
      /** @type { Node | null } */
      let node = closingComment;

      while (node && node !== openingComment) {
        /** @type { Node | null } */
        const previousSibling = node.previousSibling;
        partOwnerNode.removeChild(node);
        node = previousSibling;
      }
      partOwnerNode.removeChild(openingComment);
    }

    return litRender(value, container, options);
  }
}

// Added for lit-html compat
render.setSanitizer = litRender.setSanitizer;
render.createSanitizer = litRender.createSanitizer;

/**
 * Find opening/closing root comment nodes.
 * Root comments take the form `<!--lit XXXXXXXXX--><!--/lit-->`,
 * and identify ChildPart sub-trees that may be hydrated.
 * Starting at `startNode`, traverse previous siblings until comment nodes are found.
 * @param { Node } startNode
 * @returns { [Comment, Comment] }
 */
function findEnclosingCommentNodes(startNode) {
  /** @type { Comment | null } */
  let closingComment = null;
  /** @type { Comment | null } */
  let openingComment = null;
  /** @type { Node | null } */
  let node = startNode;

  while (node != null) {
    // Comments only
    if (node.nodeType === 8) {
      const comment = /** @type { Comment } */ (node);

      if (closingComment === null && comment.data === '/lit') {
        closingComment = comment;
      } else if (comment.data.startsWith('lit ')) {
        openingComment = comment;
        break;
      }
    }
    node = node.previousSibling;
  }

  if (openingComment === null || closingComment === null) {
    throw Error(NO_META_ERROR);
  }

  return [openingComment, closingComment];
}

/**
 * Create `ChildPart` and add to the stack.
 * @param { unknown } value
 * @param { Comment } marker
 * @param { Array<HydrationChildPartState> } stack
 * @param { RenderOptions } [options]
 */
function openChildPart(value, marker, stack, options) {
  let part;

  if (stack.length === 0) {
    part = new ChildPart(marker, null, undefined, options);
  } else {
    const state = stack[stack.length - 1];

    if (state.type === 'template-instance') {
      part = new ChildPart(marker, null, state.instance, options);
      templateInstanceAddPart(state.instance, part);
      value = state.result.values[state.instancePartIndex++];
      state.templatePartIndex++;
    } else if (state.type === 'iterable') {
      part = new ChildPart(marker, null, state.part, options);
      const result = state.iterator.next();

      if (result.done) {
        value = undefined;
        state.done = true;
        throw Error('shorter than expected iterable');
      } else {
        value = result.value;
      }
      /** @type { Array<ChildPart> } */ (getPartCommittedValue(state.part)).push(part);
    } else {
      // Primitive likely rendered on client when TemplateResult rendered on server.
      throw Error('unexpected primitive rendered to part');
    }
  }

  value = resolveDirective(part, value);

  if (value === noChange) {
    stack.push({ part, type: 'leaf' });
  } else if (isPrimitive(value)) {
    setPartCommittedValue(part, value);
    stack.push({ part, type: 'leaf' });
    // TODO: primitive instead of TemplateResult. Error?
  } else if (isTemplateResult(value)) {
    if (!marker.data.includes(digestForTemplateStrings(value.strings))) {
      throw Error('unexpected TemplateResult rendered to part');
    }

    const template = getChildPartTemplate(value);
    const instance = new TemplateInstance(template, part);

    setPartCommittedValue(part, instance);
    stack.push({
      instance,
      instancePartIndex: 0,
      part,
      result: value,
      templatePartIndex: 0,
      type: 'template-instance',
    });
  } else if (isIterable(value)) {
    setPartCommittedValue(part, []);
    stack.push({
      done: false,
      iterator: value[Symbol.iterator](),
      part,
      type: 'iterable',
      value,
    });
  } else {
    // Fallback for everything else (nothing, Objects, Functions, etc.)
    setPartCommittedValue(part, value == null ? '' : value);
    stack.push({ part: part, type: 'leaf' });
  }

  return part;
}

/**
 * Create AttributeParts
 * @param { Comment } comment
 * @param { Array<HydrationChildPartState> } stack
 * @param { RenderOptions } [options]
 */
function createAttributeParts(comment, stack, options) {
  // Void elements, which have no closing tag, are siblings of the comment,
  // all others are parents.
  const node = comment.previousElementSibling ?? comment.parentElement;

  if (node === null) {
    throw Error('could not find node for attribute parts');
  }

  const state = stack[stack.length - 1];

  if (state.type === 'template-instance') {
    const { instance } = state;
    // Attribute comments include number of parts for this node,
    // so parse the value and use for the loop limit.
    const n = parseInt(RE_ATTR_LENGTH.exec(comment.data)?.[1] ?? '0');

    for (let i = 0; i < n; i++) {
      const templatePart = getTemplateInstanceTemplatePart(instance, state.templatePartIndex);

      if (
        templatePart === undefined ||
        (templatePart.type !== PartType.ATTRIBUTE && templatePart.type !== PartType.ELEMENT)
      ) {
        break;
      }

      if (templatePart.type === PartType.ATTRIBUTE) {
        // @ts-ignore
        const instancePart = new templatePart.ctor(
          node,
          templatePart.name,
          templatePart.strings,
          state.instance,
          options,
        );
        const value = isSingleExpression(instancePart)
          ? state.result.values[state.instancePartIndex]
          : state.result.values;
        // Avoid touching DOM for types other than event/property
        const noCommit = !(instancePart.type === PartType.EVENT || instancePart.type === PartType.PROPERTY);

        setAttributePartValue(instancePart, value, state.instancePartIndex, noCommit);
        // @ts-ignore
        state.instancePartIndex += templatePart.strings.length - 1;
        templateInstanceAddPart(instance, instancePart);
      }
      // Element binding
      else {
        const instancePart = new ElementPart(node, state.instance, options);

        resolveDirective(instancePart, state.result.values[state.instancePartIndex++]);
        templateInstanceAddPart(instance, instancePart);
      }

      state.templatePartIndex++;
    }

    node.removeAttribute('hydrate:defer');
  } else {
    throw Error('internal error');
  }
}

/**
 * Close the current ChildPart and remove from the stack
 * @param { Comment } marker
 * @param { ChildPart | undefined } part
 * @param { Array<HydrationChildPartState> } stack
 */
function closeChildPart(marker, part, stack) {
  if (part === undefined) {
    throw Error('unbalanced part marker');
  }

  setChildPartEndNode(part, marker);

  const currentState = /** @type { HydrationChildPartState } */ (stack.pop());

  if (currentState.type === 'iterable') {
    if (!currentState.iterator.next().done) {
      throw Error('longer than expected iterable');
    }
  }

  if (stack.length > 0) {
    return stack[stack.length - 1].part;
  } else {
    return undefined;
  }
}

/**
 * Generate hash from template "strings".
 * @param { TemplateStringsArray } strings
 */
function digestForTemplateStrings(strings) {
  const digestSize = 2;
  const hashes = new Uint32Array(digestSize).fill(5381);

  for (const s of strings) {
    for (let i = 0; i < s.length; i++) {
      hashes[i % digestSize] = (hashes[i % digestSize] * 33) ^ s.charCodeAt(i);
    }
  }
  return btoa(String.fromCharCode(...new Uint8Array(hashes.buffer)));
}

/**
 * Determine if "iterator" is a synchronous iterator
 * @param { unknown } iterator
 * @returns { iterator is Iterable<unknown> }
 */
function isIterable(iterator) {
  return (
    iterator != null &&
    (Array.isArray(iterator) || typeof (/** @type { Iterable<unknown> } */ (iterator)[Symbol.iterator]) === 'function')
  );
}
