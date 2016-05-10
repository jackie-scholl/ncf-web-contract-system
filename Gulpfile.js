var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var react = require('gulp-react');
var babel = require('gulp-babel');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var through2 = require('through2');
var vueify = require('vueify');
var gulpBrowser = require('gulp-browser');

const resources = 'src/main/resources/';
const paths = {
  scss: resources+'scss/**/*.scss',
  scripts: resources+'js/**/*.js',
  html: resources+'index.html'
};
const target = 'target/resources/';

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function() {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del([target]);
});

gulp.task('scss', function() {
  return gulp
    .src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./stylesheets/maps'))
    .pipe(gulp.dest(target+'css/'));
});

gulp.task('scripts', function() {
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

gulp.task('html', function() {
  return gulp.src(paths.html)
    .pipe(gulp.dest(target));
})

gulp.task('watch', function() {
  gulp.watch(paths.scss, ['scss']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.html, ['html']);
});

gulp.task('default', ['watch', 'scss', 'scripts', 'html']);
