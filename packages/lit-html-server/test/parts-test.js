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
import { createAsyncIterable } from './utils.js';
import { expect } from 'chai';
import { nothing } from 'lit-html';

describe('Parts', () => {
  describe('ChildPart', () => {
    it('should resolve a string value', () => {
      const part = new ChildPart('div');
      expect(part.resolveValue('text').toString()).to.equal('text');
    });
    it('should resolve and escape a string value', () => {
      const part = new ChildPart('div');
      expect(part.resolveValue('<text>').toString()).to.equal('&lt;text&gt;');
    });
    it('should resolve and escape a string value for script tag', () => {
      const part = new ChildPart('script');
      expect(part.resolveValue("const t = '<script>alert(' + foo + ')</script>';").toString()).to.equal(
        "const t = '<script>alert(' + foo + ')<\\/script>';",
      );
    });
    it('should resolve a number value', () => {
      const part = new ChildPart('div');
      expect(part.resolveValue(1).toString()).to.equal('1');
    });
    it('should resolve a boolean value', () => {
      const part = new ChildPart('div');
      expect(part.resolveValue(true).toString()).to.equal('true');
    });
    it('should resolve a null value', () => {
      const part = new ChildPart('div');
      expect(part.resolveValue(null).toString()).to.equal('null');
    });
    it('should resolve an undefined value', () => {
      const part = new ChildPart('div');
      expect(part.resolveValue(undefined).toString()).to.equal('');
    });
    it('should resolve an array value', () => {
      const part = new ChildPart('div');
      expect(part.resolveValue([1, 2, 3]).map((v) => v.toString())).to.deep.equal(['1', '2', '3']);
    });
    it('should resolve an nested array value', () => {
      const part = new ChildPart('div');
      expect(part.resolveValue([1, 2, [3, [4, 5]]]).map((v) => v.toString())).to.deep.equal(['1', '2', '3', '4', '5']);
    });
    it('should resolve a sync iterator value', () => {
      const part = new ChildPart('div');
      const array = ['hello ', 'world'];
      expect(part.resolveValue(array[Symbol.iterator]()).map((v) => v.toString())).to.deep.equal(['hello ', 'world']);
    });
    it('should resolve a string Promise value', async () => {
      const part = new ChildPart('div');
      const promise = Promise.resolve('text');
      expect((await part.resolveValue(promise)).toString()).to.equal('text');
    });
    it('should resolve a number Promise value', async () => {
      const part = new ChildPart('div');
      const promise = Promise.resolve(1);
      expect((await part.resolveValue(promise)).toString()).to.equal('1');
    });
    it('should resolve a boolean Promise value', async () => {
      const part = new ChildPart('div');
      const promise = Promise.resolve(true);
      expect((await part.resolveValue(promise)).toString()).to.equal('true');
    });
    it('should resolve a null Promise value', async () => {
      const part = new ChildPart('div');
      const promise = Promise.resolve(null);
      expect((await part.resolveValue(promise)).toString()).to.equal('null');
    });
    it('should resolve an undefined Promise value', async () => {
      const part = new ChildPart('div');
      const promise = Promise.resolve(undefined);
      expect((await part.resolveValue(promise)).toString()).to.equal('');
    });
    it('should resolve an array Promise value', async () => {
      const part = new ChildPart('div');
      const promise = Promise.resolve([1, 2, 3]);
      expect((await part.resolveValue(promise)).map((v) => v.toString())).to.deep.equal(['1', '2', '3']);
    });
    it('should handle Promise errors', async () => {
      const part = new ChildPart('div');
      const promise = Promise.reject(Error('errored!'));
      try {
        const result = await part.resolveValue(promise);
        expect(result).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
    });
    it('should resolve an async iterator value', async () => {
      const part = new ChildPart('div');
      const iterator = createAsyncIterable(['some', ' text']);
      let result = '';
      for await (const value of part.resolveValue(iterator)) {
        result += value;
      }
      expect(result).to.equal('some text');
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
      expect(part.resolveValue(d()).toString()).to.equal('directive');
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
      expect(part.resolveValue(d()).toString()).to.equal('');
    });
  });

  describe('AttributePart', () => {
    it('should resolve a string value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect(part.resolveValue(['text']).toString()).to.equal('a="text"');
    });
    it('should resolve a number value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect(part.resolveValue([1]).toString()).to.equal('a="1"');
    });
    it('should resolve a boolean value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect(part.resolveValue([true]).toString()).to.equal('a="true"');
    });
    it('should resolve a null value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect(part.resolveValue([null]).toString()).to.equal('a="null"');
    });
    it('should resolve an undefined value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect(part.resolveValue([undefined]).toString()).to.equal('a="undefined"');
    });
    it('should resolve multiple values', () => {
      const part = new AttributePart('a', [Buffer.from('b'), Buffer.from('d'), Buffer.from('')], 'div');
      expect(part.resolveValue(['c', 'e']).toString()).to.equal('a="bcde"');
    });
    it('should resolve an array value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect(part.resolveValue([[1, 2, 3]]).toString()).to.equal('a="123"');
    });
    it('should resolve a deeply nested array value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect(part.resolveValue([[[1], 2, [3, [4, 5]]]]).toString()).to.equal('a="12345"');
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
      expect(part.resolveValue([d()]).toString()).to.equal('a="directive"');
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
      expect(part.resolveValue([d()]).toString()).to.equal('');
    });
    it('should resolve a string Promise value', async () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from(' here')], 'div');
      expect((await part.resolveValue([Promise.resolve('text')])).toString()).to.equal('a="text here"');
    });
    it('should resolve a number Promise value', async () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect((await part.resolveValue([Promise.resolve(1)])).toString()).to.equal('a="1"');
    });
    it('should resolve a boolean Promise value', async () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect((await part.resolveValue([Promise.resolve(true)])).toString()).to.equal('a="true"');
    });
    it('should resolve a null Promise value', async () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect((await part.resolveValue([Promise.resolve(null)])).toString()).to.equal('a="null"');
    });
    it('should resolve an undefined Promise value', async () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect((await part.resolveValue([Promise.resolve(undefined)])).toString()).to.equal('a="undefined"');
    });
    it('should handle Promise errors', async () => {
      try {
        const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
        const promise = Promise.reject(Error('errored!'));
        const result = await part.resolveValue([promise]);
        expect(result).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
    });
  });

  describe('BooleanAttributePart', () => {
    it('should resolve truthy values', () => {
      const part = new BooleanAttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect(part.resolveValue(true).toString()).to.equal('a');
      expect(part.resolveValue('true').toString()).to.equal('a');
      expect(part.resolveValue(1).toString()).to.equal('a');
    });
    it('should resolve falsey values', () => {
      const part = new BooleanAttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect(part.resolveValue(false).toString()).to.equal('');
      expect(part.resolveValue('').toString()).to.equal('');
      expect(part.resolveValue(0).toString()).to.equal('');
      expect(part.resolveValue(null).toString()).to.equal('');
      expect(part.resolveValue(undefined).toString()).to.equal('');
    });
    it('should resolve a truthy Promise value', async () => {
      const part = new BooleanAttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect((await part.resolveValue(Promise.resolve(true))).toString()).to.equal('a');
      expect((await part.resolveValue(Promise.resolve('true'))).toString()).to.equal('a');
      expect((await part.resolveValue(Promise.resolve(1))).toString()).to.equal('a');
    });
    it('should resolve a falsey Promise value', async () => {
      const part = new BooleanAttributePart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect((await part.resolveValue(Promise.resolve(false))).toString()).to.equal('');
      expect((await part.resolveValue(Promise.resolve(''))).toString()).to.equal('');
      expect((await part.resolveValue(Promise.resolve(0))).toString()).to.equal('');
      expect((await part.resolveValue(Promise.resolve(null))).toString()).to.equal('');
      expect((await part.resolveValue(Promise.resolve(undefined))).toString()).to.equal('');
    });
  });

  describe('ElementPart', () => {
    it('should resolve to empty string', () => {
      const part = new ElementPart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect(part.resolveValue('text').toString()).to.equal('');
    });
  });

  describe('EventPart', () => {
    it('should resolve to empty string', () => {
      const part = new EventPart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect(part.resolveValue('text').toString()).to.equal('');
    });
  });

  describe('PropertyPart', () => {
    it('should resolve to empty string', () => {
      const part = new PropertyPart('a', [Buffer.from(''), Buffer.from('')], 'div');
      expect(part.resolveValue('text').toString()).to.equal('');
    });
  });
});
