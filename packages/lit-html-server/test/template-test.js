// @ts-nocheck
import assert from 'node:assert';
import { Template } from '../src/internal/template.js';
import { templateToString } from './utils.js';

describe('Template class', () => {
  const tests = [
    { title: 'plain text', template: 'text', result: 'text' },
    {
      title: 'plain text value',
      template: 'some ${x} here',
      values: ['text'],
      result: 'some text here',
    },
    {
      title: 'child value',
      template: '<div>${x}</div>',
      values: ['text'],
      result: '<div>text</div>',
    },
    {
      title: 'multiple child values',
      template: '<div>some ${x} here, ${x} too</div>',
      values: ['text', 'here'],
      result: '<div>some text here, here too</div>',
    },
    {
      title: 'quoted attribute',
      template: '<div a="${x}">some text</div>',
      values: [['text']],
      result: '<div a="text"><!--lit-node 0-->some text</div>',
    },
    {
      title: 'quoted attribute and child value',
      template: '<div a="${x}">some text ${x}</div>',
      values: [['text'], 'here'],
      result: '<div a="text"><!--lit-node 0-->some text here</div>',
    },
    {
      title: 'quoted attribute and extra whitespace',
      template: '<div a = " ${x} " ></div>',
      values: [['text']],
      result: '<div a=" text " ><!--lit-node 0--></div>',
    },
    {
      title: 'quoted attribute and extra strings',
      template: '<div a="some ${x} here"></div>',
      values: [['text']],
      result: '<div a="some text here"><!--lit-node 0--></div>',
    },
    {
      title: 'quoted attribute and multiple strings/values',
      template: '<div a=" look ${x} in ${x} "></div>',
      values: [['text', 'here']],
      result: '<div a=" look text in here "><!--lit-node 0--></div>',
    },
    {
      title: 'unquoted attribute',
      template: '<div a=${x}></div>',
      values: [['text']],
      result: '<div a="text"><!--lit-node 0--></div>',
    },
    {
      title: 'unquoted attribute with spaces',
      template: '<div a = ${x} ></div>',
      values: [['text']],
      result: '<div a="text" ><!--lit-node 0--></div>',
    },
    {
      title: 'quoted property attribute',
      template: '<div .a="${x}"></div>',
      values: [],
      result: '<div ><!--lit-node 0--></div>',
    },
    {
      title: 'unquoted property attribute',
      template: '<div .a=${x}></div>',
      values: [],
      result: '<div ><!--lit-node 0--></div>',
    },
    {
      title: 'element attribute',
      template: '<div ${x}></div>',
      values: [],
      result: '<div ><!--lit-node 0--></div>',
    },
    {
      title: 'quoted boolean attribute',
      template: '<div ?a="${x}"></div>',
      values: [true],
      result: '<div a><!--lit-node 0--></div>',
    },
    {
      title: 'unquoted boolean attribute',
      template: '<div ?a=${x}></div>',
      values: [true],
      result: '<div a><!--lit-node 0--></div>',
    },
    {
      title: 'quoted event attribute',
      template: '<div @a="${x}"></div>',
      values: [],
      result: '<div ><!--lit-node 0--></div>',
    },
    {
      title: 'unquoted event attribute',
      template: '<div @a=${x}></div>',
      values: [],
      result: '<div ><!--lit-node 0--></div>',
    },
    {
      title: 'nested attribute metadata',
      template: '<div a="${x}">some <em>text</em> <span b="${x}">wow</span></div>',
      values: [['text'], ['here']],
      result: '<div a="text"><!--lit-node 0-->some <em>text</em> <span b="here"><!--lit-node 2-->wow</span></div>',
    },
    {
      title: 'everything, all at once',
      template:
        '<div boolean a=static b="static" c=${x} d="${x}" ?e=${x} ?f="${x}" .g="some ${x} in ${x}">some <em>text</em> <span b="${x}">wow</span></div>',
      values: [['c'], ['d'], true, true, 'prop', ['here']],
      result:
        '<div boolean a=static b="static" c="c" d="d" e f ><!--lit-node 0-->some <em>text</em> <span b="here"><!--lit-node 2-->wow</span></div>',
    },
  ];
  const only = tests.filter(({ only }) => only);
  const filteredTests = (only.length ? only : tests).filter(({ skip }) => !skip);

  for (const { title, template, result, values } of filteredTests) {
    it(`should parse template with ${title}`, () => {
      const string = templateToString(new Template(template.split('${x}')), values);
      assert(string === result);
    });
  }
});
