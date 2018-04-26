var gulp = require('gulp'),
sass = require('gulp-sass'),
spawn = require('child_process').spawn,
node;

gulp.task('styles', function(){
	gulp.src('public/css/sass/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(gulp.dest('public/css/'));
});

gulp.task('default', function(){
	gulp.run('server')

	gulp.watch(['./app.js'], function() {
	    gulp.run('server')
	})

	gulp.watch('public/css/sass/*.scss', ['styles']);	
})

gulp.task('server', function() {
  if (node) node.kill()
  node = spawn('node', ['app.js'], {stdio: 'inherit'})
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
})

process.on('exit', function() {
    if (node) node.kill()
})