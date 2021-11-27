// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/gridrefutils.js',
        format: 'es', // 'cjs'
        sourcemap: true
    },
  plugins: [
    resolve(
      //   {
		// // pass custom options to the resolve plugin
		// customResolveOptions: {
		//   moduleDirectory: 'node_modules'
		// }
	  // }
      ),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
      babelHelpers: 'runtime'
    }),
    commonjs(), // converts npm packages to ES modules
    production && terser() // minify, but only in production
	//(process.env.NODE_ENV === 'production' && uglify())
	//uglify()
  ]
};
