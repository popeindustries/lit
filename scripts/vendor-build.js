import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const define = {
  DEV_MODE: 'false',
  ENABLE_EXTRA_SECURITY_HOOKS: 'false',
  ENABLE_SHADYDOM_NOPATCH: 'false',
  NODE_MODE: 'false',
};

/**
 * @param { string } srcDir
 * @param { string } destDir
 */
export async function vendorBuild(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  const entryPoints = copyFiles(srcDir, destDir);

  await esbuild.build({
    bundle: false,
    define,
    entryPoints,
    format: 'esm',
    minify: true,
    outdir: destDir,
    platform: 'browser',
    plugins: [replacePlugin()],
    target: 'es2020',
  });
}

/**
 * @param { string } srcDir
 * @param { string } destDir
 * @param { string } [dir]
 * @param { Array<string> } [entryPoints]
 */
function copyFiles(srcDir, destDir, dir = '', entryPoints = []) {
  if (dir && !fs.existsSync(path.resolve(destDir, dir))) {
    fs.mkdirSync(path.resolve(destDir, dir));
  }

  for (const basename of fs.readdirSync(path.join(srcDir, dir))) {
    const filepath = path.join(srcDir, dir, basename);
    const ext = path.extname(basename);
    if (ext === '.ts') {
      fs.copyFileSync(filepath, path.join(destDir, dir, basename));
    } else if (ext === '.js') {
      entryPoints.push(filepath);
    } else if (ext === '') {
      copyFiles(srcDir, destDir, basename, entryPoints);
    }
  }

  return entryPoints;
}

function replacePlugin() {
  return {
    name: 'replace',
    /** @param { esbuild.PluginBuild } build */
    setup(build) {
      build.onLoad({ filter: /.js/ }, function (args) {
        return {
          contents: fs
            .readFileSync(args.path, 'utf8')
            .replace('const DEV_MODE = true;', '')
            .replace('const ENABLE_EXTRA_SECURITY_HOOKS = true;', '')
            .replace('const ENABLE_SHADYDOM_NOPATCH = true;', '')
            .replace('const NODE_MODE = false;', '')
            .replace('const global = NODE_MODE ? globalThis : window', 'const global = globalThis'),
          loader: 'js',
        };
      });
    },
  };
}
