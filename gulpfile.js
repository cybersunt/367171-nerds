'use strict';

// Определим необходимые инструменты
var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),

    postcss = require('gulp-postcss'),
    csso = require('gulp-csso'),
    fileinclude = require('gulp-file-include'),

    importcss = require('postcss-import'),
    urlcss = require('postcss-url'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),

    del = require("del"),
    browserSync = require('browser-sync').create();

// ЗАДАЧА: Компиляция CSS
gulp.task('styles', function() {
  return gulp.src('./source/css/path/style.css')       // какой файл компилировать
    .pipe(plumber())                                   // отлавливаем ошибки
    .pipe(postcss([                                    // делаем постпроцессинг
      importcss(),                                     // импортируем пути
      urlcss(),                                        // правит пути
      autoprefixer({ browsers: ['last 2 version'] }),  // автопрефиксирование
      mqpacker({ sort: true })                         // объединение медиавыражений
    ]))
    .pipe(gulp.dest('./build/css'))                    // записываем CSS-файл
    .pipe(csso())                                      // минифицируем CSS-файл
    .pipe(rename("style.min.css"))                     // переименовываем CSS-файл
    .pipe(gulp.dest('./build/css'))                    // записываем CSS-файл
    .pipe(browserSync.stream());
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

// ЗАДАЧА: Удаляем папку public
gulp.task('clean', function() {
  return del('./build');
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

// ЗАДАЧА: Сборка всего и локальный сервер
gulp.task('serve', function() {
    browserSync.init({
      open: true,
      server: {
        baseDir: 'build/',
        index: 'index.html'
     }
    });
    browserSync.watch(['./build/**/*.*'], browserSync.reload);
  });

gulp.task('watch', function() {
  gulp.watch('./source/css/**/*.css', gulp.series('styles'));    // следим за CSS
  gulp.watch('./source/**/*.html', gulp.series('html'));         // следим за HTML
  });

// ЗАДАЧА: Сборка всего и локальный сервер
gulp.task('default',
  gulp.series(
    'clean',
    'copy',
    'html',
  gulp.parallel(
    'styles'
  ),
  gulp.parallel(
    'watch',
    'serve'
  )
));

