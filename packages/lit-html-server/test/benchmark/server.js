import { CustomElement, Renderer } from './custom-element.js';
import { html, renderToNodeStream } from '../../index.js';
import everything from './the-everything-bagel-template.js';
import http from 'http';
import { hydratable } from '../../directives/hydratable.js';

customElements.define('custom-element', CustomElement);

/**
 * @param { { title: string, isTrue: boolean, number: number } } data
 */
function template(data) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${data.title}</title>
      </head>
      <body>
        ${hydratable(everything(data))}
      </body>
    </html>
  `;
}

http
  .createServer((req, res) => {
    const data = {
      title: new Date().toISOString(),
      isTrue: Math.random() > 0.5,
      number: Math.random() * 100,
    };
    res.writeHead(200);
    const stream = renderToNodeStream(template(data), { elementRenderers: [Renderer] });
    stream.pipe(res);
  })
  .listen(3000);
