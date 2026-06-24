const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();

const paths = {
  scss: 'src/css/**/*.scss',
  js: 'src/js/**/*.js',
  html: 'src/**/*.html',
};

function styles() {
  return gulp.src(paths.scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(concat('app.css'))
    .pipe(gulp.dest('public/css'))
    .pipe(browserSync.stream());
}

function scripts() {
  return gulp.src(paths.js)
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'))
    .pipe(browserSync.stream());
}

function copyHtml() {
  return gulp.src(paths.html)
    .pipe(gulp.dest('public'))
    .pipe(browserSync.stream());
}

function serve() {
  browserSync.init({
    server: {
      baseDir: 'public'
    },
    port: 3000,
  });

  gulp.watch(paths.scss, styles);
  gulp.watch(paths.js, scripts);
  gulp.watch(paths.html, copyHtml);
}

const build = gulp.series(gulp.parallel(styles, scripts, copyHtml));

gulp.task('default', build);
gulp.task('dev', gulp.series(build, serve));