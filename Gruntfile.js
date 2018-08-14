module.exports = function (grunt) {
    grunt.initConfig({
        cwebp: {
            dynamic: {
                options: {
                    q: 50
                },
                files: [{
                    expand: true,
                    cwd: 'img/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'img/'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-cwebp');
    grunt.registerTask('default', ['cwebp']);

};