var gulp = require('gulp');

/*
	COMPILING & PROCESSING ______________________________________________________________________
*/
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');

var jshint = require('gulp-jshint');
var jshintstylish = require('jshint-stylish');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');


var src_dir = "src/";
var lib_dir = 'bower_components/';

var build_dir = "dist/app/";
var dist_dir = "dist/";


var tasks = {
	once: [],
	watch: [],
};

/* JAVASCRIPT ____________________________________________________________________________*/
var scripts_src = 'src/js/**';


gulp.task('jserrors', function() {
	gulp.src(scripts_src)
		.pipe(jshint())
		.pipe(jshint.reporter(jshintstylish));
});

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
gulp.task('scripts_w', function(){gulp.watch(scripts_src,['scripts']);});
tasks.once.push('scripts');
tasks.watch.push('scripts_w');


/* IMAGES ____________________________________________________________________________*/
var image_min_src = 'src/img/**';
gulp.task('image_min', function(){
	gulp.src(image_min_src)
		.pipe(imagemin())
		.pipe(gulp.dest(build_dir+'img/'))
	;
});
gulp.task('image_min_w', function(){gulp.watch(image_min_src,['image_min']);});
tasks.once.push('image_min');
tasks.watch.push('image_min_w');


/* SCSS ____________________________________________________________________________*/
var sass_compile_src = 'src/css/*.scss';
gulp.task('sass_compile',function(){
	gulp.src(sass_compile_src)
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 3 versions','safari 5', 'ie 6', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
			cascade: false
		}))
		.pipe(cleanCSS({compatibility: 'ie9'}))
		.pipe(gulp.dest(build_dir+'css'))
	;
});
gulp.task('sass_compile_w',function(){gulp.watch(sass_compile_src,['sass_compile']);});
tasks.once.push('sass_compile');
tasks.watch.push('sass_compile_w');


/* HTML ____________________________________________________________________________*/
var html_min_src = 'src/**/*.html';
gulp.task('html_min',function(){
	gulp.src(html_min_src)
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest(build_dir))
	;
});
gulp.task('html_min_w',function(){gulp.watch(html_min_src,['html_min']);});
tasks.once.push('html_min');
tasks.watch.push('html_min_w');


/* FONTS ____________________________________________________________________________*/
var copyfonts_src = 'src/fonts/**';
gulp.task('copyfonts', function() {
   gulp.src(copyfonts_src)
   .pipe(gulp.dest(build_dir+'fonts'));
});
gulp.task('copyfonts_w', function() { gulp.watch(copyfonts_src,['copyfonts']);});
tasks.once.push('copyfonts');
tasks.watch.push('copyfonts_w');


/* packagejson ____________________________________________________________________________*/
var packagejson_src = 'package.json';
gulp.task('packagejson', function() {
   gulp.src(packagejson_src)
   .pipe(gulp.dest(dist_dir));
});
gulp.task('packagejson_w', function(){gulp.watch(packagejson_src,['packagejson']);});
tasks.once.push('packagejson');
tasks.watch.push('packagejson_w');


/* GENERAL ____________________________________________________________________________*/
gulp.task('once',tasks.once);
gulp.task('watch',tasks.watch);
gulp.task('default',['once','watch']);

/*
	VERSIONING & RELASES ______________________________________________________________________
*/

// var git = require('gulp-git');