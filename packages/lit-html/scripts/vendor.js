import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('./node_modules/lit-html/development');
const destDir = path.resolve('./src/vendor');

if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir);

vendor();

/**
 * @param { string } dir
 */
function vendor(dir = '') {
  for (const basename of fs.readdirSync(path.join(srcDir, dir))) {
    if (basename.includes('hydrate') || basename.includes('ssr') || basename.includes('polyfill')) {
      continue;
    }
    const ext = path.extname(basename);

    if (ext === '.js') {
      copy(basename, dir);
    } else if (ext === '') {
      vendor(basename);
    }
  }
}
/**
 * @param { string } basename
 * @param { string } dir
 */
function copy(basename, dir) {
  const src = path.join(srcDir, dir, basename);
  const dest = path.join(destDir, dir, basename);

  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest));
  }
  fs.copyFileSync(src, dest);
  fs.copyFileSync(src.replace('.js', '.d.ts'), dest.replace('.js', '.d.ts'));
}
