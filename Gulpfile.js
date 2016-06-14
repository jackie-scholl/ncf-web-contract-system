const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const react = require('gulp-react');
const babel = require('gulp-babel');
const gulpBrowser = require('gulp-browser');
const child_process = require('child_process');
//const browserSync = require('browser-sync').create();

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

gulp.task('scripts', ['clean-scripts'], function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
      .pipe(babel({
            presets: ['react']
        }))
      .pipe(gulpBrowser.browserify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(target+'js'));
});

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
