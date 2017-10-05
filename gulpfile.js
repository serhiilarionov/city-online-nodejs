var gulp = require('gulp');
var less = require('gulp-less');
var watch = require('gulp-watch');
var replace = require('gulp-replace-task');
var fs = require('fs');

renameObjectProperty = function (object, oldName, newName) {
	// Do nothing if the names are the same
	if (oldName == newName) {
		return object;
	}
	// Check for the old property name to avoid a ReferenceError in strict mode.
	if (object.hasOwnProperty(oldName)) {
		object[newName] = object[oldName];
		delete object[oldName];
	}
	return object;
};

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('less', function () {
  watch('./public/less/*.less', function() {
	gulp.src('./public/less/*.less')
	  .pipe(less())
	  .pipe(gulp.dest('./public/less/'))
	  .on('error', function(error) { console.log(error); this.end(); });
  });
}).on('error', function(error) { console.log(error); this.end(); });

gulp.task('create html', function () {
	fs.readFile('./public/lang/ua.json', 'utf8', function(err, data) {
		if(err) console.log(err);
		else {
			data = JSON.parse(data);
			gulp.src('./public/src/index.html')
				.pipe(replace({
					patterns: [
						{
							json: {
								"lang": data
							}
						}
					]
				}))
				.pipe(gulp.dest('./public'));
		}
	});
});