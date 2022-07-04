// @ts-nocheck

const RE_VALID_NAME = /^[a-z][a-z0-9._-]*-[a-z0-9._-]*$/;

if (typeof globalThis.window === 'undefined') {
  class Element {
    _attributes = {};
    _hasShadowDOM = false;

    get attributes() {
      return Object.keys(this._attributes);
    }

    attachShadow(init) {
      const shadowRoot = { host: this };

      // TODO: mode closed?
      if (init && init.mode === 'open') {
        this._hasShadowDOM = true;
      }

      return shadowRoot;
    }

    getAttribute(name) {
      const value = this._attributes[name];
      return value === undefined ? null : value;
    }

    setAttribute(name, value) {
      this._attributes[name] = String(value);
    }
  }

  class HTMLElement extends Element {}

  class Document {
    createTreeWalker() {}
  }

  class CustomElementRegistry {
    constructor() {
      this._registry = new Map();
    }

    get(name) {
      return this._registry.get(name);
    }

    define(name, constructor) {
      if (!RE_VALID_NAME.test(name)) {
        throw Error(`invalid custom element name: ${name}`);
      } else if (this._registry.has(name)) {
        throw Error(`a constructor has already been registered with that name: ${name}`);
      } else if (Array.from(this._registry.values()).includes(constructor)) {
        throw Error(`the constructor has already been registered under another name`);
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
    CustomElementRegistry,
    customElements: new CustomElementRegistry(),
  };

  window.window = window;

  globalThis.window = window;
  Object.assign(globalThis, window);
}
