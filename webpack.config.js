const path = require('path');

module.exports = {
	mode: "development",
	entry: {
		test:'./src/test.js',
		math:'./src/maths.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
	},
};