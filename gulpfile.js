'use strict';

// Определим необходимые инструменты
var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),

    postcss = require('gulp-postcss'),
    minify = require('gulp-csso'),
    fileinclude = require('gulp-file-include'),

    importcss = require('postcss-import'),
    urlcss = require('postcss-url'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),

    server = require('browser-sync').create();

// ЗАДАЧА: Компиляция CSS
gulp.task('style', function() {
  return gulp.src('./source/css/path/style.css')       // какой файл компилировать
    .pipe(plumber())                                   // отлавливаем ошибки
    .pipe(postcss([                                    // делаем постпроцессинг
      importcss(),                                     // импортируем пути
      urlcss(),                                        // правит пути
      autoprefixer({ browsers: ['last 2 version'] }),  // автопрефиксирование
      mqpacker({ sort: true })                         // объединение медиавыражений
    ]))
    .pipe(gulp.dest('./build/css'))                    // записываем CSS-файл
    .pipe(minify())                                    // минифицируем CSS-файл
    .pipe(rename("style.min.css"))                     // переименовываем CSS-файл
    .pipe(gulp.dest('./build/css'))                    // записываем CSS-файл
    .pipe(server.stream());
});

// ЗАДАЧА: Сборка HTML
gulp.task('html', function() {
  return gulp.src('./source/*.html')                   // какие файлы обрабатывать
    .pipe(plumber())
    .pipe(fileinclude({                                // обрабатываем gulp-file-include
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./build/'));                      // записываем файлы (путь из константы)
});

// ЗАДАЧА: Копирование файлов
gulp.task('copy', function() {
  return gulp.src([
    './source/fonts/**/*.otf',
    './source/img/**',
    './source/js/**',
    './source/*.html'
  ], {
    base: "./source"
  })
  .pipe(gulp.dest("./build"));
});


gulp.task('serve', function() {
  return server.init({
    server: './build',
    notify: false,
    open: true,
    cors: true,
    ui: false
});

  gulp.watch('./source/**/*', ['copy']);
  gulp.watch('./source/**/*.css', ['style']);
  gulp.watch('./source/**/*.html').on('change', server.reload);
});
