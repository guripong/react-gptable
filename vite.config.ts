import dts from "vite-plugin-dts";
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, UserConfig } from "vite";
import babel from '@rollup/plugin-babel';

export default defineConfig({
  base: "./",
  // plugins: [dts({ rollupTypes: true }), react()],
  plugins: [dts({ rollupTypes: true }), react(), babel({ extensions: ['.js', '.jsx', '.ts', '.tsx'] })],
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      name: "mylib",
      // formats: ["es", "cjs", "umd", "iife"],
      formats: ["es"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
} satisfies UserConfig);
