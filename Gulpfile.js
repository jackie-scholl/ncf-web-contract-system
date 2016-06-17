const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const react = require('gulp-react');
//const babel = require('gulp-babel');
const babelify = require('babelify');
const gulpBrowser = require('gulp-browser');
const browserify = require('browserify');
const child_process = require('child_process');
//const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');
const watchify = require('watchify');
const source = require('vinyl-source-stream');
const eslint = require('gulp-eslint');

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
    resources2: target+'resources2/'
  }
};


gulp.task('clean-scss', function() {
  return del(paths2.target.scss);
});

gulp.task('scss', ['clean-scss'], function() {
  return gulp
    .src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./stylesheets/maps'))
    .pipe(gulp.dest(target+'css/'))
    ;//.pipe(browserSync.stream());
});

gulp.task('clean-scripts', function() {
  return del(paths2.target.scripts);
});

/*gulp.task('scripts', ['clean-scripts'], function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
      .pipe(babel({
            presets: ['react']
        }))
      .pipe(gulpBrowser.browserify())
      /*
      .pipe(buffer())
      .pipe(uglify().on('error', function(e){
          console.log(e);
      }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(target+'js'));
});*/

gulp.task('lint-scripts', function () {
  // ESLint ignores files with 'node_modules' paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  return gulp.src([paths2.src.scripts, '.Gulpfile.js'])
    // eslint() attaches the lint output to the 'eslint' property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError());
});

// Based on https://gist.github.com/danharper/3ca2273125f500429945
function compile(watch) {
  //const js_src = resources+'js/main.js';
  //var bundler = watchify(browserify(resources+'js/main.js', { debug: true }).transform(babel({presets: ['react']})));
  //var bundler = watchify(browserify(src1, { debug: true }).transform(babel({presets: ['react']})));
  var bundler = watchify(browserify(resources+'js/main.js', { debug: true })
      .transform('babelify', {presets: ['es2015', 'react']}));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      //.pipe(gulp.dest('./build'));

      .pipe(gulp.dest(paths2.target.scripts2));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
};

gulp.task('scripts', ['clean-scripts', 'lint-scripts'], function() { return compile(); });
gulp.task('watch-scripts', function() { return watch(); });

gulp.task('clean-html', function() {
  return del(paths2.target.html);
});

gulp.task('html', ['clean-html'], function() {
  return gulp.src(paths.html)
    .pipe(gulp.dest(target))
});

gulp.task('clean2', function() {
  return del([paths2.target.resources2]);
});

gulp.task('resources2', ['clean2'], function() {
  return gulp.src(paths2.src.resources2)
    .pipe(gulp.dest(paths2.target.resources2))
    ;//.pipe(browserSync.stream());
});


var currentMaven2TaskChild = null;

gulp.task('maven2', (callback) => {
  if (currentMaven2TaskChild !== null) {
    currentMaven2TaskChild.kill();
  }
  const child = child_process.spawn('mvn', ['test', 'exec:java', '-Dexec.mainClass=edu.ncf.contractform.Main']);
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

gulp.task('watch', function() {
  gulp.watch(paths2.src.scss, ['scss']);
  gulp.watch(paths2.src.scripts, ['scripts']);
  gulp.watch(paths2.src.html, ['html']);

  gulp.watch(paths2.src.resources2, ['resources2']);
});

gulp.task('single', ['scss', 'scripts', 'html', 'resources2']);

gulp.task('default', ['watch', 'scss', 'scripts', 'html', 'watchJava', 'maven2', 'resources2']);
