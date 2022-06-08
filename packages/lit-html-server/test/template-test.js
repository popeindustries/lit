// @ts-nocheck
import { AttributePart, ChildPart, partType } from '../src/internal/parts.js';
import { expect } from 'chai';
import { Template } from '../src/internal/template.js';

/**
 * @param { Template } template
 */
function templateToStrings(template) {
  const { _strings, _parts } = template;
  let result = '';
  let i = 0;
  for (; i < _strings.length - 1; i++) {
    result += _strings[i].toString();
    result += partTypeToName(_parts[i]);
  }
  result += _strings[i].toString();
  return result;
}

/**
 * @param { Part } part
 */
function partTypeToName(part) {
  switch (part.type) {
    case partType.CHILD:
      return '[CHILD]';
    case partType.ATTRIBUTE:
      return '[ATTR]';
    case partType.BOOLEAN_ATTRIBUTE:
      return '[BOOL]';
    case partType.ELEMENT:
      return '[ELEMENT]';
    case partType.EVENT:
      return '[EVENT]';
    case partType.METADATA:
      return part.value.toString();
    case partType.PROPERTY:
      return '[PROPERTY]';
    default:
      return '[PART]';
  }
}

describe('Template class', () => {
  it('should prepare a plain text template', () => {
    // html`text`
    const template = new Template(['text']);
    const string = templateToStrings(template);
    expect(string).to.equal('<!--lit-part iW9ZALRtWQA=-->text<!--/lit-part-->');
  });
  it('should prepare a static template with attributes', () => {
    // html`<div a="a"></div>`
    const template = new Template(['<div a="a"></div>']);
    const string = templateToStrings(template);
    expect(string).to.equal('<!--lit-part qo8N/bhSWzI=--><div a="a"></div><!--/lit-part-->');
  });
  it('should prepare a template with child value', () => {
    // html`<div>${var}</div>`
    const template = new Template(['<div>', '</div>']);
    const string = templateToStrings(template);
    expect(string).to.equal(
      '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part-->[CHILD]<!--/lit-part--></div><!--/lit-part-->',
    );
  });
  it.only('should prepare a template with quoted attribute', () => {
    // html`<div a="${var}">some text</div>`
    const template = new Template(['<div a="', '">some text</div>']);
    const string = templateToStrings(template);
    expect(string).to.equal(
      '<!--lit-part mNXjfEJ0Ra4=--><div a="[ATTR]"><!--lit-node 0-->some text</div><!--/lit-part-->',
    );
  });
  it('should prepare a template with quoted attribute and child value', () => {
    // html`<div a="${var1}">some text ${var2}</div>`
    const template = new Template(['<div a="', '">some text ', '</div>']);
    const string = templateToStrings(template);
    expect(string).to.equal(
      '<!--lit-part mNXjfEJ0Ra4=--><div a="[ATTR]"><!--lit-node 0-->some text <!--lit-part-->[CHILD]<!--/lit-part--></div><!--/lit-part-->',
    );
  });
  it('should prepare a template with quoted attribute and extra whitespace', () => {
    // html`<div a = " ${var} " ></div>`
    const template = new Template(['<div a = " ', ' " ></div>']);
    const string = templateToStrings(template);
    expect(string).to.equal('<div a = " [ATTR] " ></div>');
  });
  it('should prepare a template with quoted attribute and extra strings', () => {
    // html`<div a="some ${var} here"></div>`
    const template = new Template(['<div a="some ', ' here"></div>']);
    const string = templateToStrings(template);
    expect(string).to.equal('<div a="some [ATTR] here"></div>');
  });
  it('should prepare a template with quoted attribute and multiple strings/values', () => {
    // html`<div a="${var1} in ${var2}"></div>`
    const template = new Template(['<div a="', ' in ', '">', '</div>']);
    const string = templateToStrings(template);
    expect(string).to.equal('<div a="[ATTR] in [ATTR]">[CHILD]</div>');
    expect(template._parts[1]).to.have.property('tagName', 'div');
    expect(template._parts[1]).to.have.property('name', 'a');
  });
  it('should prepare a template with unquoted attribute', () => {
    // html`<div a=${var}></div>`
    const template = new Template(['<div a=', '></div>']);
    const string = templateToStrings(template);
    expect(string).to.equal('<div a=[ATTR]></div>');
  });
  it('should prepare a template with quoted property attribute', () => {
    // html`<div .a="${var}""></div>`
    const template = new Template(['<div .a="', '"></div>']);
    const string = templateToStrings(template);
    expect(string).to.equal('<div .a="[PROPERTY]"></div>');
  });
  it('should prepare a template with unquoted property attribute', () => {
    // html`<div .a=${var}></div>`
    const template = new Template(['<div .a=', '></div>']);
    const string = templateToStrings(template);
    expect(string).to.equal('<div .a=[PROPERTY]></div>');
  });
  it('should prepare a template with quoted property attribute and multiple strings/values', () => {
    // html`<div .a="${var1} in ${var2}"></div>`
    const template = new Template(['<div .a="', ' in ', '">', '</div>']);
    const string = templateToStrings(template);
    expect(string).to.equal('<div .a="[PROPERTY] in [PROPERTY]">[CHILD]</div>');
  });
  it('should prepare a template with element attribute', () => {
    // html`<div ${ref()}></div>`
    const template = new Template(['<div ', '></div>']);
    const string = templateToStrings(template);
    expect(string).to.equal('<div [ELEMENT]></div>');
  });
  it('should prepare a template with quoted boolean attribute', () => {
    // html`<div ?a="${var} "></div>`
    const template = new Template(['<div ?a="', '"></div>']);
    const string = templateToStrings(template);
    expect(string).to.equal('<div [BOOL]></div>');
  });
  it('should prepare a template with unquoted boolean attribute', () => {
    // html`<div ?a=${var}></div>`
    const template = new Template(['<div ?a=', '></div>']);
    const string = templateToStrings(template);
    expect(string).to.equal('<div [BOOL]></div>');
  });
  it('should prepare a template with quoted event attribute', () => {
    // html`<div @a="${var}"></div>`
    const template = new Template(['<div @a="', '"></div>']);
    const string = templateToStrings(template);
    expect(string).to.equal('<div [EVENT]></div>');
  });
  it('should prepare a template with unquoted event attribute', () => {
    // html`<div @a=${var}></div>`
    const template = new Template(['<div @a=', '></div>']);
    const string = templateToStrings(template);
    expect(string).to.equal('<div [EVENT]></div>');
  });
});
