// @ts-nocheck
import { directive, Directive } from 'lit-html/directive.js';
import { html as h, renderToString as render } from '../src/index.js';
import assert from 'assert';
import { asyncAppend } from '../src/directives/async-append.js';
import { asyncReplace } from '../src/directives/async-replace.js';
import { cache } from 'lit-html/directives/cache.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { createAsyncIterable } from './utils.js';
import { guard } from 'lit-html/directives/guard.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { hydratable } from '../src/directives/hydratable.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { until } from '../src/directives/until.js';

describe('directives', () => {
  describe('asyncAppend', () => {
    it('AsyncIterable value', async () => {
      const result = h`some ${asyncAppend(createAsyncIterable(['async', ' text']))}`;
      assert.equal(await render(result), 'some async text');
    });
    it('mapped AsyncIterable value', async () => {
      const result = h`some ${asyncAppend(createAsyncIterable(['async', 'text']), (v, index) => {
        return `${index}-${v.toUpperCase()}`;
      })}`;
      assert.equal(await render(result), 'some 0-ASYNC1-TEXT');
    });
  });

  describe('asyncReplace', () => {
    it('AsyncIterable value', async () => {
      const result = h`some ${asyncReplace(createAsyncIterable(['async', ' text']))}`;
      assert.equal(await render(result), 'some async');
    });
    it('mapped AsyncIterable value', async () => {
      const result = h`some ${asyncReplace(createAsyncIterable(['async', 'text']), (v, index) => {
        return `${index}-${v.toUpperCase()}`;
      })}`;
      assert.equal(await render(result), 'some 0-ASYNC');
    });
  });

  describe('cache', () => {
    it('cached value', async () => {
      const result = h`some ${cache('text')}`;
      assert.equal(await render(result), 'some text');
    });
  });

  describe('classMap', () => {
    it('throw if not used as attribute value', async () => {
      let errored = false;
      try {
        const result = h`<div>${classMap({ red: true })}</div>`;
        assert(result === undefined);
      } catch (err) {
        assert(err !== undefined);
        errored = true;
      }
      assert(errored === true);
    });
    it('throw if not used as "class" attribute value', async () => {
      let errored = false;
      try {
        const result = h`<div color="${classMap({ red: true })}"></div>`;
        assert(result === undefined);
      } catch (err) {
        assert(err !== undefined);
        errored = true;
      }
      assert(errored === true);
    });
    it('include class name if truthy', async () => {
      const result = h`<div class="${classMap({ red: true })}"></div>`;
      assert.equal(await render(result), '<div class=" red "></div>');
    });
    it('include class names if truthy', async () => {
      const result = h`<div class="${classMap({ red: true, blue: true })}"></div>`;
      assert.equal(await render(result), '<div class=" red blue "></div>');
    });
    it('ignore class names if falsey', async () => {
      const result = h`<div class="${classMap({ red: false, blue: true })}"></div>`;
      assert.equal(await render(result), '<div class=" blue "></div>');
    });
  });

  describe('guard', () => {
    it('simple guarded value', async () => {
      const result = h`some ${guard('title', () => 'text')}`;
      assert.equal(await render(result), 'some text');
    });
    it('guarded array value', async () => {
      const items = [1, 2, 3];
      const result = h`some ${guard(items, () => items.map((item) => item))}`;
      assert.equal(await render(result), 'some 123');
    });
  });

  describe('if-defined', () => {
    it('attribute value if defined', async () => {
      const className = 'hi';
      const result = h`<div class="${ifDefined(className)}"></div>`;
      assert.equal(await render(result), '<div class="hi"></div>');
    });
    it('not render an attribute value if undefined', async () => {
      const className = undefined;
      const result = h`<div class="${ifDefined(className)}"></div>`;
      assert.equal(await render(result), '<div></div>');
    });
  });

  describe('hydratable', () => {
    it('subtree with metadata', async () => {
      const result = h`<div class="${'bye'}">${hydratable(h`<span class="${'hi'}">hi</span>`)}</div>`;
      assert.equal(
        await render(result),
        '<div class="bye"><!--lit-child rtM8orPci6o=--><span class="hi"><!--lit-attr 0-->hi</span><!--/lit-child--></div>',
      );
    });
  });

  describe('repeat', () => {
    it('array of values', async () => {
      const repeater = (i, index) => h`<li>${index}: ${i}</li>`;
      const result = h`<ul>${repeat([1, 2, 3], repeater)}</ul>`;
      assert.equal(await render(result), '<ul><li>0: 1</li><li>1: 2</li><li>2: 3</li></ul>');
    });
  });

  describe('styleMap', () => {
    it('throw if not used as attribute value', async () => {
      let errored = false;
      try {
        const result = h`<div>${styleMap({ color: 'red' })}</div>`;
        assert(result === undefined);
      } catch (err) {
        assert(err !== undefined);
        errored = true;
      }
      assert(errored === true);
    });
    it('throw if not used as "style" attribute value', async () => {
      let errored = false;
      try {
        const result = h`<div class="${styleMap({ color: 'red' })}"></div>`;
        assert(result === undefined);
      } catch (err) {
        assert(err !== undefined);
        errored = true;
      }
      assert(errored === true);
    });
    it('include style properties', async () => {
      const result = h`<div style="${styleMap({
        color: 'red',
        border: '1px solid black',
      })}"></div>`;
      assert.equal(await render(result), '<div style="color:red;border:1px solid black;"></div>');
    });
  });

  describe('unsafe-html', () => {
    it('render unescaped value', async () => {
      const result = h`<p>${unsafeHTML("hey! it's dangerous! <script>boom!</script>")}</p>`;
      assert.equal(await render(result), "<p>hey! it's dangerous! <script>boom!</script></p>");
    });
  });

  describe('until', () => {
    it('pending value', async () => {
      const result = h`<p>${until(Promise.resolve('hi'), h`<span>Loading...</span>`)}</p>`;
      assert.equal(await render(result), '<p><span>Loading...</span></p>');
    });
    it('Promise value if no values pending', async () => {
      const result = h`<p>${until(Promise.resolve('hi'))}</p>`;
      assert.equal(await render(result), '<p>hi</p>');
    });
  });

  describe('custom', () => {
    it('custom directive', async () => {
      const custom = directive(
        class extends Directive {
          render() {
            return "custom's";
          }
        },
      );
      const result = h`<p>${custom()}</p>`;
      assert.equal(await render(result), '<p>custom&#x27;s</p>');
    });
    it('with correct tagName', async () => {
      let actualTagName = 'not-set';
      const custom = directive(
        class extends Directive {
          constructor(partInfo) {
            super(partInfo);
            actualTagName = partInfo.tagName;
          }
          render() {
            return actualTagName;
          }
        },
      );
      const result = h`<div>${custom()}</div>`;
      await render(result);
      assert.equal(actualTagName, 'div');
    });
    it('with correct tagName when tag has space', async () => {
      let actualTagName = 'not-set';
      const custom = directive(
        class extends Directive {
          constructor(partInfo) {
            super(partInfo);
            actualTagName = partInfo.tagName;
          }
          render() {
            return actualTagName;
          }
        },
      );
      const result = h`<div >${custom()}</div >`;
      await render(result);
      assert.equal(actualTagName, 'div');
    });
    it('with correct tagName when tag has attribute', async () => {
      let actualTagName = 'not-set';
      const custom = directive(
        class extends Directive {
          constructor(partInfo) {
            super(partInfo);
            actualTagName = partInfo.tagName;
          }
          render() {
            return actualTagName;
          }
        },
      );
      const result = h`<div class="something">${custom()}</div>`;
      await render(result);
    });
    it('with correct tagName with dynamic attribute value', async () => {
      let actualTagName = 'not-set';
      const custom = directive(
        class extends Directive {
          constructor(partInfo) {
            super(partInfo);
            actualTagName = partInfo.tagName;
          }
          render() {
            return actualTagName;
          }
        },
      );
      const myClass = 'something';
      const result = h`<my-static-element class="${myClass}">${custom()}</my-static-element>`;
      await render(result);
      assert.equal(actualTagName, 'my-static-element');
    });
  });
});
