var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var react = require('gulp-react');
var babel = require('gulp-babel');
var gulpBrowser = require('gulp-browser');

const resources = 'src/main/resources/';
const paths = {
  scss: resources+'scss/**/*.scss',
  scripts: resources+'js/**/*.js',
  html: resources+'index.html',
  all: resources+'**'
};
const target = 'target/resources/';

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function() {
  return del([target+'**']);
});

gulp.task('scss', ['clean'], function() {
  return gulp
    .src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./stylesheets/maps'))
    .pipe(gulp.dest(target+'css/'));
});

gulp.task('scripts', ['clean'], function() {
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

gulp.task('html', ['clean'], function() {
  return gulp.src(paths.html)
    .pipe(gulp.dest(target));
});

gulp.task('watch', function() {
  /*gulp.watch(paths.scss, ['scss']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.html, ['html']);*/
  gulp.watch(paths.all, ['scss', 'scripts', 'html']);
});

gulp.task('single', ['scss', 'scripts', 'html']);

gulp.task('default', ['watch', 'scss', 'scripts', 'html']);
