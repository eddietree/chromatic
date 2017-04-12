var env = 'debug'; // 'production'

var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	sass = require('gulp-sass'),
	gutil = require('gulp-util'),
	//less = require('gulp-less'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	browserSync = require('browser-sync'),
	runSequence = require('run-sequence'),
	clean = require('gulp-clean'),
	browserify = require('browserify'),
	notify = require("gulp-notify"),
	source = require("vinyl-source-stream"),
	buffer = require('vinyl-buffer'),
	gulpif = require('gulp-if'),
	uglify = require('gulp-uglify'),
	glslify = require('glslify'),
	babelify = require('babelify');

var settings = require('./js/Settings.js');

var reload = browserSync.reload;

var pathsSrc = {
	html: 'html/*',
	lib: 'lib/**/**/*',
	js: 'js/',
	glsl: 'glsl/*',
	scss: 'scss/main.scss',
	res: 'res/**/*.*',
};

var pathDstRoot = '../public/';
var pathsDst = {
	root: pathDstRoot,
	html: pathDstRoot,
	lib: pathDstRoot + 'lib/',
	js: pathDstRoot + 'js/',
	scss: pathDstRoot + 'css/',
	res: pathDstRoot + 'res/',
};

var notifyMsg = function(msg, title)
{
	gulp.src("").pipe(notify({message:msg, title:title || "Zen Shader"}));
}

var onError = function (err) {
    gutil.log(err.toString());
    this.emit("end");
  };

var onErrorFunc = function(title) {
	return notify.onError({
	message: "Error: <%= error.message %>",
	title:  "Error: " + title
	});
};

var onReloadWebsite = function(){
	reload();
	gutil.log("-------------------------------------------");
};

////////////////////////////////////////////////

gulp.task('clean', function() {
	return gulp.src(pathsDst.root, {
			read: false
		})
		.pipe(clean({force: true}));
});

gulp.task('build-html', function() {
	return gulp.src(pathsSrc.html).pipe(gulp.dest(pathsDst.html));
});

gulp.task('build-scss', function() {
	return gulp.src(pathsSrc.scss)
		.pipe(sass().on('error', onErrorFunc("SCSS Compile Error")))
		.pipe(gulp.dest(pathsDst.scss));
});

gulp.task('build-lib', function() {
	return gulp.src(pathsSrc.lib)
		.pipe(gulp.dest(pathsDst.lib));
});

gulp.task('build-res', function() {
	return gulp.src(pathsSrc.res)
		.pipe(gulp.dest(pathsDst.res));
});

gulp.task('build-js', function() {

	var b = browserify({debug:settings.debug, insertGlobals: true});
	b.transform(babelify, {presets: ["es2015"]} )
	b.transform(glslify)
	b.add(pathsSrc.js + "Main.js");

	return b.bundle()
        .on('error', onErrorFunc("Browserify Compile Error"))
        .pipe(source("Main.js"))
        .pipe(buffer())
        .pipe(gulpif(!settings.debug, uglify()))
        .pipe(gulp.dest(pathsDst.js ));
});

gulp.task('lint', function() {
	 return gulp.src(pathsSrc.js + "*.js")
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

////////////////////////////////////////////////

gulp.task('serve', function() {

	browserSync({
		server: {baseDir: pathDstRoot},
		//https: true
	});

	gulp.watch(pathsSrc.html, ['build-html', onReloadWebsite]);
	gulp.watch(pathsSrc.scss, function() {runSequence('build-scss', 'build-html', onReloadWebsite); });
	gulp.watch(pathsSrc.res, function() {runSequence('build-res', onReloadWebsite); });
	gulp.watch(pathsSrc.lib, function() {runSequence('build-lib', 'build-html', onReloadWebsite); });
	gulp.watch([pathsSrc.js+"*", pathsSrc.js+"*/*", pathsSrc.glsl], function() {runSequence('build-js', onReloadWebsite); });
});

gulp.task('default', function(callback) {

	runSequence(
		'clean', 
		['build-res', 'build-lib', 'build-scss', 'build-js'],
		'build-html',
		'serve',
		callback
	);
});