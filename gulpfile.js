'use strict';

// Определим необходимые инструменты
var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require("gulp-rename"),

    postcss = require('gulp-postcss'),
    minify = require("gulp-csso"),
    posthtml = require('gulp-posthtml'),

    importcss = require('postcss-import'),
    urlcss = require('postcss-url'),
    autoprefixer = require('autoprefixer'),
    include = require('posthtml-include'),

    server = require('browser-sync').create();

// ЗАДАЧА: Компиляция css
gulp.task('style', function() {
  return gulp.src('sourse/css/path/style.css')
    .pipe(plumber())
    .pipe(postcss([
      importcss(),
      urlcss(),
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task('html', function() {
  return gulp.src('sourse/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest('build'));
});

gulp.task('serve', function() {
  return server.init({
    server: '.',
    notify: false,
    open: true,
    cors: true,
    ui: false
});

  gulp.watch('./sourse/css/**/*.css', ['style']);
  gulp.watch('./sourse/*.html').on('change', server.reload);
});
