import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { vendorBuild } from '../../../scripts/vendor-build.js';

const RE_SKIP_SRC_COPY = /index\.js|private-ssr-support/;
const RE_SKIP_VENDOR_COPY = /lit-html|private-async-helpers/;

const srcDir = path.resolve('./src');
const vendorDest = path.resolve('./vendor');
const vendorSrc = path.resolve('./src/vendor');

if (!fs.existsSync(path.resolve('directives'))) {
  fs.mkdirSync(path.resolve('directives'));
}

vendorBuild(vendorSrc, vendorDest, [path.resolve('./node_modules/lit-html')]);

// Copy some root src files
for (const basename of fs.readdirSync(srcDir)) {
  const filepath = path.resolve(srcDir, basename);

  if (!RE_SKIP_SRC_COPY.test(basename) && (basename.endsWith('.js') || basename.endsWith('.d.ts'))) {
    fs.copyFileSync(filepath, path.resolve(basename));
  }
}

// Generate aliases for vendored files.
// This could be done in package.json#exports, but TS isn't able to resolve aliases.
for (const basename of fs.readdirSync(vendorSrc)) {
  if (!RE_SKIP_VENDOR_COPY.test(basename)) {
    if (basename.endsWith('.js') || basename.endsWith('.d.ts')) {
      const moduleName = basename.replace(/\.js|\.d\.ts/, '.js');
      fs.writeFileSync(path.resolve(basename), `export * from './vendor/${moduleName}';`);
    }
  }
}
for (const basename of fs.readdirSync(path.join(vendorSrc, 'directives'))) {
  if (!RE_SKIP_VENDOR_COPY.test(basename)) {
    if (basename.endsWith('.js') || basename.endsWith('.d.ts')) {
      const moduleName = basename.replace(/\.js|\.d\.ts/, '.js');
      fs.writeFileSync(path.resolve('directives', basename), `export * from '../vendor/directives/${moduleName}';`);
    }
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
