import { noChange, _$LH } from 'lit-html';
import { isPrimitive, isSingleExpression, isTemplateResult } from 'lit-html/directive-helpers.js';
import { digestForTemplateResult } from 'lit-html/experimental-hydrate.js';
import { PartType } from 'lit-html/directive.js';

const {
  _ChildPart: ChildPart,
  _ElementPart: ElementPart,
  _isIterable: isIterable,
  _resolveDirective: resolveDirective,
  _TemplateInstance: TemplateInstance,
} = _$LH;

/**
 *
 * @param { unknown } value
 * @param { HTMLElement | DocumentFragment } container
 * @param { RenderOptions } [options]
 */
export function hydrate(value, container, options = {}) {
  // @ts-expect-error - internal property
  if (container['_$litPart$'] !== undefined) {
    // TODO: call render instead
  }

  /** @type { ChildPart | undefined } */
  let rootPart = undefined;
  /** @type { ChildPart | undefined } */
  let currentChildPart = undefined;

  /** @type { Array<ChildPartState> } */
  const stack = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_COMMENT);
  /** @type { Comment | null } */
  let marker;

  try {
    // @ts-expect-error - only walking comments
    while ((marker = walker.nextNode()) !== null) {
      const markerText = marker.data;

      if (markerText.startsWith('lit-part')) {
        if (stack.length === 0 && rootPart !== undefined) {
          throw Error('must be only one root part per container');
        }
        currentChildPart = openChildPart(value, marker, stack, options);
        rootPart ??= currentChildPart;
      } else if (markerText.startsWith('lit-node')) {
        createAttributeParts(marker, stack, options);
      } else if (markerText.startsWith('/lit-part')) {
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
    container['_$litPart$'] = rootPart;
  } catch (err) {
    // TODO: clear container and call render instead
  }
}

/**
 *
 * @param { unknown } value
 * @param { Comment } marker
 * @param { Array<ChildPartState> } stack
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
        throw Error('Unhandled shorter than expected iterable');
      } else {
        value = result.value;
      }
      /** @type { Array<ChildPart> } */ (state.part._$committedValue).push(part);
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
    const markerWithDigest = `lit-part ${digestForTemplateResult(value)}`;

    if (marker.data !== markerWithDigest) {
      throw Error('Hydration value mismatch: Unexpected TemplateResult rendered to part');
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
 *
 * @param { Comment } marker
 * @param { ChildPart | undefined } part
 * @param { Array<ChildPartState> } stack
 */
function closeChildPart(marker, part, stack) {
  if (part === undefined) {
    throw Error('unbalanced part marker');
  }

  // @ts-expect-error - internal property
  part._$endNode = marker;

  const currentState = /** @type { ChildPartState } */ (stack.pop());

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
 *
 * @param { Comment } comment
 * @param { Array<ChildPartState> } stack
 * @param { RenderOptions } [options]
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
