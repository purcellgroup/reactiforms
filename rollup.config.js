import babel from "@rollup/plugin-babel";
import external from "rollup-plugin-peer-deps-external";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

export default {
  input: "./src/index.ts",
  output: [
    {
      file: "dist/index.es.js",
      format: "esm",
      exports: "auto",
      sourcemap: true,
    },
  ],
  external: ["react", "react-dom"],
  plugins: [
    typescript(),
    external(), // exclude peerDeps from bundle
    nodeResolve(), // find node modules
    babel({
      exclude: /node_modules/,
      babelHelpers: "bundled",
      presets: ["@babel/preset-env", "@babel/preset-react"],
    }),
  ],
};
