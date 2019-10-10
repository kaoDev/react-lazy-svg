// @ts-check

/**
 * @typedef {Object} TsdxOptions 
 * @property {string} input - path to file
 * @property {string} name - Safe name (for UMD)
 * @property {'node' | 'browser'} target - JS target
 * @property {'cjs' | 'umd' | 'esm'} format - Module format
 * @property {'development' | 'production'} env - Environment
 * @property { string} tsconfig - Path to tsconfig file
 * @property { boolean} extractErrors - Is opt-in invariant error extraction active?
 * @property { boolean} minify - Is minifying?
 * @property { boolean} writeMeta - Is this the very first rollup config (and thus should one-off metadata be extracted)?

 */

const safePackageName = name =>
  name.toLowerCase().replace(/((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '');

// Not transpiled with TypeScript or Babel, so use plain Es6/Node.js!
module.exports = {
  // This function will run for each entry/format/env combination
  /**
   *
   * @param {import("rollup").RollupOptions} config
   * @param {TsdxOptions} options
   */
  rollup(config, options) {
    config.output.dir = 'dist';
    config.output.entryFileNames = `${safePackageName(options.name)}.[format]${
      options.env
        ? `.${options.env}${options.env === 'production' ? '.min' : ''}`
        : ''
    }.js`;
    config.output.chunkFileNames = `[name].[format]${
      options.env
        ? `.${options.env}${options.env === 'production' ? '.min' : ''}`
        : ''
    }.js`;

    delete config.output.file;
    return config; // always return a config.
  },
};
