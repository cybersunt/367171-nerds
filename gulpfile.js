'use strict';

// Определим необходимые инструменты
var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),

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

    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),

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
    .pipe(gulp.dest('./public/'));                      // записываем файлы (путь из константы)
});

// ЗАДАЧА: Компиляция CSS
gulp.task('styles', function() {
  return gulp.src('./source/css/path/style.css')       // какой файл компилировать
    .pipe(plumber())                                   // отлавливаем ошибки
    .pipe(sourcemaps.init())
    .pipe(postcss([                                    // делаем постпроцессинг
      importcss(),                                     // импортируем пути
      urlcss(),                                        // правит пути
      autoprefixer({ browsers: ['last 2 version'] }),  // автопрефиксирование
      mqpacker({ sort: true })                         // объединение медиавыражений
    ]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/css'))                    // записываем CSS-файл
    .pipe(csso())                                      // минифицируем CSS-файл
    .pipe(rename('style.min.css'))                     // переименовываем CSS-файл
    .pipe(gulp.dest('./public/css'))                    // записываем CSS-файл
    .pipe(browserSync.stream());
});

// ЗАДАЧА: Минимизируем JS
gulp.task('scripts', function () {
  return gulp.src('./source/js/**/*.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./public/js/'))
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
  .pipe(gulp.dest('./public/img/decoration'));                   // записываем файлы
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
  .pipe(gulp.dest('./public/img/content'));                      // записываем файлы
});

// ЗАДАЧА: Создаем файлы WEBP для хромиум-браузеров
gulp.task('webp', function () {
  return gulp.src('./source/img/content/**/*.{png,jpg}')         // какие файлы обрабатывать
    .pipe(plumber())                                          // отлавливаем ошибки
    .pipe(webp({quality: 80}))                                // конвертируем в webp и определяем степень сжатия
    .pipe(gulp.dest('./public/img/content'));                    // записываем файлы
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
    .pipe(gulp.dest('./public/img/'));                           // записываем файл
});

// ЗАДАЧА: Удаляем папку public
gulp.task('clean', function() {
  return del('./public');
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
  .pipe(gulp.dest('./public'));
});

// ЗАДАЧА: Сборка всего и локальный сервер
gulp.task('serve', function() {
    browserSync.init({
      open: true,
      server: {
        baseDir: 'public/',
        index: 'index.html'
     }
    });
    browserSync.watch(['./public/**/*.*'], browserSync.reload);
  });

gulp.task('watch', function() {
  gulp.watch('./source/**/*.html', gulp.series('markup'));         // следим за HTML
  gulp.watch('./source/css/**/*.css', gulp.series('styles'));       // следим за CSS
  gulp.watch('./source/js/**/*.js', gulp.series('scripts'));
  gulp.watch('./source/img/content/**/*.*', gulp.series('images:content'));
  gulp.watch('./source/img/decoration/**/*.*', gulp.series('images:decor'));
  gulp.watch('./source/img/content/**/*.*', gulp.series('webp'));
  gulp.watch('./source/img/sprite/**/*.*', gulp.series('sprite'));
});

// ЗАДАЧА: Сборка всего и локальный сервер
gulp.task('default',
  gulp.series(
    'clean',
    'copy',
    'markup',
    'sprite',
    'scripts',
  gulp.parallel(
    'styles',
    'images:decor',
    'images:content',
    'webp',
  ),
  gulp.parallel(
    'watch',
    'serve'
  )
));

