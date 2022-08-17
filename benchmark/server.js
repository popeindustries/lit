import { html, renderToNodeStream } from '@popeindustries/lit-html-server';
import everything from './the-everything-bagel-template.js';
import http from 'node:http';
import { hydratable } from '@popeindustries/lit-html-server/directives/hydratable.js';
import { LitElementRenderer } from '@popeindustries/lit-element/lit-element-renderer.js';

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
  .createServer(async (req, res) => {
    const data = {
      title: new Date().toISOString(),
      isTrue: Math.random() > 0.5,
      number: Math.random() * 100,
    };
    res.writeHead(200);
    const stream = renderToNodeStream(template(data), { elementRenderers: [LitElementRenderer] });
    stream.pipe(res);
  })
  .listen(3000);