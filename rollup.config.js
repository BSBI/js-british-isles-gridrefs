// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/gridrefutils.js',
        format: 'es', // 'cjs'
        sourcemap: true
    },
  plugins: [
    resolve({
		// pass custom options to the resolve plugin
		customResolveOptions: {
		  moduleDirectory: 'node_modules'
		}
	  }),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
	//(process.env.NODE_ENV === 'production' && uglify())
	//uglify()
  ]
};