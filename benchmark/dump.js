import { CustomElement, Renderer } from './custom-element.js';
import { html, renderToString } from '@popeindustries/lit-html-server';
import everything from './the-everything-bagel-template.js';
import { render } from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';
import { hydratable } from '@popeindustries/lit-html-server/directives/hydratable.js';

const data = {
  title: 'title',
  isTrue: true,
  number: 42,
};

if (process.argv[2] === 'ssr') {
  let buffer = '';
  for (const chunk of render(everything(data))) {
    buffer += chunk;
  }
  console.log(
    buffer.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;quot;', '"').replaceAll('&quot;', '"'),
  );
} else {
  customElements.define('custom-element', CustomElement);
  renderToString(html`${hydratable(everything(data))}`, { elementRenderers: [Renderer] }).then(console.log);
}
