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
 * @param { Array<string> } pkgDirs
 */
export async function vendorBuild(srcDir, destDir, pkgDirs) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  const entryPoints = copyFiles(srcDir, destDir, pkgDirs);

  await esbuild.build({
    bundle: false,
    define,
    entryPoints,
    format: 'esm',
    target: 'es2020',
    minify: true,
    platform: 'browser',
    outdir: destDir,
    plugins: [replacePlugin()],
  });
}

/**
 * @param { string } srcDir
 * @param { string } destDir
 * @param { Array<string> } pkgDirs
 * @param { string } [dir]
 * @param { Array<string> } [entryPoints]
 */
function copyFiles(srcDir, destDir, pkgDirs, dir = '', entryPoints = []) {
  if (dir && !fs.existsSync(path.resolve(destDir, dir))) {
    fs.mkdirSync(path.resolve(destDir, dir));
  }

  for (const basename of fs.readdirSync(path.join(srcDir, dir))) {
    const filepath = path.join(srcDir, dir, basename);
    const ext = path.extname(basename);

    if (ext === '.ts') {
      fs.copyFileSync(filepath, path.join(destDir, dir, basename));
    } else if (ext === '.js') {
      const code = fs.readFileSync(filepath, 'utf8');
      if (/_\$LH|DEV_MODE|NODE_MODE/.test(code)) {
        entryPoints.push(filepath);
      } else {
        pkg: for (const pkgDir of pkgDirs) {
          const filepath = path.join(pkgDir, dir, basename);
          if (fs.existsSync(filepath)) {
            fs.copyFileSync(path.join(pkgDir, dir, basename), path.join(destDir, dir, basename));
            break pkg;
          }
        }
      }
    } else if (ext === '') {
      copyFiles(srcDir, destDir, pkgDirs, basename, entryPoints);
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
            .replace('const NODE_MODE = false;', ''),
          loader: 'js',
        };
      });
    },
  };
}
