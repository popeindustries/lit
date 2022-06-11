// @ts-nocheck
import { AttributePart, ChildPart, partType } from '../src/internal/parts.js';
import { expect } from 'chai';
import { Template } from '../src/internal/template.js';

const TESTS = [
  { title: 'plain text', template: 'text', result: '<!--lit-part iW9ZALRtWQA=-->text<!--/lit-part-->' },
  {
    title: 'child value',
    template: '<div>${var}</div>',
    result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part-->[CHILD]<!--/lit-part--></div><!--/lit-part-->',
  },
  {
    title: 'static quoted attribute',
    template: '<div a="static"></div>',
    result: '<!--lit-part urUdR3EClgk=--><div a="static"></div><!--/lit-part-->',
  },
  {
    title: 'static quoted attribute with spaces',
    template: '<div a=" static "></div>',
    result: '<!--lit-part wt+G+gn/304=--><div a=" static "></div><!--/lit-part-->',
  },
  {
    title: 'static unquoted attribute',
    template: '<div a=static></div>',
    result: '<!--lit-part 4KGmuyvi4m8=--><div a=static></div><!--/lit-part-->',
  },
  {
    title: 'static unquoted attribute with spaces',
    template: '<div a = static ></div>',
    result: '<!--lit-part 9WhA/p74yyM=--><div a = static ></div><!--/lit-part-->',
  },
  {
    title: 'static boolean attribute',
    template: '<div static></div>',
    result: '<!--lit-part 3ZT6YIrDxrk=--><div static></div><!--/lit-part-->',
  },
  {
    title: 'quoted attribute',
    template: '<div a="${var}">some text</div>',
    result: '<!--lit-part mNXjfEJ0Ra4=--><div [ATTR]><!--lit-node 0-->some text</div><!--/lit-part-->',
  },
  {
    title: 'quoted attribute and child value',
    template: '<div a="${var}">some text ${var}</div>',
    result:
      '<!--lit-part LgXkfNSe8nY=--><div [ATTR]><!--lit-node 0-->some text <!--lit-part-->[CHILD]<!--/lit-part--></div><!--/lit-part-->',
  },
  {
    title: 'quoted attribute and extra whitespace',
    template: '<div a = " ${var} " ></div>',
    result: '<!--lit-part fkksZo0T7A4=--><div [ATTR] ><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'quoted attribute and extra strings',
    template: '<div a="some ${var} here"></div>',
    result: '<!--lit-part tWHqicj+8sU=--><div [ATTR]><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'quoted attribute and multiple strings/values',
    template: '<div a=" look ${var} in ${var} "></div>',
    result: '<!--lit-part wUnUgpIpnBg=--><div [ATTR]><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'unquoted attribute',
    template: '<div a=${var}></div>',
    result: '<!--lit-part K+c1m3iKv0M=--><div [ATTR]><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'quoted property attribute',
    template: '<div .a="${var}"></div>',
    result: '<!--lit-part X7msdWIx9Mg=--><div [PROPERTY]><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'unquoted property attribute',
    template: '<div .a=${var}></div>',
    result: '<!--lit-part d1HzlmpmRcA=--><div [PROPERTY]><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    only: true,
    title: 'quoted property attribute and multiple strings/values',
    template: '<div .a="${var} in ${var}"></div>',
    result:
      '<!--lit-part EccSnst/CSg=--><div [PROPERTY]"><!--lit-node 0--><!--lit-part-->[CHILD]<!--/lit-part--></div><!--/lit-part-->',
  },
  {
    title: 'element attribute',
    template: '<div ${ref()}></div>',
    result: '<!--lit-part liPcn9lj0Ak=--><div [ELEMENT]><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'quoted boolean attribute',
    template: '<div ?a="${var} "></div>',
    result: '<!--lit-part X7msddNbKag=--><div [BOOL]><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'unquoted boolean attribute',
    template: '<div ?a=${var}></div>',
    result: '<!--lit-part d1HzlrsCR78=--><div [BOOL]><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'quoted event attribute',
    template: '<div @a="${var}"></div>',
    result: '<!--lit-part X7msdUw8k34=--><div [EVENT]><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'unquoted event attribute',
    template: '<div @a=${var}></div>',
    result: '<!--lit-part d1HzlsSFBL4=--><div [EVENT]><!--lit-node 0--></div><!--/lit-part-->',
  },
  {
    title: 'nested attribute metadata',
    template: '<div a="${var}">some <em>text</em> <span b="${var}">wow</span></div>',
    result:
      '<!--lit-part S6qXICEenow=--><div a="[ATTR]"><!--lit-node 0-->some <em>text</em> <span b="[ATTR]"><!--lit-node 2-->wow</span></div><!--/lit-part-->',
  },
];

describe('Template class', () => {
  const only = TESTS.filter(({ only }) => only);
  const tests = (only.length ? only : TESTS).filter(({ skip }) => !skip);
  for (const { title, template, result } of tests) {
    it(`should parse template with ${title}`, () => {
      const string = templateToStrings(new Template(template.split('${var}')));
      expect(string).to.equal(result);
    });
  }
});

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
    case partType.BOOLEAN:
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
