/**
 * A modified version of `lit-html/experimental-hydrate.js` with the following changes:
 * - allow multiple hydratable subtrees in same container
 * - proxy subsequent calls to `hydrateOrRender` to lit-html's `render`
 * - clear markup and perform clean render on rehydration error
 * - ignore `<!--lit-attr n-->` node-index validation
 */

import { isPrimitive, isSingleExpression, isTemplateResult } from 'lit-html/directive-helpers.js';
import { noChange, render, _$LH } from 'lit-html';
import { digestForTemplateStrings } from './internal/browser-digest.js';
import { PartType } from 'lit-html/directive.js';

const {
  _ChildPart: ChildPart,
  _ElementPart: ElementPart,
  _isIterable: isIterable,
  _resolveDirective: resolveDirective,
  _TemplateInstance: TemplateInstance,
} = _$LH;

/**
 * Hydrate or render existing server-rendered markup.
 * Can be called multiple times, automatically hydrating on first call,
 * and efficiently updating via `render` thereafter.
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
    // Start from last `container` child or `renderBefore` node if specified.
    const startNode = /** @type { Node } */ (options.renderBefore ?? container.lastChild);
    [openingComment, closingComment] = findEnclosingCommentNodes(startNode);

    let active = false;
    // Walk comment nodes, skipping those outside of our opening/closing comment tags
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_COMMENT, (node) => {
      if (node === closingComment) {
        active = false;
        return NodeFilter.FILTER_ACCEPT;
      } else if (active || node === openingComment) {
        active = true;
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
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

      if (markerText.startsWith('lit-child')) {
        if (stack.length === 0 && rootPart !== undefined) {
          throw Error('must be only one root part per container');
        }
        currentChildPart = openChildPart(value, marker, stack, options);
        rootPart ??= currentChildPart;
      } else if (markerText.startsWith('lit-attr')) {
        createAttributeParts(marker, stack, options);
      } else if (markerText.startsWith('/lit-child')) {
        if (stack.length === 1 && currentChildPart !== rootPart) {
          throw Error('internal error');
        }
        currentChildPart = closeChildPart(marker, currentChildPart, stack);
      }
    }
    if (rootPart === undefined) {
      throw Error('there should be exactly one root part in a render container');
    }

    // @ts-expect-error - internal property
    partOwnerNode['_$litPart$'] = rootPart;
  } catch (err) {
    if (openingComment !== null && closingComment !== null) {
      console.error(
        `hydration failed due to the following error:\n  ${err}\nClearing nodes and performing clean render`,
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

    render(value, container, options);
  }
}

/**
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
    // Comment
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
 * @param { unknown } value
 * @param { Comment } marker
 * @param { Array<ClientChildPartState> } stack
 * @param { ClientRenderOptions } [options]
 */
function openChildPart(value, marker, stack, options) {
  console.log(marker.data, value);
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
      // TODO: unexpected. Error?
      part = new ChildPart(marker, null, state.part, options);
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
    const markerWithDigest = `lit-child ${digestForTemplateStrings(value.strings)}`;

    if (marker.data !== markerWithDigest) {
      throw Error('unexpected TemplateResult rendered to part');
    }

    // @ts-expect-error - internal method
    const template = ChildPart.prototype._$getTemplate(value);
    const instance = new TemplateInstance(template, part);

    part._$committedValue = instance;
    stack.push({
      type: 'template-instance',
      instance,
      part,
      templatePartIndex: 0,
      instancePartIndex: 0,
      result: value,
    });
  } else if (isIterable(value)) {
    part._$committedValue = [];
    stack.push({
      part: part,
      type: 'iterable',
      value,
      iterator: value[Symbol.iterator](),
      done: false,
    });
  } else {
    part._$committedValue = value == null ? '' : value;
    stack.push({ part: part, type: 'leaf' });
  }

  return part;
}

/**
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
 * @param { Comment } comment
 * @param { Array<ClientChildPartState> } stack
 * @param { ClientRenderOptions } [options]
 */
function createAttributeParts(comment, stack, options) {
  const node = comment.previousElementSibling ?? comment.parentElement;

  if (node === null) {
    throw Error('could not find node for attribute parts');
  }

  // TODO: remove `defer-hydration` attribute?

  const state = stack[stack.length - 1];

  if (state.type === 'template-instance') {
    const { instance } = state;

    while (true) {
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
  } else {
    throw Error('internal error');
  }
}
