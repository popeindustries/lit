import { render } from '@lit-labs/ssr';
import { css, html, LitElement } from 'lit';
import everything, { registerMyEl } from './the-everything-bagel-template.js';
import { Readable } from 'node:stream';
import http from 'node:http';

registerMyEl(LitElement, html, css);

http
  .createServer((req, res) => {
    const data = {
      title: new Date().toISOString(),
      isTrue: Math.random() > 0.5,
      number: Math.random() * 100,
    };
    res.writeHead(200);

    const stream = Readable.from(template(data));
    stream.pipe(res);
  })
  .listen(3000);

/**
 * @param { { title: string, isTrue: boolean, number: number } } data
 */
function* template(data) {
  yield `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${data.title}</title>
      </head>
      <body>`;
  yield* render(everything(data, html));
  yield `</body></html>`;
}
