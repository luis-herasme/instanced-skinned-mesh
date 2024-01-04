import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext",
    minify: true,
    lib: {
      entry: resolve(__dirname, "src/lib.ts"),
      name: "instanced-mesh",
      fileName: "lib",
    },
    rollupOptions: {
      external: ["three"],
      output: {
        globals: {
          three: "THREE",
        },
      },
    },
  },
});
