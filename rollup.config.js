import typescript from '@rollup/plugin-typescript';
import filesize from 'rollup-plugin-filesize';

const plugins = [
  typescript({
    lib: ['es5', 'es6', 'dom'],
    target: 'es5',
    declaration: true,
    noEmitOnError: true,
  }),
  filesize(),
];

const indexCjs = {
  input: 'src/index.tsx',
  output: {
    format: 'cjs',
    file: 'dist/index.cjs.js',
  },
  plugins,
};
const indexEsm = {
  input: 'src/index.tsx',
  output: {
    format: 'esm',
    file: 'dist/index.esm.js',
  },
  plugins,
};
const ssrCjs = {
  input: 'src/ssr.tsx',
  output: {
    format: 'cjs',
    file: 'dist/ssr.js',
  },
  plugins,
};

export default [indexCjs, indexEsm, ssrCjs];
