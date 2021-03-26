// @ts-check
import typescript from 'rollup-plugin-typescript2';
import filesize from 'rollup-plugin-filesize';

const indexCjs = {
  input: 'src/index.tsx',
  output: {
    format: 'cjs',
    file: 'dist/index.cjs.js',
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          lib: ['es5', 'es6', 'dom'],
          target: 'es5',
          declaration: false,
          noEmitOnError: true,
        },
      },
    }),
    filesize(),
  ],
};

const indexEsm = {
  input: 'src/index.tsx',
  output: {
    format: 'esm',
    file: 'dist/index.esm.js',
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          lib: ['es5', 'es6', 'dom'],
          target: 'es2019',
          declaration: true,
          noEmitOnError: true,
        },
      },
    }),
    filesize(),
  ],
};

const ssrCjs = {
  input: 'src/ssr.tsx',
  output: {
    format: 'cjs',
    file: 'dist/ssr.js',
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          lib: ['es5', 'es6', 'dom'],
          target: 'es5',
          declaration: true,
          noEmitOnError: true,
        },
      },
    }),
    filesize(),
  ],
};

export default [indexCjs, indexEsm, ssrCjs];
