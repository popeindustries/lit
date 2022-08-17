import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();

for (const pkg of ['lit-element', 'lit-html']) {
  process.chdir(path.join(cwd, 'packages', pkg));

  const srcDir = path.resolve(`./node_modules/${pkg}/development`);
  const destDir = path.resolve('./src/vendor');

  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir);

  vendor(srcDir, destDir);
}

/**
 * @param { string } srcDir
 * @param { string } destDir
 * @param { string } dir
 */
function vendor(srcDir, destDir, dir = '') {
  for (const basename of fs.readdirSync(path.join(srcDir, dir))) {
    if (/index|hydrate|ssr|polyfill/.test(basename)) {
      continue;
    }

    const ext = path.extname(basename);

    if (ext === '.js') {
      copy(srcDir, destDir, dir, basename);
    } else if (ext === '') {
      vendor(srcDir, destDir, basename);
    }
  }
}
/**
 * @param { string } srcDir
 * @param { string } destDir
 * @param { string } dir
 * @param { string } basename
 */
function copy(srcDir, destDir, dir, basename) {
  const src = path.join(srcDir, dir, basename);
  const dest = path.join(destDir, dir, basename);

  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest));
  }

  const regex = /\s?from\s?["'](lit-html)["'];/g;
  let code = fs.readFileSync(src, 'utf8');

  if (regex.test(code)) {
    const types = fs.readFileSync(src.replace('.js', '.d.ts'), 'utf8');

    fs.writeFileSync(
      dest,
      code.replaceAll(regex, (match, g) => match.replace(g, '@popeindustries/lit-html')),
    );
    fs.writeFileSync(
      dest.replace('.js', '.d.ts'),
      types.replaceAll(regex, (match, g) => match.replace(g, '@popeindustries/lit-html')),
    );
  } else {
    fs.copyFileSync(src, dest);
    fs.copyFileSync(src.replace('.js', '.d.ts'), dest.replace('.js', '.d.ts'));
  }
}
