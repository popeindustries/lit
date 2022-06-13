// @ts-nocheck
import { readTemplateResult, renderLitTemplate } from './utils.js';
import assert from 'assert';
import { html as h } from 'lit-html';
import { html } from '../src/index.js';

describe('TemplateResult', () => {
  const tests = [
    {
      title: 'plain text',
      template: h`text`,
      result: '<!--lit-part iW9ZALRtWQA=-->text<!--/lit-part-->',
    },
    {
      title: 'text value',
      template: h`some ${'text'} here`,
      result: '<!--lit-part m4ZhgXUCc3w=-->some <!--lit-part-->text<!--/lit-part--> here<!--/lit-part-->',
    },
    {
      title: 'number value',
      template: h`some number ${1}`,
      result: '<!--lit-part /jZggcn/N2U=-->some number <!--lit-part-->1<!--/lit-part--><!--/lit-part-->',
    },
    {
      title: 'boolean value',
      template: h`this is ${true}`,
      result: '<!--lit-part y7lzfLepcXw=-->this is <!--lit-part-->true<!--/lit-part--><!--/lit-part-->',
    },
    {
      title: 'null value',
      template: h`${null}`,
      result: '<!--lit-part BRUAAAUVAAA=--><!--lit-part--><!--/lit-part--><!--/lit-part-->',
    },
    {
      title: 'undefined value',
      template: h`${undefined}`,
      result: '<!--lit-part BRUAAAUVAAA=--><!--lit-part--><!--/lit-part--><!--/lit-part-->',
    },
    {
      skip: true,
      title: 'array value',
      template: h`some numbers ${[1, 2, 3]}`,
      result:
        '<!--lit-part nhZnrZr/N2U=-->some numbers <!--lit-part--><!--lit-part-->1<!--/lit-part--><!--lit-part-->2<!--/lit-part--><!--lit-part-->3<!--/lit-part--><!--/lit-part--><?><!--/lit-part-->',
    },
    {
      skip: true,
      title: 'nested array value',
      template: h`a lot of numbers ${[1, 2, [3, [4, 5]]]} here`,
      result:
        '<!--lit-part Fkt3nGMEi5o=-->a lot of numbers <!--lit-part--><!--lit-part-->1<!--/lit-part--><!--lit-part-->2<!--/lit-part--><!--lit-part--><!--lit-part-->3<!--/lit-part--><!--lit-part--><!--lit-part-->4<!--/lit-part--><!--lit-part-->5<!--/lit-part--><!--/lit-part--><!--/lit-part--><!--/lit-part--> here<!--/lit-part-->',
    },
    {
      title: 'quoted attribute value',
      template: h`<div a="${'text'}"></div>`,
      result: '<!--lit-part gYgzm5LkVDI=--><div a="text"><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'quoted attribute value and extra whitespace',
      template: h`<div a = " ${'text'} "></div>`,
      result: '<!--lit-part lhMrZqX4Dm0=--><div a=" text "><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'quoted attribute value and multiple strings/values',
      template: h`<div a="this is ${'some'} ${'text'}">${'node'}</div>`,
      result:
        '<!--lit-part D6xN2GCdvaE=--><div a="this is some text"><!--lit-node 0--><!--lit-part-->node<!--/lit-part--></div><!--/lit-part-->',
    },
    {
      title: 'quoted attribute value and array value',
      template: h`<div a="${[1, 2, 3]}"></div>`,
      result: '<!--lit-part gYgzm5LkVDI=--><div a="1,2,3"><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'unquoted attribute value',
      template: h`<div a=${'text'}></div>`,
      result: '<!--lit-part K+c1m3iKv0M=--><div a="text"><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'boolean attribute value',
      template: h`<div ?a="${true}"></div>`,
      result: '<!--lit-part X7msddNbKag=--><div a><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'event attribute value',
      template: h`<div @a="${'some event'}"></div>`,
      result: '<!--lit-part X7msdUw8k34=--><div ><!--lit-node 0--></div><!--/lit-part-->',
    },
    {
      title: 'property attribute value',
      template: h`<div .a="${'some prop'}"></div>`,
      result: '<!--lit-part X7msdWIx9Mg=--><div ><!--lit-node 0--></div><!--/lit-part-->',
    },
  ];
  const only = tests.filter(({ only }) => only);

  for (const { title, template, result, skip } of only.length ? only : tests) {
    const t = `should generate result with ${title}`;

    if (skip) {
      it.skip(t);
    } else {
      it(t, async () => {
        const lit = renderLitTemplate(template);
        const string = await readTemplateResult(html(template.strings, ...template.values));
        if (string !== lit) {
          console.warn(`not valid with lit ssr: \n++${string}\n--${lit}`);
        }
        assert(string === result);
      });
    }
  }
});
