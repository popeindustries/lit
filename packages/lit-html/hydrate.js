/**
 * A modified version of `lit-html/experimental-hydrate.js` with the following changes:
 * - allow multiple hydratable subtrees in same container
 * - proxy subsequent calls to `hydrateOrRender` to lit-html's `render`
 * - clear markup and perform clean render on rehydration error
 * - ignore `<!--lit-attr n-->` node-index validation
 */

/**
 * @typedef { import('./hydrate.d.js').ClientChildPart } ClientChildPart
 * @typedef { import('./hydrate.d.js').ClientChildPartState } ClientChildPartState
 * @typedef { import('./hydrate.d.js').ClientRenderOptions } ClientRenderOptions
 */

import { isPrimitive, isSingleExpression, isTemplateResult } from 'lit-html/directive-helpers.js';
import { noChange, render, _$LH } from 'lit-html';
import { PartType } from 'lit-html/directive.js';

const {
  _ChildPart: ChildPart,
  _ElementPart: ElementPart,
  _isIterable: isIterable,
  _resolveDirective: resolveDirective,
  _TemplateInstance: TemplateInstance,
} = _$LH;

const RE_CHILD_MARKER = /^lit |^lit-child/;
const RE_ATTR_LENGTH = /^lit-attr (\d+)/;

/**
 * Hydrate or render existing server-rendered markup inside of a `container` element.
 * Can be called multiple times, automatically hydrating on first call,
 * and efficiently updating via `lit-html#render()` thereafter.
 * More than one hydration sub-tree may be present in the same `container`.
 * Use `options.renderBefore` to identify the hydration sub-tree,
 * otherwise the last sub-tree in `container` will be targeted.
 *
 * Hydration sub-trees are demarcated by `<!--lit XXXXXXXXX-->` and `<!--/lit-->` comment nodes.
 * Sub-trees may be nested and hydrated separately at a later time, as for example with custom element child content.
 * @param { unknown } value
 * @param { HTMLElement | DocumentFragment } container
 * @param { ClientRenderOptions } [options]
 */
export function hydrateOrRender(value, container, options = {}) {
  const partOwnerNode = options.renderBefore ?? container;

  // @ts-expect-error - internal property
  if (partOwnerNode['_$litPart$'] !== undefined) {
    // Already hydrated, so render instead
    render(value, container, options);
    return;
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
    /** @type { ClientChildPart | undefined } */
    let rootPart = undefined;
    /** @type { ClientChildPart | undefined } */
    let currentChildPart = undefined;
    /** @type { Comment | null } */
    let marker;

    /** @type { Array<ClientChildPartState> } */
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
        rootPart ??= currentChildPart;
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
  } catch (err) {
    if (err) {
      console.error(
        `hydration failed due to the following error:\n  ${err}\nClearing nodes and performing clean render`,
      );
    }

    // Clear all server rendered elements if we have found opening/closing comments
    if (openingComment !== null && closingComment !== null) {
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

    render(value, container, options);
  }
}

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
    throw Error(`unable to find enclosing comment nodes in ${startNode.parentElement}`);
  }

  return [openingComment, closingComment];
}

/**
 * Create `ChildPart` and add to the stack.
 * @param { unknown } value
 * @param { Comment } marker
 * @param { Array<ClientChildPartState> } stack
 * @param { ClientRenderOptions } [options]
 */
function openChildPart(value, marker, stack, options) {
  let part;

  if (stack.length === 0) {
    part = new ChildPart(marker, null, undefined, options);
  } else {
    const state = stack[stack.length - 1];

    if (state.type === 'template-instance') {
      part = new ChildPart(marker, null, state.instance, options);
      // @ts-expect-error - internal property
      state.instance._parts.push(part);
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
      /** @type { Array<ClientChildPart> } */ (state.part._$committedValue).push(part);
    } else {
      // Primitive likely rendered on client when TemplateResult rendered on server.
      throw Error('unexpected primitive rendered to part');
    }
  }

  value = resolveDirective(part, value);

  if (value === noChange) {
    stack.push({ part, type: 'leaf' });
  } else if (isPrimitive(value)) {
    part._$committedValue = value;
    stack.push({ part, type: 'leaf' });
    // TODO: primitive instead of TemplateResult. Error?
  } else if (isTemplateResult(value)) {
    if (!marker.data.includes(digestForTemplateStrings(value.strings))) {
      throw Error('unexpected TemplateResult rendered to part');
    }

    // @ts-expect-error - internal method
    const template = ChildPart.prototype._$getTemplate(value);
    const instance = new TemplateInstance(template, part);

    part._$committedValue = instance;
    stack.push({
      instance,
      instancePartIndex: 0,
      part,
      result: value,
      templatePartIndex: 0,
      type: 'template-instance',
    });
  } else if (isIterable(value)) {
    part._$committedValue = [];
    stack.push({
      done: false,
      iterator: value[Symbol.iterator](),
      part,
      type: 'iterable',
      value,
    });
  } else {
    // Fallback for everything else (nothing, Objects, Functions, etc.)
    part._$committedValue = value == null ? '' : value;
    stack.push({ part: part, type: 'leaf' });
  }

  return part;
}

/**
 * Create AttributeParts
 * @param { Comment } comment
 * @param { Array<ClientChildPartState> } stack
 * @param { ClientRenderOptions } [options]
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
      // @ts-expect-error - internal property
      const templatePart = instance._$template.parts[state.templatePartIndex];

      if (
        templatePart === undefined ||
        (templatePart.type !== PartType.ATTRIBUTE && templatePart.type !== PartType.ELEMENT)
      ) {
        break;
      }

      if (templatePart.type === PartType.ATTRIBUTE) {
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

        instancePart._$setValue(value, instancePart, state.instancePartIndex, noCommit);
        state.instancePartIndex += templatePart.strings.length - 1;
        // @ts-expect-error - internal property
        instance._parts.push(instancePart);
      }
      // Element binding
      else {
        const instancePart = new ElementPart(node, state.instance, options);

        resolveDirective(instancePart, state.result.values[state.instancePartIndex++]);
        // @ts-expect-error - internal property
        instance._parts.push(instancePart);
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
 * @param { ClientChildPart | undefined } part
 * @param { Array<ClientChildPartState> } stack
 */
function closeChildPart(marker, part, stack) {
  if (part === undefined) {
    throw Error('unbalanced part marker');
  }

  // @ts-expect-error - internal property
  part._$endNode = marker;

  const currentState = /** @type { ClientChildPartState } */ (stack.pop());

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
 * @see https://github.com/lit/lit/blob/72877fd1de43ccdd579778d5df407e960cb64b03/packages/lit-html/src/experimental-hydrate.ts#L423
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