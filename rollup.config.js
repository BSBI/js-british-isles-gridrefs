// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'src/index.js',
  format: 'cjs', // 'cjs'
  plugins: [
    resolve({
		// pass custom options to the resolve plugin
		customResolveOptions: {
		  moduleDirectory: 'node_modules'
		}
	  }),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    }),
	//(process.env.NODE_ENV === 'production' && uglify())
	uglify()
  ],
  dest: 'dist/gridrefutils.js', // equivalent to --output
  sourceMap: true
};