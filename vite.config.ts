import dts from "vite-plugin-dts";
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, UserConfig } from "vite";


export default defineConfig({
  base: "./",
  plugins: [
    dts({ rollupTypes: true }),
    react({
    jsxImportSource: '@emotion/react',
    babel: {
      plugins: ['@emotion/babel-plugin'],
    },
  }),],
  // plugins: [dts({ rollupTypes: true }), react(), babel({ extensions: ['.js', '.jsx', '.ts', '.tsx'] })],
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/lib/index.ts"), //라이브러리 진입점, 제공하고자하는 컴포넌트를 모두 export하는 부분
      name: "react-gptable",
      // formats: ["es", "cjs", "umd", "iife"],
      formats: ["es","cjs"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '**/*.stories.tsx'], //라이브러리에 포함하지 않을 dependency 명시
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        }, //라이브러리 외부에 존재하는 dependency를 위해 번들링 시 사용될 전역 변수 명시
        banner: '"use client";', //번들 앞에 문자열을 추가함, "use client";를 추가해 컴포넌트의 모든 사용을 클라이언트 컴포넌트로 보장 (리액트 서버 컴포넌트가 나온 시점에서 명시하는게 더 안전할 것 같다고 판단)
        interop: 'auto', //외부 의존성과의 모듈 간 상호 작용 방식 설정 (기본 모드에서 Node.js 동작 방식을 따르며, TypeScript의 esModuleInterop 동작과 다르므로 auto로 설정하여 ES모듈과 CommonJS모듈 간의 상호 운용성 문제를 줄임)
      },
    },
  },
} satisfies UserConfig);
