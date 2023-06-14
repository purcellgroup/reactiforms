import babel from "@rollup/plugin-babel";
import external from "rollup-plugin-peer-deps-external";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "./src/index.js",
  output: [
    // {
    //   file: "dist/index.js",
    //   format: "cjs",
    //   exports: "auto",
    //   sourcemap: true,
    // },
    {
      file: "dist/index.es.js",
      format: "esm",
      exports: "auto",
      sourcemap: true,
    },
  ],
  external: ["react", "react-dom"],
  plugins: [
    external(), // exclude peerDependencies from the bundle
    nodeResolve(), // tells Rollup how to find node modules
    babel({
      exclude: /node_modules/,
      babelHelpers: "bundled",
      presets: ["@babel/preset-env", "@babel/preset-react"],
    }),
  ],
};
