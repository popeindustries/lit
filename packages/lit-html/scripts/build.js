import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { vendorBuild } from '../../../scripts/vendor-build.js';

vendorBuild(path.resolve('./src/vendor'), path.resolve('./vendor'), [path.resolve('./node_modules/lit-html')]);

const RE_SKIP = /index\.js|private-ssr-support/;

const srcDir = path.resolve('./src');
const destDir = path.resolve();

// Copy some root src files
for (const basename of fs.readdirSync(srcDir)) {
  const filepath = path.join(srcDir, basename);
  const ext = path.extname(basename);

  if (!RE_SKIP.test(basename) && (ext === '.ts' || ext === '.js')) {
    fs.copyFileSync(filepath, path.join(destDir, basename));
  }
}

await esbuild.build({
  bundle: true,
  entryPoints: ['./src/index.js'],
  external: ['./vendor/*'],
  format: 'esm',
  target: 'es2020',
  platform: 'browser',
  outfile: 'index.js',
});
