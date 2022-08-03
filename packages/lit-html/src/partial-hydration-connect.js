/**
 *
 * @param { HTMLElement } element
 * @param { () => void } connectedCallback
 */
export function partialHydrationConnectHelper(element, connectedCallback) {
  if (element.hasAttribute('hydrate:connect')) {
    element.removeAttribute('hydrate:connect');
    if (element.isConnected) {
      connectedCallback.call(element);
    }
  }
}

class MyComp extends ReactiveElement {
  connectedCallback() {
    partialHydrationConnectHelper(this, super.connectedCallback);
  }
}

class MyComp extends partialHydration