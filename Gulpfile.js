//Copyright 2016 Jackie Scholl
'use strict';
const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
//const babelify = require('babelify');
const browserify = require('browserify');
const child_process = require('child_process');
const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const babel = require('gulp-babel');
const istanbul = require('gulp-istanbul');
const gutil = require('gulp-util');
const path = require('path');
const print = require('gulp-print');

const resources = 'src/main/resources/';
const target = 'target/resources/';

const paths2 = {
  src: {
    scss: path.join(resources, 'scss'),
    scripts: path.join(resources, 'js'),
    scripts_main: path.join(resources, 'js/main.js'),
    test_scripts: path.join('src', 'test', 'js'),
    java: path.join('src', 'main', 'java'),
    html: path.join(resources, 'index.html'),
    //all: resources+'**',
    resources2: 'resources2'
  },
  target: {
    scss: path.join(target, 'scss'),
    script: path.join(target, 'js', 'build.js'),
    html: path.join(target, 'index.html'),
    resources2: path.join(target, 'resources2'),
    test_sources: path.join('target', 'generated-js-sources')
  }
};

const glob = (p) => ([path.join(p, '**'), '!'+p]);

gulp.task('clean-scss', () => del(paths2.target.scss));

gulp.task('scss', ['clean-scss'], () =>
  gulp
    .src(glob(paths2.src.scss))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./stylesheets/maps'))
    .pipe(gulp.dest(target+'css/'))
    //.pipe(browserSync.stream());
);

gulp.task('clean-scripts', () =>
  del(path.dirname(paths2.target.script))
);

gulp.task('lint-scripts', () =>
  // ESLint ignores files with 'node_modules' paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  gulp.src(glob(paths2.src.scripts).concat('Gulpfile.js'))
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

/*gulp.task('build-test-sources', ['clean-test-sources'], () =>
  gulp.src([glob(paths2.src.scripts), glob(paths2.src.test_scripts)])
    .pipe(babel({presets: ['react']}))
    .pipe(gulp.dest(paths2.target.test_sources))
);*/

gulp.task('build-test-sources-main', ['clean-test-sources'], () =>
  gulp.src(glob(paths2.src.scripts))
    .pipe(babel({presets: ['react']}))
    .pipe(gulp.dest(path.join(paths2.target.test_sources, 'main')))
);

gulp.task('build-test-sources-test', ['clean-test-sources'], () =>
  gulp.src(glob(paths2.src.test_scripts))
    .pipe(babel({presets: ['react']}))
    .pipe(gulp.dest(path.join(paths2.target.test_sources, 'test')))
);

gulp.task('build-test-sources',
    ['build-test-sources-main', 'build-test-sources-test']);

gulp.task('pre-scripts-test', ['build-test-sources'], () =>
  //gulp.src([paths2.target.test_sources+'main/resources/js/*'])
  gulp.src(glob(path.join(paths2.target.test_sources, 'main')))
    .pipe(print())
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire())
);

gulp.task('test-scripts', ['lint-scripts', 'pre-scripts-test'], () =>
  //gulp.src(paths2.target.test_sources+'test/js/*', {read: false})
  gulp.src(glob(path.join(paths2.target.test_sources, 'test')), {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha({reporter: 'spec'}))

    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    //.pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
);

gulp.task('scripts', ['clean-scripts', 'test-scripts'], () =>
  browserify(paths2.src.scripts_main, {
    debug: true
  })
    .transform('babelify', {presets: ['es2015', 'react']})
    .bundle()
    .pipe(source(path.basename(paths2.target.script)))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
      // Add transformation tasks to the pipeline here.
      .pipe(uglify())
      .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(path.dirname(paths2.target.script)))
);

gulp.task('clean-html', () =>
  del(paths2.target.html)
);

gulp.task('html', ['clean-html'], () =>
  gulp.src(paths2.src.html)
    .pipe(gulp.dest(target))
);

gulp.task('clean2', () =>
  del(paths2.target.resources2)
);

gulp.task('resources2', ['clean2'], () =>
  gulp.src(glob(paths2.src.resources2))
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

gulp.task('test', ['test-scripts']);

gulp.task('test2', () => {
  gulp.src(glob(path.join(paths2.target.test_sources, 'main')))
    .pipe(print());
  console.log(glob(path.join(paths2.target.test_sources, 'main')));
});

gulp.task('watch', () => {
  gulp.watch(glob(paths2.src.scss), ['scss']);
  gulp.watch(glob(paths2.src.scripts), ['scripts']);
  gulp.watch(glob(paths2.src.test_scripts), ['test-scripts']);
  gulp.watch(paths2.src.html, ['html']);
  gulp.watch('.eslintrc.yml', ['lint-scripts']);

  gulp.watch(glob(paths2.src.java), ['maven2']);

  gulp.watch(glob(paths2.src.resources2), ['resources2']);
});

gulp.task('single', ['scss', 'scripts', 'html', 'resources2']);

gulp.task('default', ['watch', 'scss', 'scripts', 'html', 'maven2',
    'resources2']);
