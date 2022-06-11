// @ts-nocheck
import { AttributePart, ChildPart, partType } from '../src/internal/parts.js';
import { expect } from 'chai';
import { Template } from '../src/internal/template.js';

describe('Template class', () => {
  describe('parsing without values', () => {
    const tests = [
      { title: 'plain text', template: 'text', result: '<!--lit-part iW9ZALRtWQA=-->text<!--/lit-part-->' },
      {
        title: 'child value',
        template: '<div>${x}</div>',
        result: '<!--lit-part AEmR7W+R0Ak=--><div><!--lit-part-->[CHILD]<!--/lit-part--></div><!--/lit-part-->',
      },
      {
        title: 'multiple child values',
        template: '<div>some ${x} here ${x} too</div>',
        result:
          '<!--lit-part hQjRIHBIpmQ=--><div>some <!--lit-part-->[CHILD]<!--/lit-part--> here <!--lit-part-->[CHILD]<!--/lit-part--> too</div><!--/lit-part-->',
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
        template: '<div a="${x}">some text</div>',
        result: '<!--lit-part mNXjfEJ0Ra4=--><div [ATTR]><!--lit-node 0-->some text</div><!--/lit-part-->',
      },
      {
        title: 'quoted attribute and child value',
        template: '<div a="${x}">some text ${x}</div>',
        result:
          '<!--lit-part LgXkfNSe8nY=--><div [ATTR]><!--lit-node 0-->some text <!--lit-part-->[CHILD]<!--/lit-part--></div><!--/lit-part-->',
      },
      {
        title: 'quoted attribute and extra whitespace',
        template: '<div a = " ${x} " ></div>',
        result: '<!--lit-part fkksZo0T7A4=--><div [ATTR] ><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'quoted attribute and extra strings',
        template: '<div a="some ${x} here"></div>',
        result: '<!--lit-part tWHqicj+8sU=--><div [ATTR]><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'quoted attribute and multiple strings/values',
        template: '<div a=" look ${x} in ${x} "></div>',
        result: '<!--lit-part wUnUgpIpnBg=--><div [ATTR]><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'unquoted attribute',
        template: '<div a=${x}></div>',
        result: '<!--lit-part K+c1m3iKv0M=--><div [ATTR]><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'unquoted attribute with spaces',
        template: '<div a = ${x} ></div>',
        result: '<!--lit-part ftEFDU044DE=--><div [ATTR] ><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'quoted property attribute',
        template: '<div .a="${x}"></div>',
        result: '<!--lit-part X7msdWIx9Mg=--><div [PROPERTY]><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'unquoted property attribute',
        template: '<div .a=${x}></div>',
        result: '<!--lit-part d1HzlmpmRcA=--><div [PROPERTY]><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'quoted property attribute and multiple strings/values',
        template: '<div .a="${x} in ${x}"></div>',
        result: '<!--lit-part EccSnst/CSg=--><div [PROPERTY]><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'element attribute',
        template: '<div ${x}></div>',
        result: '<!--lit-part liPcn9lj0Ak=--><div [ELEMENT]><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'quoted boolean attribute',
        template: '<div ?a="${x}"></div>',
        result: '<!--lit-part X7msddNbKag=--><div [BOOL]><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'unquoted boolean attribute',
        template: '<div ?a=${x}></div>',
        result: '<!--lit-part d1HzlrsCR78=--><div [BOOL]><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'quoted event attribute',
        template: '<div @a="${x}"></div>',
        result: '<!--lit-part X7msdUw8k34=--><div [EVENT]><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'unquoted event attribute',
        template: '<div @a=${x}></div>',
        result: '<!--lit-part d1HzlsSFBL4=--><div [EVENT]><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'nested attribute metadata',
        template: '<div a="${x}">some <em>text</em> <span b="${x}">wow</span></div>',
        result:
          '<!--lit-part S6qXICEenow=--><div [ATTR]><!--lit-node 0-->some <em>text</em> <span [ATTR]><!--lit-node 2-->wow</span></div><!--/lit-part-->',
      },
      {
        title: 'everything, all at once',
        template:
          '<div boolean a=static b="static" c=${x} d="${x}" ?e=${x} ?f="${x}" .g="some ${x} in ${x}">some <em>text</em> <span b="${x}">wow</span></div>',
        result:
          '<!--lit-part zA+faP4z8/g=--><div boolean a=static b="static" [ATTR] [ATTR] [BOOL] [BOOL] [PROPERTY]><!--lit-node 0-->some <em>text</em> <span [ATTR]><!--lit-node 2-->wow</span></div><!--/lit-part-->',
      },
    ];
    const only = tests.filter(({ only }) => only);
    const filteredTests = (only.length ? only : tests).filter(({ skip }) => !skip);

    for (const { title, template, result } of filteredTests) {
      it(`should parse template with ${title}`, () => {
        const string = templateToString(new Template(template.split('${x}')));
        expect(string).to.equal(result);
      });
    }
  });

  describe('parsing with values', () => {
    const tests = [
      {
        title: 'quoted attribute',
        template: '<div a="${x}">some text</div>',
        values: [['a']],
        result: '<!--lit-part mNXjfEJ0Ra4=--><div a="a"><!--lit-node 0-->some text</div><!--/lit-part-->',
      },
      {
        title: 'quoted attribute and child value',
        template: '<div a="${x}">some text ${x}</div>',
        values: [['a'], 'here'],
        result:
          '<!--lit-part LgXkfNSe8nY=--><div a="a"><!--lit-node 0-->some text <!--lit-part-->here<!--/lit-part--></div><!--/lit-part-->',
      },
      {
        title: 'quoted attribute and extra whitespace',
        template: '<div a = " ${x} " ></div>',
        values: [['a']],
        result: '<!--lit-part fkksZo0T7A4=--><div a=" a " ><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'quoted attribute and extra strings',
        template: '<div a="some ${x} here"></div>',
        values: [['a']],
        result: '<!--lit-part tWHqicj+8sU=--><div a="some a here"><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'quoted attribute and multiple strings/values',
        template: '<div a=" look ${x} in ${x} "></div>',
        values: [['a', 'a']],
        result: '<!--lit-part wUnUgpIpnBg=--><div a=" look a in a "><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'unquoted attribute',
        template: '<div a=${x}></div>',
        values: [['a']],
        result: '<!--lit-part K+c1m3iKv0M=--><div a="a"><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'unquoted attribute with spaces',
        template: '<div a = ${x} ></div>',
        values: [['a']],
        result: '<!--lit-part ftEFDU044DE=--><div a="a" ><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'element attribute',
        template: '<div ${x}></div>',
        values: [false],
        result: '<!--lit-part liPcn9lj0Ak=--><div ><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'quoted truthy boolean attribute',
        values: [true],
        template: '<div ?a="${x}"></div>',
        result: '<!--lit-part X7msddNbKag=--><div a><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'quoted falsey boolean attribute',
        values: [false],
        template: '<div ?a="${x}"></div>',
        result: '<!--lit-part X7msddNbKag=--><div ><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'unquoted boolean attribute',
        template: '<div ?a=${x}></div>',
        values: [true],
        result: '<!--lit-part d1HzlrsCR78=--><div a><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'quoted event attribute',
        template: '<div @a="${x}"></div>',
        values: [true],
        result: '<!--lit-part X7msdUw8k34=--><div ><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'unquoted event attribute',
        template: '<div @a=${x}></div>',
        values: [true],
        result: '<!--lit-part d1HzlsSFBL4=--><div ><!--lit-node 0--></div><!--/lit-part-->',
      },
      {
        title: 'everything, all at once',
        template:
          '<div boolean a=static b="static" c=${x} d="${x}" ?e=${x} ?f="${x}" .g="some ${x} in ${x}">some <em>text</em> <span b="${x}">wow</span></div>',
        values: [['c'], ['d'], true, false, ['g', 'g'], ['b']],
        result:
          '<!--lit-part zA+faP4z8/g=--><div boolean a=static b="static" c="c" d="d" e  ><!--lit-node 0-->some <em>text</em> <span b="b"><!--lit-node 2-->wow</span></div><!--/lit-part-->',
      },
    ];
    const only = tests.filter(({ only }) => only);
    const filteredTests = (only.length ? only : tests).filter(({ skip }) => !skip);

    for (const { title, template, values, result } of filteredTests) {
      it(`should parse template with ${title}`, () => {
        const string = templateToString(new Template(template.split('${x}')), values);
        expect(string).to.equal(result);
      });
    }
  });
});

/**
 * @param { Template } template
 * @param { Array<unknown> } [values]
 */
function templateToString(template, values) {
  const { strings, parts } = template;
  let result = '';
  let i = 0;
  for (; i < strings.length - 1; i++) {
    const string = strings[i];
    const part = parts[i];
    result += string.toString();
    result += values && part.type !== partType.METADATA ? part.resolveValue(values.shift()) : partTypeToName(part);
  }
  result += strings[i].toString();
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
