// @ts-nocheck
import assert from 'assert';
import { getTemplate } from '../src/internal/template.js';
import { templateToString } from './utils.js';

describe('Parse', () => {
  const tests = [
    {
      title: 'child value',
      template: '<div>${x}</div>',
      result: '<div>[CHILD]</div>',
    },
    {
      title: 'multiple child values',
      template: '<div>some ${x} here, ${x} too</div>',
      result: '<div>some [CHILD] here, [CHILD] too</div>',
    },
    {
      title: 'static attribute and child value',
      template: '<div a="text">${x}</div>',
      result: '<div a="text">[CHILD]</div>',
    },
    {
      title: 'quoted attribute',
      template: '<div a="${x}">some text</div>',
      result: '<div[ATTR]>[METADATA]some text</div>',
    },
    {
      title: 'quoted attribute and child value',
      template: '<div a="${x}">some text ${x}</div>',
      result: '<div[ATTR]>[METADATA]some text [CHILD]</div>',
    },
    {
      title: 'quoted attribute with extra whitespace',
      template: '<div a = " ${x} " ></div>',
      result: '<div[ATTR]>[METADATA]</div>',
    },
    {
      title: 'quoted attribute with extra strings',
      template: '<div a="some ${x} here"></div>',
      result: '<div[ATTR]>[METADATA]</div>',
    },
    {
      title: 'quoted attribute with multiple strings/values',
      template: '<div a=" look ${x} in ${x} "></div>',
      result: '<div[ATTR]>[METADATA]</div>',
    },
    {
      title: 'static attribute and quoted attribute with multiple strings/values',
      template: '<div a="text" b=" look ${x} in ${x} "></div>',
      result: '<div[ATTR]>[METADATA]</div>',
    },
    {
      title: 'unquoted attribute',
      template: '<div a=${x}></div>',
      result: '<div[ATTR]>[METADATA]</div>',
    },
    {
      title: 'unquoted attribute with spaces',
      template: '<div a = ${x} ></div>',
      result: '<div[ATTR]>[METADATA]</div>',
    },
    {
      title: 'quoted property attribute',
      template: '<div .a="${x}"></div>',
      result: '<div[ATTR]>[METADATA]</div>',
    },
    {
      title: 'unquoted property attribute',
      template: '<div .a=${x}></div>',
      result: '<div[ATTR]>[METADATA]</div>',
    },
    {
      title: 'element attribute',
      template: '<div ${x}></div>',
      result: '<div[ATTR]>[METADATA]</div>',
    },
    {
      title: 'quoted boolean attribute',
      template: '<div ?a="${x}"></div>',
      result: '<div[ATTR]>[METADATA]</div>',
    },
    {
      title: 'unquoted boolean attribute',
      template: '<div ?a=${x}></div>',
      result: '<div[ATTR]>[METADATA]</div>',
    },
    {
      title: 'quoted event attribute',
      template: '<div @a="${x}"></div>',
      result: '<div[ATTR]>[METADATA]</div>',
    },
    {
      title: 'unquoted event attribute',
      template: '<div @a=${x}></div>',
      result: '<div[ATTR]>[METADATA]</div>',
    },
    {
      title: 'custom element with static attribute',
      template: '<my-el a="text"></my-el>',
      result: '<my-el[CUSTOM-ELEMENT-OPEN]</my-el[CUSTOM-ELEMENT-CLOSE]>',
    },
  ];

  const only = tests.filter(({ only }) => only);

  for (const { title, template, result, skip } of only.length ? only : tests) {
    const fullTitle = `${title}`;

    if (skip) {
      it.skip(fullTitle);
    } else {
      it(fullTitle, async () => {
        const string = templateToString(getTemplate(template.split('${x}')));
        try {
          assert(string === result);
        } catch (err) {
          console.error(string);
          throw err;
        }
      });
    }
  }
});
