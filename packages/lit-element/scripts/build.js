import fs from 'node:fs';
import path from 'node:path';

const litDecoratorsDir = path.resolve('./node_modules/@lit/reactive-element/decorators');

if (!fs.existsSync(path.resolve('decorators'))) {
  fs.mkdirSync(path.resolve('decorators'));
}

// Copy all lit-element decorators
for (const basePath of fs.readdirSync(litDecoratorsDir)) {
  if (basePath.endsWith('.js') || basePath.endsWith('.d.ts')) {
    const dest = path.resolve('decorators', basePath);
    const importPath = basePath.replace('.d.ts', '.js');
    fs.writeFileSync(dest, `export * from '@lit/reactive-element/decorators/${importPath}';`);
  }
}
