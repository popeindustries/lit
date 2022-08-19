import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

await esbuild.build({
  bundle: true,
  entryPoints: ['./src/lit-html-server.js'],
  external: ['lit-html', 'lit-html/*', './dom-shim.js', './element-renderer.js'],
  format: 'esm',
  target: 'node16',
  platform: 'node',
  outfile: 'lit-html-server.js',
});

await esbuild.build({
  bundle: true,
  entryPoints: ['./src/internal/element-renderer.js'],
  format: 'esm',
  target: 'node16',
  platform: 'node',
  outfile: 'element-renderer.js',
});

await esbuild.build({
  bundle: true,
  entryPoints: ['./src/lit-html-server.js'],
  external: ['lit-html', 'lit-html/*'],
  format: 'esm',
  target: 'es2020',
  platform: 'browser',
  outfile: 'lit-html-service-worker.js',
  plugins: [
    {
      // Replace contents of `dom-shim.js` with empty string
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

fs.writeFileSync(
  path.resolve('lit-html-server.d.ts'),
  `${types}\n${fs.readFileSync(path.resolve('src/lit-html-server.d.ts'), 'utf8')}`,
);

fs.copyFileSync(path.resolve('src/internal/element-renderer.d.ts'), path.resolve('element-renderer.d.ts'));
fs.copyFileSync(path.resolve('src/dom-shim.js'), path.resolve('dom-shim.js'));

if (!fs.existsSync(path.resolve('directives'))) {
  fs.mkdirSync(path.resolve('directives'));
}

for (const basePath of fs.readdirSync(path.resolve('src/directives'))) {
  fs.copyFileSync(path.resolve('src/directives', basePath), path.resolve('directives', basePath));
}
