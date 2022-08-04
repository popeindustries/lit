import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

await esbuild.build({
  bundle: true,
  entryPoints: ['./src/hydrate.js'],
  external: ['lit-html', 'lit-html/*'],
  format: 'esm',
  format: 'esm',
  target: 'es2020',
  platform: 'browser',
  outdir: '.',
});

const typesHydrate = fs
  .readFileSync(path.resolve('src/types-hydrate.d.ts'), 'utf8')
  .replace(/(declare) (interface|type|enum|namespace|function|class)/g, 'export $2');

fs.writeFileSync(
  path.resolve('hydrate.d.ts'),
  `${typesHydrate}\n${fs.readFileSync(path.resolve('src/hydrate.d.ts'), 'utf8')}`,
);

// if (!fs.existsSync(path.resolve('directives'))) {
//   fs.mkdirSync(path.resolve('directives'));
// }

// for (const basePath of fs.readdirSync(path.resolve('src/directives'))) {
//   fs.copyFileSync(path.resolve('src/directives', basePath), path.resolve('directives', basePath));
// }
