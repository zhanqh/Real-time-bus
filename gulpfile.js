var gulp = require('gulp');
// 引入 gulp-sass 插件
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var jshint = require('gulp-jshint'); 
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

/* 开发任务 */
// 自动刷新浏览器
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
  })
})

// 编译sass文件
gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // 获取 app/scss 及其子目录下的全部.scss文件
    .pipe(sass())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
})

// 监视文件更新，自动编译刷新浏览器
gulp.task('watch',/* ['browserSync', 'sass'],*/ function (){
  gulp.watch('app/scss/**/*.scss', ['sass']);
  // HTML 或 JS 文件改变时自动刷新浏览器
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
})

// 代码质量检测
gulp.task('jshint', function () {  
    gulp.src('app/js/**/*.js')  
        .pipe(jshint())  
        .pipe(jshint.reporter('default'));  
});  

/* 构建任务 */
// 合并/压缩 css 与 JavaScript 文件
gulp.task('useref', function(){
  return gulp.src('app/*.html')
    // 压缩 CSS 文件
    .pipe(gulpIf('*.css', minifyCSS()))
    // 压缩 JavaScript 文件
    .pipe(gulpIf('*.js', uglify()))
    .pipe(useref())
    .pipe(gulp.dest('dist'))
})

// 压缩图片
gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
  // 减少重复压缩
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest('dist/images'))
});

// 拷贝字体 
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
})

// 清理dist目录旧文件
gulp.task('clean', function(callback) {
  del('dist');
  return cache.clearAll(callback);
})

// 清理dist目录旧文件，保留图片
gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// 默认任务，开发监视
gulp.task('default', function(callback) {
  runSequence(['sass', 'browserSync', 'watch'],
    callback
  )
})

// 构建
gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    ['sass', 'useref', 'images', 'fonts'],
    callback
  )
})