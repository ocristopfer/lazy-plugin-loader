import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default [
  // UMD build
  {
    input: "src/index.js",
    output: {
      file: "dist/index.js",
      format: "umd",
      name: "LazyPluginLoader",
      sourcemap: !production,
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      production && terser(),
    ].filter(Boolean),
  },

  // ES Module build
  {
    input: "src/index.js",
    output: {
      file: "dist/index.esm.js",
      format: "es",
      sourcemap: !production,
    },
    plugins: [resolve(), commonjs()],
  },
];
