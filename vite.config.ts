import dts from "vite-plugin-dts";
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, UserConfig } from "vite";
import tsconfigPaths from 'vite-tsconfig-paths';
import { getBabelOutputPlugin } from '@rollup/plugin-babel'
//https://velog.io/@seonye-98/npm-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-%EB%B0%B0%ED%8F%AC-React-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-%EB%B0%B0%ED%8F%AC%EC%A0%84-%EC%84%A4%EC%A0%95

export default defineConfig({
  // base: "./",
  plugins: [
    dts({ rollupTypes: true }),
    // dts({
    //   insertTypesEntry: true, // 컴포넌트 타입 생성
    // }),
    tsconfigPaths(), // 절대 경로 생성시 사용된다. 
    react({ jsxRuntime: 'classic' })
    // react({
    // jsxImportSource: '@emotion/react',
    // babel: {
    //   plugins: ['@emotion/babel-plugin'],
    // },
    // }),
  ],
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
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'], //라이브러리에 포함하지 않을 dependency 명시
      output: {
        plugins: [
          getBabelOutputPlugin({
            allowAllFormats: true,
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: '> 0.25%, not dead, IE 11',
                  useBuiltIns: false, // Default：false
                  // // https://babeljs.io/docs/en/babel-preset-env#modules
                  modules: false
                },
              ]
            ]
          }),

        ],
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
