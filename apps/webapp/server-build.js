import esbuild from "esbuild";
import fs from "fs/promises";
import { TsconfigPathsPlugin } from "@esbuild-plugins/tsconfig-paths";

/** @type {import('esbuild').Plugin} */
const serverOnlyPlugin = {
  name: "serverOnly",
  setup(build) {
    // esbuild plugin that unwraps `serverOnly$(expression)` into `expression`
    build.onLoad({ filter: /\.ts$/ }, async (args) => {
      const contents = await fs.readFile(args.path, "utf-8");

      // Regular expression to find serverOnly$(expression) and capture the expression
      const regex = /serverOnly\$\((.*?)\)/gs;

      return {
        contents: contents.replace(regex, (match, expression) => `(${expression})`),
        loader: args.path.includes(".ts") ? "ts" : "js",
      };
    });
  },
};

esbuild
  .build({
    entryPoints: ["./server.ts"],
    platform: "node",
    format: "esm",
    outdir: "build",
    bundle: true,

    packages: "external",
    plugins: [TsconfigPathsPlugin({}), serverOnlyPlugin],
  })
  .then(() => console.log("Build successful!"))
  .catch((error) => {
    console.error("Build failed:", error);
    process.exit(1);
  });
