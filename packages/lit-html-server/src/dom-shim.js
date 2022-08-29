// @ts-nocheck

const RE_VALID_CE_NAME = /^[a-z][a-z0-9._-]*-[a-z0-9._-]*$/;

if (typeof globalThis.window === 'undefined') {
  class Element {
    __attributes__ = {};
    innerHTML = '';
    shadowRoot = null;

    get attributes() {
      const result = [];
      for (const name in this.__attributes__) {
        result.push({ name, value: this.__attributes__[name] });
      }
      return result;
    }

    attachShadow(options = { mode: 'open' }) {
      const shadowRoot = { host: this, innerHTML: '', mode: options.mode };
      this.shadowRoot = shadowRoot;
      return shadowRoot;
    }

    getAttribute(name) {
      const value = this.__attributes__[name];
      return value === undefined ? null : value;
    }

    setAttribute(name, value) {
      this.__attributes__[name] = String(value);
    }

    hasAttribute(name) {
      return name in this.__attributes__;
    }
  }

  class HTMLElement extends Element {}

  class Document {
    get adoptedStyleSheets() {
      return [];
    }
    createTreeWalker() {
      return {};
    }
    createTextNode() {
      return {};
    }
    createElement() {
      return {};
    }
  }

  class CustomElementRegistry {
    constructor() {
      this._registry = new Map();
    }

    get(name) {
      return this._registry.get(name);
    }

    define(name, constructor) {
      if (!RE_VALID_CE_NAME.test(name)) {
        throw Error(`invalid custom element name: ${name}`);
      } else if (this._registry.has(name)) {
        throw Error(`a constructor has already been registered with that name: ${name}`);
      } else if (Array.from(this._registry.values()).includes(constructor)) {
        throw Error(`the constructor has already been registered under another name: ${constructor}`);
      }

      // Trigger getter
      constructor.observedAttributes;
      this._registry.set(name, constructor);
    }
  }

  const window = {
    Element,
    HTMLElement,
    Document,
    document: new Document(),
    CSSStyleSheet: class CSSStyleSheet {
      replace() {}
      replaceSync() {}
    },
    CustomElementRegistry,
    customElements: new CustomElementRegistry(),
    MutationObserver: class MutationObserver {
      observe() {}
    },
    requestAnimationFrame() {},
    ShadowRoot: class ShadowRoot {},
  };

  // `location` is defined in Workers, so only patch if missing
  if (globalThis.location === undefined) {
    window.location = new URL('http://localhost');
  }

  window.window = window;

  globalThis.window = window;
  Object.assign(globalThis, window);
}
