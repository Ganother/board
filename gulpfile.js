/**
 * Created by Ganother on 2017/4/27.
 */

var gulp = require('gulp');
var replace = require("gulp-replace");
var autoprefix = require('gulp-autoprefixer');

//合并html里用到的css
gulp.task('css',function(){
  gulp.src('styles/*.css')
    .pipe(autoprefix('last 7 versions'))
    .pipe(gulp.dest("dist/css"))
  gulp.src('*.html')
    .pipe(replace("styles/",'dist/css/'))
    .pipe(gulp.dest(""))
});

