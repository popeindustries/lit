import fs from 'node:fs';
import path from 'node:path';
import { vendorBuild } from '../../../scripts/vendor-build.js';

vendorBuild(path.resolve('./src/vendor'), path.resolve('./vendor'), [
  path.resolve('./node_modules/@lit/reactive-element'),
  path.resolve('./node_modules/lit-element'),
]);

const srcDir = path.resolve('./src');
const destDir = path.resolve();

// Copy all root src files
for (const basename of fs.readdirSync(srcDir)) {
  const filepath = path.join(srcDir, basename);
  const ext = path.extname(basename);

  if (ext === '.ts' || ext === '.js') {
    fs.copyFileSync(filepath, path.join(destDir, basename));
  }
}
