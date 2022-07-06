// @ts-nocheck
import {
  AttributePart,
  BooleanAttributePart,
  ChildPart,
  ElementPart,
  EventPart,
  PropertyPart,
} from '../src/internal/parts.js';
import { directive, Directive } from 'lit-html/directive.js';
import assert from 'node:assert';
import { createAsyncIterable } from './utils.js';
import { nothing } from 'lit-html';

describe('Parts', () => {
  describe('ChildPart', () => {
    it('should resolve a string value', () => {
      const part = new ChildPart('div');
      assert(part.resolveValue('text').toString() === 'text');
    });
    it('should resolve and escape a string value', () => {
      const part = new ChildPart('div');
      assert(part.resolveValue('<text>').toString() === '&lt;text&gt;');
    });
    it('should resolve and escape a string value for script tag', () => {
      const part = new ChildPart('script');
      assert(
        part.resolveValue("const t = '<script>alert(' + foo + ')</script>';").toString() ===
          "const t = '<script>alert(' + foo + ')<\\/script>';",
      );
    });
    it('should resolve a number value', () => {
      const part = new ChildPart('div');
      assert(part.resolveValue(1).toString() === '1');
    });
    it('should resolve a boolean value', () => {
      const part = new ChildPart('div');
      assert(part.resolveValue(true).toString() === 'true');
    });
    it('should resolve a null value', () => {
      const part = new ChildPart('div');
      assert(part.resolveValue(null).toString() === '');
    });
    it('should resolve an undefined value', () => {
      const part = new ChildPart('div');
      assert(part.resolveValue(undefined).toString() === '');
    });
    it('should resolve an array value', () => {
      const part = new ChildPart('div');
      assert.deepEqual(
        part.resolveValue([1, 2, 3]).map((v) => v.toString()),
        ['1', '2', '3'],
      );
    });
    it('should resolve an nested array value', () => {
      const part = new ChildPart('div');
      assert.deepEqual(
        part.resolveValue([1, 2, [3, [4, 5]]]).map((v) => v.toString()),
        ['1', '2', '3', '4', '5'],
      );
    });
    it('should resolve a sync iterator value', () => {
      const part = new ChildPart('div');
      const array = ['hello ', 'world'];
      assert.deepEqual(
        part.resolveValue(array[Symbol.iterator]()).map((v) => v.toString()),
        ['hello ', 'world'],
      );
    });
    it('should resolve a string Promise value', async () => {
      const part = new ChildPart('div');
      const promise = Promise.resolve('text');
      assert((await part.resolveValue(promise)).toString() === 'text');
    });
    it('should resolve a number Promise value', async () => {
      const part = new ChildPart('div');
      const promise = Promise.resolve(1);
      assert((await part.resolveValue(promise)).toString() === '1');
    });
    it('should resolve a boolean Promise value', async () => {
      const part = new ChildPart('div');
      const promise = Promise.resolve(true);
      assert((await part.resolveValue(promise)).toString() === 'true');
    });
    it('should resolve a null Promise value', async () => {
      const part = new ChildPart('div');
      const promise = Promise.resolve(null);
      assert((await part.resolveValue(promise)).toString() === '');
    });
    it('should resolve an undefined Promise value', async () => {
      const part = new ChildPart('div');
      const promise = Promise.resolve(undefined);
      assert((await part.resolveValue(promise)).toString() === '');
    });
    it('should resolve an array Promise value', async () => {
      const part = new ChildPart('div');
      const promise = Promise.resolve([1, 2, 3]);
      assert.deepEqual(
        (await part.resolveValue(promise)).map((v) => v.toString()),
        ['1', '2', '3'],
      );
    });
    it('should handle Promise errors', async () => {
      const part = new ChildPart('div');
      const promise = Promise.reject(Error('errored!'));
      try {
        const result = await part.resolveValue(promise);
        assert(result === undefined);
      } catch (err) {
        assert(err.message === 'errored!');
      }
    });
    it('should resolve an async iterator value', async () => {
      const part = new ChildPart('div');
      const iterator = createAsyncIterable(['some', ' text']);
      let result = '';
      for await (const value of part.resolveValue(iterator)) {
        result += value;
      }
      assert(result === 'some text');
    });
    it('should resolve a directive value', () => {
      const d = directive(
        class extends Directive {
          render() {
            return 'directive';
          }
        },
      );
      const part = new ChildPart('div');
      assert(part.resolveValue(d()).toString() === 'directive');
    });
    it('should resolve a directive value returning "nothing"', () => {
      const d = directive(
        class extends Directive {
          render() {
            return nothing;
          }
        },
      );
      const part = new ChildPart('div');
      assert(part.resolveValue(d()).toString() === '');
    });
  });

  describe('AttributePart', () => {
    it('should resolve a string value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      assert(part.resolveValue(['text']).toString() === 'a="text"');
    });
    it('should resolve a number value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      assert(part.resolveValue([1]).toString() === 'a="1"');
    });
    it('should resolve a boolean value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      assert(part.resolveValue([true]).toString() === 'a="true"');
    });
    it('should resolve a null value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      assert(part.resolveValue([null]).toString() === 'a="null"');
    });
    it('should resolve an undefined value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      assert(part.resolveValue([undefined]).toString() === 'a="undefined"');
    });
    it('should resolve multiple values', () => {
      const part = new AttributePart('a', [Buffer.from('b'), Buffer.from('d'), Buffer.from('')], 'div');
      assert(part.resolveValue(['c', 'e']).toString() === 'a="bcde"');
    });
    it('should resolve an array value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      assert(part.resolveValue([[1, 2, 3]]).toString() === 'a="1,2,3"');
    });
    it('should resolve a deeply nested array value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      assert(part.resolveValue([[[1], 2, [3, [4, 5]]]]).toString() === 'a="1,2,3,4,5"');
    });
    it('should resolve a directive value', () => {
      const d = directive(
        class extends Directive {
          render() {
            return 'directive';
          }
        },
      );
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      assert(part.resolveValue([d()]).toString() === 'a="directive"');
    });
    it('should resolve a directive value returning "nothing"', () => {
      const d = directive(
        class extends Directive {
          render() {
            return nothing;
          }
        },
      );
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      assert(part.resolveValue([d()]).toString() === '');
    });
  });

  describe('BooleanAttributePart', () => {
    it('should resolve truthy values', () => {
      const part = new BooleanAttributePart('a', 'div');
      assert(part.resolveValue(true).toString() === 'a');
      assert(part.resolveValue('true').toString() === 'a');
      assert(part.resolveValue(1).toString() === 'a');
    });
    it('should resolve falsey values', () => {
      const part = new BooleanAttributePart('a', 'div');
      assert(part.resolveValue(false).toString() === '');
      assert(part.resolveValue('').toString() === '');
      assert(part.resolveValue(0).toString() === '');
      assert(part.resolveValue(null).toString() === '');
      assert(part.resolveValue(undefined).toString() === '');
    });
  });

  describe('ElementPart', () => {
    it('should resolve to empty string', () => {
      const part = new ElementPart('a');
      assert(part.value.toString() === '');
    });
  });

  describe('EventPart', () => {
    it('should resolve to empty string', () => {
      const part = new EventPart('a', 'div');
      assert(part.value.toString() === '');
    });
  });

  describe('PropertyPart', () => {
    it('should resolve to empty string', () => {
      const part = new PropertyPart('a', 'div');
      assert(part.value.toString() === '');
    });
  });
});
