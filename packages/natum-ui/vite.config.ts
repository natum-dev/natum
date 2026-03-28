import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dts from "vite-plugin-dts";
import sassDts from "vite-plugin-sass-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import { glob } from "glob";
import { fileURLToPath } from "node:url";
import copy from "rollup-plugin-copy";

/**
 * Inline Rollup plugin that preserves "use client" directives
 * on chunks whose source modules contain the directive.
 */
function preserveUseClientDirective(): import("rollup").Plugin {
  const clientModules = new Set<string>();
  return {
    name: "preserve-use-client",
    transform(code, id) {
      if (/^['"]use client['"]/.test(code.trim())) {
        clientModules.add(id);
      }
      return null;
    },
    renderChunk(code, chunk) {
      const hasClientModule = chunk.moduleIds.some((id) =>
        clientModules.has(id)
      );
      if (hasClientModule && !code.startsWith('"use client"')) {
        return { code: `"use client";\n${code}`, map: null };
      }
      return null;
    },
  };
}

const sharedOutput = {
  sourcemap: true,
  exports: "named" as const,
  globals: {
    react: "react",
    "react-dom": "ReactDOM",
    "react/jsx-runtime": "react/jsx-runtime",
  },
  assetFileNames: "[name][extname]",
};

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    cssCodeSplit: true,
    modulePreload: true,
    lib: {
      entry: {
        ...Object.fromEntries(
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
      },
      name: "@natum/natum-ui",
    },
    rollupOptions: {
      // Adds all dependencies as external packages so it's not bundled
      external: ["react", "react/jsx-runtime", "react-dom", "@natum/icons", "classnames"],
      output: [
        {
          ...sharedOutput,
          format: "es" as const,
          dir: "dist/esm",
          preserveModules: true,
          preserveModulesRoot: "src",
          entryFileNames: "[name].js",
        },
        {
          ...sharedOutput,
          format: "cjs" as const,
          dir: "dist/cjs",
          preserveModules: true,
          preserveModulesRoot: "src",
          entryFileNames: "[name].cjs",
        },
      ],
    },
  },
  plugins: [
    preserveUseClientDirective(),
    react(),
    // Configures typing definiton generation
    dts({
      tsconfigPath: "./tsconfig.json",
      outDir: "dist/types",
    }),
    sassDts({
      enabledMode: ["development", "production"],
      esmExport: true,
    }),
    libInjectCss(),
    copy({
      targets: [
        {
          src: glob.sync(path.resolve(__dirname, "src/design-tokens/*.scss")),
          dest: "dist/design-tokens",
        },
      ],
      hook: "closeBundle",
      verbose: true,
    }),
  ],
});
