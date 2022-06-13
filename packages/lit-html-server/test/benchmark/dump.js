import { render } from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';
import { html, renderToString } from '../../src/index.js';
import everything from './the-everything-bagel-template.js';
import { html as litHtml } from 'lit-html';

const data = {
  title: 'title',
  isTrue: true,
  number: 42,
};

if (process.argv[2] === 'ssr') {
  let buffer = '';
  for (const chunk of render(everything(litHtml, data))) {
    buffer += chunk;
  }
  console.log(
    buffer.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;quot;', '"').replaceAll('&quot;', '"'),
  );
} else {
  renderToString(everything(html, data), { includeRehydrationMetadata: true }).then(console.log);
}
