import { html, renderToStream } from '../../index.js';
import everything from './the-everything-bagel-template.js';
import http from 'http';

http
  .createServer((req, res) => {
    const data = {
      title: new Date().toISOString(),
      isTrue: Math.random() > 0.5,
      number: Math.random() * 100,
    };
    res.writeHead(200);
    const stream = renderToStream(template(data));
    stream.pipe(res);
  })
  .listen(3000);

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
        ${everything(html, data)}
      </body>
    </html>
  `;
}
