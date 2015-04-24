module.exports = function (grunt) {
	require('time-grunt')(grunt);

	grunt.initConfig({
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [
				'Gruntfile.js',
				'src/*.js',
				'examples/*.js',
			]
		},
		jscs: {
			src: [
				'Gruntfile.js',
				'src/*.js',
				'examples/*.js',
			],
			options: {
				config: '.jscsrc',
				requireCurlyBraces: ['if']
			}
		},
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jscs');

	grunt.registerTask('default', ['jshint', 'jscs']);
	grunt.registerTask('build', ['jshint', 'jscs']);
};
