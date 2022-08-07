import fs from 'node:fs';
import path from 'node:path';

const litDirectivesDir = path.resolve('./node_modules/lit-html/directives');

if (!fs.existsSync(path.resolve('directives'))) {
  fs.mkdirSync(path.resolve('directives'));
}

// Copy all lit-html directives
for (const basePath of fs.readdirSync(litDirectivesDir)) {
  if (basePath.endsWith('.js') || basePath.endsWith('.d.ts')) {
    const dest = path.resolve('directives', basePath);
    const importPath = basePath.replace('.d.ts', '.js');
    fs.writeFileSync(dest, `export * from 'lit-html/directives/${importPath}';`);
  }
}
