import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dts from "vite-plugin-dts";
import sassDts from "vite-plugin-sass-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import { glob } from "glob";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    cssCodeSplit: true,
    modulePreload: true,
    lib: {
      entry: Object.fromEntries(
        glob
          .sync(
            // Adds all entry point from the main index and all submodules
            path.resolve(__dirname, "src/**/index.{ts,tsx}"),
            {
              ignore: "src/**/*.d.ts",
            }
          )
          .map((file) => [
            // This remove `src/` as well as the file extension from each
            // file, so e.g. src/nested/foo.js becomes nested/foo
            path.relative(
              "src",
              file.slice(0, file.length - path.extname(file).length)
            ),
            // This expands the relative paths to absolute paths, so e.g.
            // src/nested/foo becomes /project/src/nested/foo.js
            fileURLToPath(new URL(file, import.meta.url)),
          ])
      ),
      name: "@jonathanramlie/neuron",
    },
    rollupOptions: {
      // Adds all dependencies as external packages so it's not bundled
      external: ["react", "react/jsx-runtime", "react-dom"],
      output: {
        sourcemap: true,
        exports: "named",
        globals: {
          react: "react",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "react/jsx-runtime",
        },
      },
    },
  },
  plugins: [
    react(),
    // Configures typing definiton generation
    dts({
      tsconfigPath: "./tsconfig.app.json",
    }),
    sassDts(),
    libInjectCss(),
  ],
});
