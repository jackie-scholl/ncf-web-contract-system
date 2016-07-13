//Copyright 2016 Jackie Scholl
'use strict';
const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
//const babelify = require('babelify');
const browserify = require('browserify');
const child_process = require('child_process');
//const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');
const watchify = require('watchify');
const source = require('vinyl-source-stream');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const babel = require('gulp-babel');
const istanbul = require('gulp-istanbul');

const resources = 'src/main/resources/';
const paths = {
  scss: resources+'scss/**/*.scss',
  scripts: resources+'js/**/*.js',
  html: resources+'index.html',
  all: resources+'**',
  java: 'src/main/java/**/*'
};
const target = 'target/resources/';

const paths2 = {
  src: {
    resourcesBase : 'src/main/resources/',
    scss: resources+'scss/**/*.scss',
    scripts: resources+'js/**/*.js',
    html: resources+'index.html',
    all: resources+'**',
    resources2: 'resources2/**'
  },
  target: {
    scss: target+'scss/**/*.scss',
    scripts: target+'js/**/*.js',
    scripts2: target+'js',
    html: target+'index.html',
    resources2: target+'resources2/',
    test_sources: 'target/generated-js-sources/'
  }
};


gulp.task('clean-scss', () => del(paths2.target.scss));

gulp.task('scss', ['clean-scss'], () =>
  gulp
    .src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./stylesheets/maps'))
    .pipe(gulp.dest(target+'css/'))
    //.pipe(browserSync.stream());
);

gulp.task('clean-scripts', () =>
  del(paths2.target.scripts)
);

gulp.task('lint-scripts', () =>
  // ESLint ignores files with 'node_modules' paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  gulp.src([paths2.src.scripts, 'Gulpfile.js'])
    // eslint() attaches the lint output to the 'eslint' property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError())
);

gulp.task('clean-test-sources', () =>
  del(paths2.target.test_sources)
);

gulp.task('build-test-sources', () =>
  gulp.src('src/**/*.js')
    .pipe(babel({presets: ['react']}))
    .pipe(gulp.dest(paths2.target.test_sources))
);

gulp.task('pre-scripts-test', ['build-test-sources'], () =>
  gulp.src([paths2.target.test_sources+'main/resources/js/*'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire())
);

gulp.task('test-scripts', ['lint-scripts', 'pre-scripts-test'], () =>
  gulp.src(paths2.target.test_sources+'test/js/*', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha({reporter: 'spec'}))

    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    //.pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
);

// Based on https://gist.github.com/danharper/3ca2273125f500429945
function compile(shouldWatch) {
  const bundler = watchify(browserify(resources+'js/main.js', { debug: true })
      .transform('babelify', {presets: ['es2015', 'react']}));

  /** @this idk?? */
  function error(err) {
    console.error(err);
    this.emit('end');
  }

  function rebundle() {
    bundler.bundle()
      .on('error', error)
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(paths2.target.scripts2));
  }

  if (shouldWatch) {
    bundler.on('update', () => {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

gulp.task('scripts', ['clean-scripts', 'test-scripts'], () => (compile(false)));
gulp.task('watch-scripts', () => compile(true));

gulp.task('clean-html', () =>
  del(paths2.target.html)
);

gulp.task('html', ['clean-html'], () =>
  gulp.src(paths.html)
    .pipe(gulp.dest(target))
);

gulp.task('clean2', () =>
  del([paths2.target.resources2])
);

gulp.task('resources2', ['clean2'], () =>
  gulp.src(paths2.src.resources2)
    .pipe(gulp.dest(paths2.target.resources2))
);


let currentMaven2TaskChild = null;

gulp.task('maven2', (callback) => {
  if (currentMaven2TaskChild !== null) {
    currentMaven2TaskChild.kill();
  }
  const child = child_process.spawn('mvn',
      ['test', 'exec:java', '-Dexec.mainClass=edu.ncf.contractform.Main']);
  currentMaven2TaskChild = child;
  console.log('spawning new process');

  child.stdout.on('data', (data) => {
    process.stdout.write(`${data}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`${data}`);
  });

  child.on('close', (code) => {
    console.log(`maven process exited with code ${code}`);
    if (currentMaven2TaskChild === child) {
      currentMaven2TaskChild = null;
    }
  });

  callback();
});

gulp.task('watchJava', () => {
  gulp.watch(paths.java, ['maven2']);
});

gulp.task('watch', () => {
  gulp.watch(paths2.src.scss, ['scss']);
  gulp.watch(paths2.src.scripts, ['scripts']);
  gulp.watch(paths2.src.html, ['html']);
  gulp.watch('.eslintrc.yml', ['lint-scripts']);

  gulp.watch(paths2.src.resources2, ['resources2']);
});

gulp.task('single', ['scss', 'scripts', 'html', 'resources2']);

gulp.task('default', ['watch', 'scss', 'scripts', 'html', 'watchJava', 'maven2',
    'resources2']);
