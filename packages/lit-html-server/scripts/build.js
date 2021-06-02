// @ts-nocheck

import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const IMPORT_MAP = {
  './internal/node-stream-template-renderer.js': './src/internal/browser-stream-template-renderer.js',
  './dom-shim.js': false,
  buffer: './src/internal/browser-buffer.js',
  stream: './src/internal/browser-stream.js',
};

(async function main() {
  await esbuild.build({
    bundle: true,
    entryPoints: ['./src/index.js'],
    external: ['lit-html', 'lit-html/*', '*dom-shim.js'],
    format: 'esm',
    target: 'node13.2',
    platform: 'node',
    outfile: 'index.js',
  });

  await esbuild.build({
    bundle: true,
    entryPoints: ['./src/index.js'],
    external: ['lit-html', 'lit-html/*'],
    format: 'esm',
    target: 'es2020',
    platform: 'browser',
    outfile: 'browser.js',
    plugins: [
      {
        name: 'import-map',
        setup(build) {
          build.onResolve({ filter: /.*/ }, function (args) {
            if (args.path in IMPORT_MAP) {
              const value = IMPORT_MAP[args.path];
              if (value) {
                return { path: path.resolve(value) };
              } else {
                return { namespace: 'exclude', path: args.path };
              }
            }
          });
          build.onLoad({ filter: /.*/, namespace: 'exclude' }, function (args) {
            return {
              contents: '// nothing here',
              loader: 'js',
            };
          });
        },
      },
    ],
  });
})();

const types = fs
  .readFileSync(path.resolve('src/internal/types.d.ts'), 'utf8')
  .replace(/(declare) (interface|type|enum|namespace|function|class)/g, 'export $2');

fs.writeFileSync(path.resolve('index.d.ts'), `${types}\n${fs.readFileSync(path.resolve('src/index.d.ts'), 'utf8')}`);
fs.copyFileSync(path.resolve('src/dom-shim.js'), path.resolve('dom-shim.js'));

if (!fs.existsSync(path.resolve('directives'))) {
  fs.mkdirSync(path.resolve('directives'));
}

for (const basePath of fs.readdirSync(path.resolve('src/directives'))) {
  fs.copyFileSync(path.resolve('src/directives', basePath), path.resolve('directives', basePath));
}
