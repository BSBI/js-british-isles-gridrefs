// rollup.config.js
//import resolve from '@rollup/plugin-node-resolve';
//import babel from '@rollup/plugin-babel';
//import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default [
    // {
    //     input: 'src/index.js',
    //     output: {
    //         file: 'dist/gridrefutils.js',
    //         format: 'es', // 'cjs'
    //         sourcemap: true,
    //         exports: "named",
    //         name: 'gridrefutils',
    //     },
    //   plugins: [
    //     resolve(),
    //     babel({
    //       exclude: 'node_modules/**', // only transpile our source code
    //       babelHelpers: 'runtime'
    //     }),
    //     commonjs(), // converts npm packages to ES modules
    //     production && terser() // minify, but only in production
    //   ]
    // },
    {
        input: 'src/index.js',
        output: {
            file: 'dist/gridrefutils.mjs',
            format: 'esm',
            sourcemap: true,
            exports: "named",
            name: 'gridrefutils',
        },
        plugins: [

            production && false && terser({
                module: true
            })
            //production && terser() // minify, but only in production
        ]
    }
];
