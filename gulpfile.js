'use strict';

// Определим необходимые инструменты
var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),

    postcss = require('gulp-postcss'),
    csso = require('gulp-csso'),

    posthtml = require('gulp-posthtml'),
    include = require('posthtml-include'),
    fileinclude = require('gulp-file-include'),

    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    svgstore = require('gulp-svgstore'),
    rsp = require('remove-svg-properties').stream,

    importcss = require('postcss-import'),
    urlcss = require('postcss-url'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),

    del = require('del'),
    browserSync = require('browser-sync').create();

// ЗАДАЧА: Сборка HTML
gulp.task('markup', function() {
  return gulp.src('./source/*.html')                   // какие файлы обрабатывать
    .pipe(plumber())
    .pipe(fileinclude({                                // обрабатываем gulp-file-include
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest('./build/'));                      // записываем файлы (путь из константы)
});

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
    .pipe(rename('style.min.css'))                     // переименовываем CSS-файл
    .pipe(gulp.dest('./build/css'))                    // записываем CSS-файл
    .pipe(browserSync.stream());
});

// ЗАДАЧА: Оптимизируем декоративные PNG, JPG, SVG
gulp.task('images:decor', function() {
  return gulp.src('./source/img/decoration/**/*.{png,jpg,jpeg,svg}')
  .pipe(plumber())                                            // отлавливаем ошибки
  .pipe(imagemin([
    imagemin.jpegtran({progressive: true}),                   // сжимаем PNG
    imagemin.optipng({optimizationLevel: 3}),                 // сжимаем PNG и определяем степень сжатия
    imagemin.svgo()                                           // сжимаем SVG
  ]))
  .pipe(gulp.dest('./build/img/decoration'));                   // записываем файлы
});

// ЗАДАЧА: Оптимизируем контентные PNG, JPG, SVG
gulp.task('images:content', function() {
  return gulp.src('./source/img/content/**/*.{png,jpg,jpeg,svg}')
  .pipe(plumber())                                            // отлавливаем ошибки
  .pipe(imagemin([
    imagemin.jpegtran({progressive: true}),                   // сжимаем PNG
    imagemin.optipng({optimizationLevel: 3}),                 // сжимаем PNG и определяем степень сжатия
    imagemin.svgo()                                           // сжимаем SVG
  ]))
  .pipe(gulp.dest('./build/img/content'));                      // записываем файлы
});

// ЗАДАЧА: Создаем файлы WEBP для хромиум-браузеров
gulp.task('webp', function () {
  return gulp.src('./source/img/content/**/*.{png,jpg}')         // какие файлы обрабатывать
    .pipe(plumber())                                          // отлавливаем ошибки
    .pipe(webp({quality: 80}))                                // конвертируем в webp и определяем степень сжатия
    .pipe(gulp.dest('./build/img/content'));                    // записываем файлы
});

// ЗАДАЧА: Создаем SVG-спрайт
gulp.task('sprite', function () {
  return gulp.src('./source/img/sprite/*.svg')                   // какие файлы обрабатывать
    .pipe(plumber())                                          // отлавливаем ошибки
    .pipe(rsp.remove({                                           // удаляем атрибуты
        properties: [rsp.PROPS_FILL]
    }))
    .pipe(svgstore({
      inlineSvg: true                                            // инлайним spite
    }))
    .pipe(rename('sprite.svg'))                               // даем имя спрайту
    .pipe(gulp.dest('./build/img/'));                           // записываем файл
});

// ЗАДАЧА: Удаляем папку build
gulp.task('clean', function() {
  return del('./build');
});

// ЗАДАЧА: Копирование файлов
gulp.task('copy', function() {
  return gulp.src([
    './source/fonts/**',
    './source/img/content/**',
    './source/img/decoration/**',
    './source/js/**',
    './source/*.html'
  ], {
    base: './source'
  })
  .pipe(gulp.dest('./build'));
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
  gulp.watch('./source/**/*.html', gulp.series('markup'));         // следим за HTML
  gulp.watch('./source/img/**', gulp.series('copy'));            // следим за картинками
  });

// ЗАДАЧА: Сборка всего и локальный сервер
gulp.task('default',
  gulp.series(
    'clean',
    'copy',
    'markup',
  gulp.parallel(
    'styles',
    'images:decor',
    'images:content',
    'webp',
    'sprite',
  ),
  gulp.parallel(
    'watch',
    'serve'
  )
));

