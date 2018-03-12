var gulp = require('gulp')
var concat = require('gulp-concat')
var ngAnnotate = require('gulp-ng-annotate')
var sass = require('gulp-sass')
var sourcemaps = require('gulp-sourcemaps')

var srcJs = ['src/app.js', 'src/**/*.js']
var assets = ['src/**/*.html', 'src/**/*.css']
var sassSrc = ['src/**/*.scss']

var targetDir = './dist'
var bootstrapDir = './node_modules/bootstrap-sass'

gulp.task('build', function() {
	return gulp.src(srcJs)
		.pipe(sourcemaps.init())
		.pipe(ngAnnotate())
		.pipe(concat('all.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(targetDir))
})

gulp.task('sass', function() {
	return gulp.src(sassSrc)
		.pipe(sass({
			includePaths: [bootstrapDir + '/assets/stylesheets'],
		}).on('error', sass.logError))
		.pipe(concat('style.css'))
		.pipe(gulp.dest(targetDir))
})

gulp.task('fonts', function() {
	return gulp.src(bootstrapDir + '/assets/fonts/**/*')
		.pipe(gulp.dest(targetDir + '/fonts'))
})

gulp.task('assets', function() {
	return gulp.src(assets)
		.pipe(gulp.dest(targetDir))
})

gulp.task('watch', ['default'], function () {
	return gulp.watch(srcJs.concat(assets).concat(sassSrc), ['build', 'assets', 'sass'])
})

gulp.task('default', ['build', 'assets', 'sass'])

