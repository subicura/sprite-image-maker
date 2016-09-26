var buffer = require('vinyl-buffer');
var merge = require('merge-stream');
var del = require('del');
var gulp = require('gulp');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var imagemin = require('gulp-imagemin');
var spritesmith = require('gulp.spritesmith');

gulp.task('sprite', function () {
  // Generate our spritesheet
  var spriteData = gulp.src('icons/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    retinaSrcFilter: ['icons/*@2x.png'],
    retinaImgName: 'sprite@2x.png',
    cssName: 'sprite.css',
    imgPath: '../images/sprite.png',
    retinaImgPath: '../images/sprite@2x.png',
  }));

  // Pipe image stream through image optimizer and onto disk
  var imgStream = spriteData.img
  // DEV: We must buffer our stream into a Buffer for `imagemin`
      .pipe(buffer())
      .pipe(imagemin())
      .pipe(gulp.dest('build/images/'));

  // Pipe CSS stream through CSS optimizer and onto disk
  var cssStream = spriteData.css
      .pipe(gulp.dest('build/css/'));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});

gulp.task('sprite:build', ['sprite'], function() {
  return gulp.src(['build/images/sprite.png', 'build/images/sprite@2x.png'])
      .pipe(rev())
      .pipe(gulp.dest('build/images/'))
      .pipe(rev.manifest())
      .pipe(gulp.dest('build/images/'));
});

gulp.task('sprite:dist', ['sprite:build'], function() {
  var manifest = gulp.src('build/images/rev-manifest.json');

  return gulp.src('build/css/sprite.css')
      .pipe(revReplace({manifest: manifest}))
      .pipe(gulp.dest('build/css'));
});

gulp.task('default', ['sprite:dist'], function() {
	del(['build/images/sprite.png', 'build/images/sprite@2x.png']);
});
