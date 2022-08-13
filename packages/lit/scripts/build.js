import fs from 'node:fs';
import path from 'node:path';

const decoratorsDir = path.resolve('../lit-element/decorators');
const directivesDir = path.resolve('../lit-html/directives');
const serverDirectivesDir = path.resolve('../lit-html-server/directives');
const litHtmlFiles = ['async-directive', 'directive-helpers', 'directive', 'static'];
const litElementFiles = ['decorators'];

if (!fs.existsSync(path.resolve('decorators'))) {
  fs.mkdirSync(path.resolve('decorators'));
}
if (!fs.existsSync(path.resolve('directives'))) {
  fs.mkdirSync(path.resolve('directives'));
}

// Copy all decorators
for (const basePath of fs.readdirSync(decoratorsDir)) {
  if (basePath.endsWith('.js') || basePath.endsWith('.d.ts')) {
    fs.copyFileSync(path.resolve(decoratorsDir, basePath), path.resolve('decorators', basePath));
  }
}

// Copy all directives
for (const basePath of fs.readdirSync(directivesDir)) {
  if (basePath.endsWith('.js') || basePath.endsWith('.d.ts')) {
    fs.copyFileSync(path.resolve(directivesDir, basePath), path.resolve('directives', basePath));
  }
}

// Copy all server directives
for (const basePath of fs.readdirSync(serverDirectivesDir)) {
  if (basePath.endsWith('.js') || basePath.endsWith('.d.ts')) {
    const ext = /(\.js|\.d\.ts)/.exec(basePath)?.[1] ?? '';
    const name = basePath.replace(ext, '');
    fs.copyFileSync(path.resolve(serverDirectivesDir, basePath), path.resolve('directives', `${name}-server${ext}`));
  }
}

// Copy some lit-html files
for (const name of litHtmlFiles) {
  const src = path.resolve('../lit-html', name);
  const dest = path.resolve(name);
  fs.copyFileSync(`${src}.js`, `${dest}.js`);
  fs.copyFileSync(`${src}.d.ts`, `${dest}.d.ts`);
}

// Copy some lit-element files
for (const name of litElementFiles) {
  const src = path.resolve('../lit-element', name);
  const dest = path.resolve(name);
  fs.copyFileSync(`${src}.js`, `${dest}.js`);
  fs.copyFileSync(`${src}.d.ts`, `${dest}.d.ts`);
}
