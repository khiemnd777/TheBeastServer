const gulp = require('gulp');
const gulpTypescript = require('gulp-typescript');
const gulpSourceMap = require('gulp-sourcemaps');
const gulpClean = require('gulp-clean');
const rollup = require('rollup');
const rollupResolver = require('rollup-plugin-node-resolve');
const rollupGlobals = require('rollup-plugin-node-globals');
const rollupAscii = require('rollup-plugin-ascii');
const rollIncludePaths = require('rollup-plugin-includepaths');
const rollSourceMap = require('rollup-plugin-sourcemaps');
const rollResolve = require('./build/resolveid');
const path = require('path');
const destPath = './publish';
const distPath = './dist';

gulp.task('build:ts', () => {
  const yargs = require('yargs').argv;
  const outDir = yargs.dest || 'temp';
  const sourceMap = /^true$/.test(yargs.sourceMap);

  const project = gulpTypescript.createProject('tsconfig.json', {
    declaration: false,
    outDir: outDir
  });
  var pipe = gulp.src(['./src/**/*.ts'], {
    base: '.'
  });
  sourceMap && (pipe = pipe.pipe(gulpSourceMap.init()));
  pipe = pipe.pipe(project());
  sourceMap &&
    (pipe = pipe
      .pipe(
        gulpSourceMap.mapSources((sourcePath, file) => {
          return sourcePath && /^\.\./.test(sourcePath)
            ? path.relative('..', sourcePath)
            : sourcePath;
        })
      )
      .pipe(
        gulpSourceMap.write('', {
          sourceRoot: '/',
          includeContent: false
        })
      ));
  return pipe.pipe(gulp.dest(outDir)).pipe(gulp.dest(distPath));
});

gulp.task('build:rollup', () => {
  const yargs = require('yargs').argv;
  const sourceMap = /^true$/.test(yargs.sourceMap);
  const temp = path.resolve(__dirname, 'temp');
  const plugins = [
    rollIncludePaths({
      include: {},
      paths: [temp]
    }),
    rollupResolver({
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      },
      mainFields: ['module', 'main', 'browser', 'jsnext'],
    }),
    rollResolve(),
    rollupGlobals(),
    rollupAscii(),
  ];

  sourceMap && plugins.push(rollSourceMap());
  return rollup
    .rollup({
      input: path.resolve(temp, './src/index.js'),
      plugins: plugins
    })
    .then(bundle => {
      return bundle.write({
        format: 'iife',
        /* iife, umd, amd, cjs, esm, system */
        name: 'TheBeast',
        file: distPath + '/index.js',
        sourcemap: sourceMap,
        sourcemapExcludeSources: true,
        sourcemapPathTransform: function() {
          return path.relative('/', sourcePath);
        },
        indent: false,
        // globals: {
        //   underscore: "_"
        // }
        globals: {
          express: 'express'
        }
      });
    });
});

gulp.task('build:post', () => {
  return gulp
    .src(['./dist/**/*'], {
      allowEmpty: true
    })
    .pipe(gulp.dest(destPath));
});

gulp.task('build:pre', () => {
  return gulp
    .src(['./temp/', './dist/*'], {
      read: false,
      allowEmpty: true,
      base: '.'
    })
    .pipe(gulpClean());
});

gulp.task('clean', () => {
  return gulp
    .src('./temp/', {
      read: false,
      allowEmpty: true
    })
    .pipe(gulpClean());
});
