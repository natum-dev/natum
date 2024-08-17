import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dts from "vite-plugin-dts";
import sassDts from "vite-plugin-sass-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import { glob } from "glob";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    cssCodeSplit: true,
    modulePreload: true,
    lib: {
      entry: glob.sync(
        // Adds all entry point from the main index and all submodules
        path.resolve(__dirname, "src/**/index.{ts,tsx}"),
        {
          ignore: "src/**/*.d.ts",
        }
      ),
      name: "@jonathanramlie/neuron",
    },
    rollupOptions: {
      // Adds all dependencies as external packages so it's not bundled
      external: ["react", "react/jsx-runtime", "react-dom"],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
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
