import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dts from "vite-plugin-dts";
import { glob } from "glob";
import { fileURLToPath } from "node:url";

const sharedOutput = {
  sourcemap: true,
  exports: "named" as const,
  globals: {
    react: "react",
    "react/jsx-runtime": "react/jsx-runtime",
  },
};

export default defineConfig({
  build: {
    lib: {
      entry: {
        ...Object.fromEntries(
          glob
            .sync(path.resolve(__dirname, "src/**/*.{ts,tsx}"), {
              ignore: "src/**/*.d.ts",
            })
            .map((file) => [
              path.relative(
                "src",
                file.slice(0, file.length - path.extname(file).length)
              ),
              fileURLToPath(new URL(file, import.meta.url)),
            ])
        ),
      },
      name: "@natum/icons",
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
      output: [
        {
          ...sharedOutput,
          format: "es" as const,
          dir: "dist/esm",
          entryFileNames: "[name].js",
          chunkFileNames: "[name]-[hash].js",
          preserveModules: true,
          preserveModulesRoot: "src",
        },
        {
          ...sharedOutput,
          format: "cjs" as const,
          dir: "dist/cjs",
          entryFileNames: "[name].cjs",
          chunkFileNames: "[name]-[hash].cjs",
          preserveModules: true,
          preserveModulesRoot: "src",
        },
      ],
    },
  },
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.json",
      outDir: "dist/types",
    }),
  ],
});
