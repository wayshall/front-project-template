// 引入 gulp
var gulp = require('gulp');
// 引入插件
var jshint = require('gulp-jshint');

var connect = require('gulp-connect');

import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import _ from 'lodash';
import sourcemaps from 'gulp-sourcemaps';
import watchify from 'watchify';
import gutil from 'gulp-util';

var paths = {
  // sass: ['./scss/**/*.scss'],
  html: ['./www/index.html', './www/templates/**/*.html'],
  appjs: './www/js/app.js'
}

gulp.task('html', done=>{
    gulp.src(paths.html)
        .pipe(connect.reload())
        .on('end', done);
})

gulp.task('js', done=>{
    gulp.src(paths.appjs)
        .pipe(connect.reload())
        .on('end', done);
})
gulp.task('watch', function() {
    // gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.appjs, ['js']);
});

gulp.task('buildEs6', [], ()=>{
    let customOpts = { 
        entries: ['./src/app.js'],
        debug: true,
        cache: {}, 
        packageCache: {},
        delay: 1000
    };
    var opts = _.assign({}, watchify.args, customOpts);
    var b = watchify(browserify(opts));
    b.transform(babelify.configure({
        ignore: /(bower_components)|(node_modules)/
    }));

    b.on('update', ()=>bundle(b)); 
    b.on('log', gutil.log);

    bundle(b);
});

function bundle(b) {
    return b.bundle()
              .on('error', function(err) { console.log('Error: ' + err.message); })
              .pipe(source('app.js'))
              // .pipe(annotate())
              .pipe(buffer())
              .pipe(sourcemaps.init({loadMaps: true}))
              .pipe(sourcemaps.write('./')) 
              .pipe(gulp.dest('www/js'));
}

// 建立任务
gulp.task('jshint', function() {
    gulp.src('./js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('dev', function(){
    connect.server({
        root: ['www'],
        port: 3000,
        livereload: true
    });
})

// 默认任务
gulp.task('default', ['watch', 'dev', 'buildEs6']);