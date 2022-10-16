import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();

vendorPkg('lit-html', './node_modules/lit-html/development', './src/vendor', true);
vendorPkg('lit-element', './node_modules/lit-element/development', './src/vendor', true);
vendorPkg('lit-element', './node_modules/@lit/reactive-element/development', './src/vendor', false);

/**
 * @param { string } pkg
 * @param { string } srcDir
 * @param { string } destDir
 * @param { boolean } clear
 */
function vendorPkg(pkg, srcDir, destDir, clear) {
  process.chdir(path.join(cwd, 'packages', pkg));

  if (clear && fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  vendor(srcDir, destDir);
}

/**
 * @param { string } srcDir
 * @param { string } destDir
 * @param { string } dir
 */
function vendor(srcDir, destDir, dir = '') {
  for (const basename of fs.readdirSync(path.join(srcDir, dir))) {
    if (/index|hydrate|ssr|polyfill|is-server/.test(basename)) {
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

  const reLitHtml = /\s?from\s?["'](lit-html)["'];/g;
  const reReactiveElement = /\s?from\s?["'](@lit\/reactive-element)["'];/g;
  let code = fs.readFileSync(src, 'utf8');
  let types = fs.readFileSync(src.replace('.js', '.d.ts'), 'utf8');
  let copy = true;

  if (reLitHtml.test(code)) {
    copy = false;
    code = code.replaceAll(reLitHtml, (match, g) => match.replace(g, '@popeindustries/lit-html'));
    types = types.replaceAll(reLitHtml, (match, g) => match.replace(g, '@popeindustries/lit-html'));
  }
  if (reReactiveElement.test(code)) {
    copy = false;
    code = code.replaceAll(reReactiveElement, (match, g) => match.replace(g, './reactive-element.js'));
    types = types.replaceAll(reReactiveElement, (match, g) => match.replace(g, './reactive-element.js'));
  }

  if (copy) {
    fs.copyFileSync(src, dest);
    fs.copyFileSync(src.replace('.js', '.d.ts'), dest.replace('.js', '.d.ts'));
  } else {
    fs.writeFileSync(dest, code);
    fs.writeFileSync(dest.replace('.js', '.d.ts'), types);
  }
}
