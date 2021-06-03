import { html, renderToString } from '../../src/index.js';
import everything from './the-everything-bagel-template.js';
import { html as litHtml } from 'lit-html';
import { render } from '@lit-labs/ssr';

const data = {
  title: 'title',
  isTrue: true,
  number: 42,
};

if (process.argv[2] === 'ssr') {
  renderToString(render(everything(litHtml, data))).then((str) =>
    console.log(
      str.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;quot;', '"').replaceAll('&quot;', '"'),
    ),
  );
} else {
  renderToString(everything(html, data), { includeRehydrationMetadata: true }).then(console.log);
}
