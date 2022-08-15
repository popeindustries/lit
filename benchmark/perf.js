// @ts-nocheck
import autocannon from 'autocannon';
import { fileURLToPath } from 'node:url';
import { fork } from 'node:child_process';
import path from 'node:path';

const url = `http://localhost:3000`;
const server = process.argv[2] === 'ssr' ? './server-lit.js' : './server.js';
const child = fork(path.resolve(path.dirname(fileURLToPath(import.meta.url)), server), { silent: false });

(async () => {
  await stress();
  child.kill();
  process.exit();
})();

function stress() {
  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url,
        connections: 100,
        pipelining: 10,
        duration: 10,
      },
      async (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      },
    );
    autocannon.track(instance, { renderProgressBar: true });
  });
}
