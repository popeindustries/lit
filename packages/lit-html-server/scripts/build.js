import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

await esbuild.build({
  bundle: true,
  entryPoints: ['./src/index.js'],
  external: ['lit-html', 'lit-html/*', '*dom-shim.js'],
  format: 'esm',
  target: 'node16',
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
      name: 'empty',
      setup(build) {
        build.onResolve({ filter: /.*/ }, function (args) {
          if (args.path.endsWith('dom-shim.js')) {
            return { namespace: 'empty', path: args.path };
          }
        });
        build.onLoad({ filter: /.*/, namespace: 'empty' }, function (args) {
          return {
            contents: '',
            loader: 'js',
          };
        });
      },
    },
  ],
});

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
