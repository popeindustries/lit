import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('./src');
const vendorSrcDir = path.join(srcDir, 'vendor');
const destDir = path.resolve();

if (!fs.existsSync(path.resolve('directives'))) {
  fs.mkdirSync(path.resolve('directives'));
}

const define = {
  DEV_MODE: 'false',
  ENABLE_EXTRA_SECURITY_HOOKS: 'false',
  ENABLE_SHADYDOM_NOPATCH: 'false',
  NODE_MODE: 'false',
};
const buildVendorEntryPoints = [];

buildVendor();

function buildVendor(dir = '') {
  if (dir && !fs.existsSync(path.resolve(destDir, dir))) {
    fs.mkdirSync(path.resolve(destDir, dir));
  }

  for (const basename of fs.readdirSync(path.join(vendorSrcDir, dir))) {
    const filepath = path.join(vendorSrcDir, dir, basename);
    const ext = path.extname(basename);

    if (ext === '.ts') {
      fs.copyFileSync(filepath, path.join(destDir, dir, basename));
    } else if (ext === '.js') {
      buildVendorEntryPoints.push(filepath);
    } else if (ext === '') {
      buildVendor(basename);
    }
  }
}

await esbuild.build({
  bundle: false,
  define,
  entryPoints: buildVendorEntryPoints,
  format: 'esm',
  target: 'es2020',
  minify: true,
  platform: 'browser',
  outdir: '.',
  plugins: [replacePlugin()],
});

// Copy all root src files
for (const basename of fs.readdirSync(srcDir)) {
  const filepath = path.join(srcDir, basename);
  const ext = path.extname(basename);

  if (ext === '.ts' || ext === '.js') {
    fs.copyFileSync(filepath, path.join(destDir, basename));
  }
}

// Bundle lit-html.js
await esbuild.build({
  bundle: true,
  define,
  entryPoints: ['./src/lit-html.js'],
  format: 'esm',
  target: 'es2020',
  minify: true,
  platform: 'browser',
  outdir: '.',
  plugins: [
    replacePlugin(),
    {
      // Rewrite externals paths
      name: 'externals',
      setup(build) {
        build.onResolve({ filter: /.*/ }, function (args) {
          if (args.path.includes('directive')) {
            return { path: `./${path.basename(args.path)}`, external: true };
          }
        });
      },
    },
  ],
});

function replacePlugin() {
  return {
    name: 'replace',
    setup(build) {
      build.onLoad({ filter: /.js/ }, function (args) {
        return {
          contents: fs
            .readFileSync(args.path, 'utf8')
            .replace('const DEV_MODE = true;', '')
            .replace('const ENABLE_EXTRA_SECURITY_HOOKS = true;', '')
            .replace('const ENABLE_SHADYDOM_NOPATCH = true;', '')
            .replace('const NODE_MODE = false;', ''),
          loader: 'js',
        };
      });
    },
  };
}
