import { render } from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';
import { html as h } from 'lit-html';

const templates = [
  h`some ${'text'} here`,
  h`${null}`,
  h`${undefined}`,
  h`<div>${'text'}</div>`,
  h`<div>some ${'text'} here ${'text'} too</div>`,
  h`<div a="${'text'}">some text</div>`,
];

for (const template of templates) {
  let buffer = '';
  for (const chunk of render(template)) {
    buffer += chunk;
  }
  console.log('\n');
  console.log(template.strings.join('[VALUE]'));
  console.log(
    buffer.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;quot;', '"').replaceAll('&quot;', '"'),
  );
}
