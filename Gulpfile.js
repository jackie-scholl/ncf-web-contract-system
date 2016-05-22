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
  },
  target: {
    scss: target+'scss/**/*.scss',
    scripts: target+'js/**/*.js',
    html: target+'index.html',
    all: target+'**',
  }
};

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
    .pipe(gulp.dest(target+'css/'))
    ;//.pipe(browserSync.stream());
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
    .pipe(gulp.dest(target+'js'))
    ;//.pipe(browserSync.stream());
});

gulp.task('html', ['clean'], function() {
  return gulp.src(paths.html)
    .pipe(gulp.dest(target))
    ;//.pipe(browserSync.stream());
});

/*gulp.task('testShell', () => {
  const child = child_process.exec('ls',
    (error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
  });
});*/

/*var currentMavenTaskChild = null;

gulp.task('maven', (callback) => {
  console.log('maven task called');
  if (currentMavenTaskChild !== null) {
    currentMavenTaskChild.kill();
  }
  const child = child_process.spawn('mvn', ['test', 'exec:java', '-Dexec.mainClass=edu.ncf.contractform.Main']);
  currentMavenTaskChild = child;
  console.log('spawning new process');

  child.stdout.on('data', (data) => {
    process.stdout.write(`${data}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`${data}`);
  });

  child.on('close', (code) => {
    console.log(`maven process exited with code ${code}`);
    if (currentMavenTaskChild === child) {
      currentMavenTaskChild = null;
    }
    callback();
  });

  setTimeout(()=>{child.kill();}, 15000);
});*/


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
  //gulp.watch([paths.scss, paths.scripts, paths.html], ['scss', 'scripts', 'html']);
  //gulp.watch(paths.scss, ['scss']);
  //gulp.watch(paths.scripts, ['scripts']);
  //gulp.watch(paths.html, ['html']);
  //livereload.listen();
  /*browserSync.init({
        server: "./target/resources",
        port: 4232
    });*/
  /*browserSync.init({
    proxy: {
      target: 'http://localhost:4231'
    },
    port: 4232
  });*/
  gulp.watch(paths.all, ['scss', 'scripts', 'html']);
});

gulp.task('single', ['scss', 'scripts', 'html']);

gulp.task('default', ['watch', 'scss', 'scripts', 'html', 'watchJava', 'maven2']);
