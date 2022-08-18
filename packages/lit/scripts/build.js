import fs from 'node:fs';
import path from 'node:path';

const decoratorsDir = path.resolve('../lit-element/vendor/decorators');
const directivesDir = path.resolve('../lit-html/vendor/directives');
const serverDirectivesDir = path.resolve('../lit-html-server/directives');
const srcDir = path.resolve('./src');
const litHtmlFiles = ['vendor/async-directive', 'vendor/directive-helpers', 'vendor/directive', 'vendor/static'];
const litElementFiles = ['vendor/decorators'];

if (!fs.existsSync(path.resolve('decorators'))) {
  fs.mkdirSync(path.resolve('decorators'));
}
if (!fs.existsSync(path.resolve('directives'))) {
  fs.mkdirSync(path.resolve('directives'));
}

// Copy all decorators
for (const basename of fs.readdirSync(decoratorsDir)) {
  if (basename.endsWith('.js') || basename.endsWith('.d.ts')) {
    const moduleName = basename.replace(/\.js|\.d\.ts/, '.js');
    fs.writeFileSync(
      path.resolve('decorators', basename),
      `export * from '@popeindustries/lit-element/decorators/${moduleName}';`,
    );
  }
}

// Copy all directives
for (const basename of fs.readdirSync(directivesDir)) {
  if (basename.endsWith('.js') || basename.endsWith('.d.ts')) {
    const moduleName = basename.replace(/\.js|\.d\.ts/, '.js');
    fs.writeFileSync(
      path.resolve('directives', basename),
      `export * from '@popeindustries/lit-html/directives/${moduleName}';`,
    );
  }
}

// Copy all server directives
for (const basename of fs.readdirSync(serverDirectivesDir)) {
  if (basename.endsWith('.js') || basename.endsWith('.d.ts')) {
    const ext = /(\.js|\.d\.ts)/.exec(basename)?.[1] ?? '';
    const name = basename.replace(ext, '');
    fs.writeFileSync(
      path.resolve('directives', `${name}-server${ext}`),
      `export * from '@popeindustries/lit-html-server/directives/${name}.js';`,
    );
  }
}

// Copy some lit-html files
for (const name of litHtmlFiles) {
  const dest = path.resolve(path.basename(name));
  const moduleName = path.basename(name).replace(/\.js|\.d\.ts/, '.js');
  const code = `export * from '@popeindustries/lit-html/${moduleName}.js';`;
  fs.writeFileSync(`${dest}.js`, code);
  fs.writeFileSync(`${dest}.d.ts`, code);
}

// Copy some lit-element files
for (const name of litElementFiles) {
  const dest = path.resolve(path.basename(name));
  const moduleName = path.basename(name).replace(/\.js|\.d\.ts/, '.js');
  const code = `export * from '@popeindustries/lit-element/${moduleName}.js';`;
  fs.writeFileSync(`${dest}.js`, code);
  fs.writeFileSync(`${dest}.d.ts`, code);
}

// Copy src files
for (const basename of fs.readdirSync(srcDir)) {
  if (basename.endsWith('.js')) {
    const src = path.resolve(srcDir, basename);
    const dest = path.resolve(basename);
    fs.copyFileSync(src, dest);
    fs.copyFileSync(src.replace('.js', '.d.ts'), dest.replace('.js', '.d.ts'));
  }
}
