module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.loadNpmTasks('grunt-contrib-watch');
	
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json') , 

		watch: {

			scripts: {

				files: ['**/*.js'], 

				tasks: ['mochaTest'],

				options: {

					nospawn: true,

				},
			},
		},
	
		mochaTest: {
		
			test: {
				
				options: {

					reporter: 'list' ,

					ui : 'bdd'

				},

				src: ['spec/**/*.js']
			}	
		
		}
	
	});
	
	grunt.registerTask('default' , "mochaTest");
	
}