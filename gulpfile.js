'use strict';

// Определим необходимые инструменты
var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),

    postcss = require('gulp-postcss'),
    minify = require('gulp-csso'),

    importcss = require('postcss-import'),
    urlcss = require('postcss-url'),
    autoprefixer = require('autoprefixer'),

    server = require('browser-sync').create();

// ЗАДАЧА: Компиляция css
gulp.task('style', function() {
  return gulp.src('./source/css/path/style.css')
    .pipe(plumber())
    .pipe(postcss([
      importcss(),
      urlcss(),
      autoprefixer()
    ]))
    .pipe(gulp.dest('./build/css'))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest('./build/css'))
    .pipe(server.stream());
});

gulp.task('serve', function() {
  return server.init({
    server: './source',
    notify: false,
    open: true,
    cors: true,
    ui: false
});

  gulp.watch('./source/**/*.css', ['style']);
  gulp.watch('./source/*.html').on('change', server.reload);
});
