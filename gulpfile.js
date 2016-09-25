var gulp = require('gulp');

/*
	COMPILING & PROCESSING ______________________________________________________________________
*/
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');


var src_dir = "src/";
var lib_dir = 'bower_components/';

var build_dir = "dist/app/";
var dist_dir = "dist/";

gulp.task('scripts', function() {

	var scripts = [
		// lib_dir + 'angular/angular.min.js',
		
		// lib_dir + 'ng-scrollbar/dist/ng-scrollbar.js',
		// lib_dir + 'angular-mousewheel/mousewheel.js',
		// lib_dir + 'hamsterjs/hamster.js',
		
/*		lib_dir + 'angular-sanitize/angular-sanitize.min.js',
		lib_dir + 'angular-translate/angular-translate.min.js',
		lib_dir + 'angular-translate-loader-url/angular-translate-loader-url.min.js',
		lib_dir + 'angularUtils-pagination/dirPagination.js',
		lib_dir + 'socket.io-client/socket.io.js',
		lib_dir + 'angular-load/angular-load.min.js',
		lib_dir + 'foundation-apps/dist/js/foundation-apps.min.js',
		lib_dir + 'foundation-apps/dist/js/foundation-apps-templates.min.js',
		lib_dir + 'hammerjs/hammer.min.js',
		lib_dir + 'angular-hotkeys/build/hotkeys.min.js',
		lib_dir + 'angular-ui-router/release/angular-ui-router.min.js',*/

		/*src_dir + 'js/data_models/common.js',
		src_dir + 'js/data_models/product.js',*/
		src_dir + 'js/data_models/*',
		
		src_dir + 'js/app.js',
		src_dir + 'js/**',
		/*src_dir + 'js/filters/common.js',
		src_dir + 'js/filters/product.js',
		src_dir + 'js/filters/extra.js',
		src_dir + 'js/directives/common.js',
		src_dir + 'js/directives/product.js',
		src_dir + 'js/services/common.js',
		src_dir + 'js/services/util.js',
		src_dir + 'js/controllers/head.js',
		src_dir + 'js/controllers/main.js',
		src_dir + 'js/controllers/table.js',
		src_dir + 'js/controllers/product.js',
		src_dir + 'js/controllers/filter.js',
		src_dir + 'js/controllers/extra.js',*/
	];

	gulp.src(scripts)
		.pipe(concat('main.js'))
			.pipe(gulp.dest(build_dir+'js'))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
			.pipe(gulp.dest(build_dir+'js'));
});

gulp.task('image_min', function(){
	gulp.src('src/img/**')
		.pipe(imagemin())
		.pipe(gulp.dest(build_dir+'img/'))
	;
});

gulp.task('sass_compile',function(){
	gulp.src('src/css/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 3 versions','safari 5', 'ie 6', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
			cascade: false
		}))
		.pipe(cleanCSS({compatibility: 'ie9'}))
		.pipe(gulp.dest(build_dir+'css'))
	;
});

gulp.task('html_min',function(){
	gulp.src('src/**/*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest(build_dir))
	;
});

gulp.task('copyfonts', function() {
   gulp.src('src/fonts/**')
   .pipe(gulp.dest(build_dir+'fonts'));
});

gulp.task('packagejson', function() {
   gulp.src('package.json')
   .pipe(gulp.dest(dist_dir));
});

gulp.task('compile_once',['scripts','copyfonts','sass_compile','html_min','image_min','packagejson']);
gulp.task('compile_watch',function() {
	gulp.watch('src/css/*.scss',['sass_compile']);
	gulp.watch('src/**/*.html',['html_min']);
	gulp.watch('src/img/*',['image_min']);
	gulp.watch('src/fonts/**',['copyfonts']);
	
	gulp.watch('src/js/**/*.js',['scripts']);
	gulp.watch('package.json',['packagejson']);
});
gulp.task('default',['compile_once','compile_watch']);

/*
	VERSIONING & RELASES ______________________________________________________________________
*/

// var git = require('gulp-git');