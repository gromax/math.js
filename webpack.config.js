const path = require('path');

module.exports = {
	mode: "development",
	entry: {
		test_parser: './src/tests/parser.js',
		test_tex: './src/tests/tex.js',
		test:'./src/test.js',
		math:'./src/maths.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
	},
};