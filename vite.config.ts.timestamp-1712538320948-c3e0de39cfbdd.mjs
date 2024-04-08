// vite.config.ts
import dts from "file:///C:/Users/bnri/Desktop/REL/react-gptable/node_modules/vite-plugin-dts/dist/index.mjs";
import path from "path";
import react from "file:///C:/Users/bnri/Desktop/REL/react-gptable/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///C:/Users/bnri/Desktop/REL/react-gptable/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///C:/Users/bnri/Desktop/REL/react-gptable/node_modules/vite-tsconfig-paths/dist/index.mjs";
import { getBabelOutputPlugin } from "file:///C:/Users/bnri/Desktop/REL/react-gptable/node_modules/@rollup/plugin-babel/dist/es/index.js";
var __vite_injected_original_dirname = "C:\\Users\\bnri\\Desktop\\REL\\react-gptable";
var vite_config_default = defineConfig({
  // base: "./",
  plugins: [
    dts({ rollupTypes: true }),
    // dts({
    //   insertTypesEntry: true, // 컴포넌트 타입 생성
    // }),
    tsconfigPaths(),
    // 절대 경로 생성시 사용된다. 
    react({ jsxRuntime: "classic" })
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
    port: 3e3
  },
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__vite_injected_original_dirname, "src/lib/index.ts"),
      //라이브러리 진입점, 제공하고자하는 컴포넌트를 모두 export하는 부분
      name: "react-gptable",
      // formats: ["es", "cjs", "umd", "iife"],
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      //라이브러리에 포함하지 않을 dependency 명시
      output: {
        plugins: [
          getBabelOutputPlugin({
            allowAllFormats: true,
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: "> 0.25%, not dead, IE 11",
                  useBuiltIns: false,
                  // Default：false
                  // // https://babeljs.io/docs/en/babel-preset-env#modules
                  modules: false
                }
              ]
            ]
          })
        ],
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
        },
        //라이브러리 외부에 존재하는 dependency를 위해 번들링 시 사용될 전역 변수 명시
        banner: '"use client";',
        //번들 앞에 문자열을 추가함, "use client";를 추가해 컴포넌트의 모든 사용을 클라이언트 컴포넌트로 보장 (리액트 서버 컴포넌트가 나온 시점에서 명시하는게 더 안전할 것 같다고 판단)
        interop: "auto"
        //외부 의존성과의 모듈 간 상호 작용 방식 설정 (기본 모드에서 Node.js 동작 방식을 따르며, TypeScript의 esModuleInterop 동작과 다르므로 auto로 설정하여 ES모듈과 CommonJS모듈 간의 상호 운용성 문제를 줄임)
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxibnJpXFxcXERlc2t0b3BcXFxcUkVMXFxcXHJlYWN0LWdwdGFibGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGJucmlcXFxcRGVza3RvcFxcXFxSRUxcXFxccmVhY3QtZ3B0YWJsZVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYm5yaS9EZXNrdG9wL1JFTC9yZWFjdC1ncHRhYmxlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IGR0cyBmcm9tIFwidml0ZS1wbHVnaW4tZHRzXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBVc2VyQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XHJcbmltcG9ydCB7IGdldEJhYmVsT3V0cHV0UGx1Z2luIH0gZnJvbSAnQHJvbGx1cC9wbHVnaW4tYmFiZWwnXHJcbi8vaHR0cHM6Ly92ZWxvZy5pby9Ac2VvbnllLTk4L25wbS0lRUIlOUQlQkMlRUMlOUQlQjQlRUIlQjglOEMlRUIlOUYlQUMlRUIlQTYlQUMtJUVCJUIwJUIwJUVEJThGJUFDLVJlYWN0LSVFQyVCQiVCNCVFRCU4RiVBQyVFQiU4NCU4QyVFRCU4QSVCOC0lRUIlOUQlQkMlRUMlOUQlQjQlRUIlQjglOEMlRUIlOUYlQUMlRUIlQTYlQUMtJUVCJUIwJUIwJUVEJThGJUFDJUVDJUEwJTg0LSVFQyU4NCVBNCVFQyVBMCU5NVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAvLyBiYXNlOiBcIi4vXCIsXHJcbiAgcGx1Z2luczogW1xyXG4gICAgZHRzKHsgcm9sbHVwVHlwZXM6IHRydWUgfSksXHJcbiAgICAvLyBkdHMoe1xyXG4gICAgLy8gICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLCAvLyBcdUNFRjRcdUQzRUNcdUIxMENcdUQyQjggXHVEMEMwXHVDNzg1IFx1QzBERFx1QzEzMVxyXG4gICAgLy8gfSksXHJcbiAgICB0c2NvbmZpZ1BhdGhzKCksIC8vIFx1QzgwOFx1QjMwMCBcdUFDQkRcdUI4NUMgXHVDMEREXHVDMTMxXHVDMkRDIFx1QzBBQ1x1QzZBOVx1QjQxQ1x1QjJFNC4gXHJcbiAgICByZWFjdCh7IGpzeFJ1bnRpbWU6ICdjbGFzc2ljJyB9KVxyXG4gICAgLy8gcmVhY3Qoe1xyXG4gICAgLy8ganN4SW1wb3J0U291cmNlOiAnQGVtb3Rpb24vcmVhY3QnLFxyXG4gICAgLy8gYmFiZWw6IHtcclxuICAgIC8vICAgcGx1Z2luczogWydAZW1vdGlvbi9iYWJlbC1wbHVnaW4nXSxcclxuICAgIC8vIH0sXHJcbiAgICAvLyB9KSxcclxuICBdLFxyXG4gIC8vIHBsdWdpbnM6IFtkdHMoeyByb2xsdXBUeXBlczogdHJ1ZSB9KSwgcmVhY3QoKSwgYmFiZWwoeyBleHRlbnNpb25zOiBbJy5qcycsICcuanN4JywgJy50cycsICcudHN4J10gfSldLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCIwLjAuMC4wXCIsXHJcbiAgICBwb3J0OiAzMDAwXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgbGliOiB7XHJcbiAgICAgIGVudHJ5OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9saWIvaW5kZXgudHNcIiksIC8vXHVCNzdDXHVDNzc0XHVCRTBDXHVCN0VDXHVCOUFDIFx1QzlDNFx1Qzc4NVx1QzgxMCwgXHVDODFDXHVBQ0Y1XHVENTU4XHVBQ0UwXHVDNzkwXHVENTU4XHVCMjk0IFx1Q0VGNFx1RDNFQ1x1QjEwQ1x1RDJCOFx1Qjk3QyBcdUJBQThcdUI0NTAgZXhwb3J0XHVENTU4XHVCMjk0IFx1QkQ4MFx1QkQ4NFxyXG4gICAgICBuYW1lOiBcInJlYWN0LWdwdGFibGVcIixcclxuICAgICAgLy8gZm9ybWF0czogW1wiZXNcIiwgXCJjanNcIiwgXCJ1bWRcIiwgXCJpaWZlXCJdLFxyXG4gICAgICBmb3JtYXRzOiBbXCJlc1wiLCBcImNqc1wiXSxcclxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBpbmRleC4ke2Zvcm1hdH0uanNgLFxyXG4gICAgfSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgZXh0ZXJuYWw6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sIC8vXHVCNzdDXHVDNzc0XHVCRTBDXHVCN0VDXHVCOUFDXHVDNUQwIFx1RDNFQ1x1RDU2OFx1RDU1OFx1QzlDMCBcdUM1NEFcdUM3NDQgZGVwZW5kZW5jeSBcdUJBODVcdUMyRENcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgcGx1Z2luczogW1xyXG4gICAgICAgICAgZ2V0QmFiZWxPdXRwdXRQbHVnaW4oe1xyXG4gICAgICAgICAgICBhbGxvd0FsbEZvcm1hdHM6IHRydWUsXHJcbiAgICAgICAgICAgIHByZXNldHM6IFtcclxuICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAnQGJhYmVsL3ByZXNldC1lbnYnLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICB0YXJnZXRzOiAnPiAwLjI1JSwgbm90IGRlYWQsIElFIDExJyxcclxuICAgICAgICAgICAgICAgICAgdXNlQnVpbHRJbnM6IGZhbHNlLCAvLyBEZWZhdWx0XHVGRjFBZmFsc2VcclxuICAgICAgICAgICAgICAgICAgLy8gLy8gaHR0cHM6Ly9iYWJlbGpzLmlvL2RvY3MvZW4vYmFiZWwtcHJlc2V0LWVudiNtb2R1bGVzXHJcbiAgICAgICAgICAgICAgICAgIG1vZHVsZXM6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSksXHJcblxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgZ2xvYmFsczoge1xyXG4gICAgICAgICAgcmVhY3Q6IFwiUmVhY3RcIixcclxuICAgICAgICAgIFwicmVhY3QtZG9tXCI6IFwiUmVhY3RET01cIixcclxuICAgICAgICB9LCAvL1x1Qjc3Q1x1Qzc3NFx1QkUwQ1x1QjdFQ1x1QjlBQyBcdUM2NzhcdUJEODBcdUM1RDAgXHVDODc0XHVDN0FDXHVENTU4XHVCMjk0IGRlcGVuZGVuY3lcdUI5N0MgXHVDNzA0XHVENTc0IFx1QkM4OFx1QjRFNFx1QjlDMSBcdUMyREMgXHVDMEFDXHVDNkE5XHVCNDIwIFx1QzgwNFx1QzVFRCBcdUJDQzBcdUMyMTggXHVCQTg1XHVDMkRDXHJcbiAgICAgICAgYmFubmVyOiAnXCJ1c2UgY2xpZW50XCI7JywgLy9cdUJDODhcdUI0RTQgXHVDNTVFXHVDNUQwIFx1QkIzOFx1Qzc5MFx1QzVGNFx1Qzc0NCBcdUNEOTRcdUFDMDBcdUQ1NjgsIFwidXNlIGNsaWVudFwiO1x1Qjk3QyBcdUNEOTRcdUFDMDBcdUQ1NzQgXHVDRUY0XHVEM0VDXHVCMTBDXHVEMkI4XHVDNzU4IFx1QkFBOFx1QjRFMCBcdUMwQUNcdUM2QTlcdUM3NDQgXHVEMDc0XHVCNzdDXHVDNzc0XHVDNUI4XHVEMkI4IFx1Q0VGNFx1RDNFQ1x1QjEwQ1x1RDJCOFx1Qjg1QyBcdUJDRjRcdUM3QTUgKFx1QjlBQ1x1QzU2MVx1RDJCOCBcdUMxMUNcdUJDODQgXHVDRUY0XHVEM0VDXHVCMTBDXHVEMkI4XHVBQzAwIFx1QjA5OFx1QzYyOCBcdUMyRENcdUM4MTBcdUM1RDBcdUMxMUMgXHVCQTg1XHVDMkRDXHVENTU4XHVCMjk0XHVBQzhDIFx1QjM1NCBcdUM1NDhcdUM4MDRcdUQ1NjAgXHVBQzgzIFx1QUMxOVx1QjJFNFx1QUNFMCBcdUQzMTBcdUIyRTgpXHJcbiAgICAgICAgaW50ZXJvcDogJ2F1dG8nLCAvL1x1QzY3OFx1QkQ4MCBcdUM3NThcdUM4NzRcdUMxMzFcdUFDRkNcdUM3NTggXHVCQUE4XHVCNEM4IFx1QUMwNCBcdUMwQzFcdUQ2MzggXHVDNzkxXHVDNkE5IFx1QkMyOVx1QzJERCBcdUMxMjRcdUM4MTUgKFx1QUUzMFx1QkNGOCBcdUJBQThcdUI0RENcdUM1RDBcdUMxMUMgTm9kZS5qcyBcdUIzRDlcdUM3OTEgXHVCQzI5XHVDMkREXHVDNzQ0IFx1QjUzMFx1Qjk3NFx1QkE3MCwgVHlwZVNjcmlwdFx1Qzc1OCBlc01vZHVsZUludGVyb3AgXHVCM0Q5XHVDNzkxXHVBQ0ZDIFx1QjJFNFx1Qjk3NFx1QkJDMFx1Qjg1QyBhdXRvXHVCODVDIFx1QzEyNFx1QzgxNVx1RDU1OFx1QzVFQyBFU1x1QkFBOFx1QjRDOFx1QUNGQyBDb21tb25KU1x1QkFBOFx1QjRDOCBcdUFDMDRcdUM3NTggXHVDMEMxXHVENjM4IFx1QzZCNFx1QzZBOVx1QzEzMSBcdUJCMzhcdUM4MUNcdUI5N0MgXHVDOTA0XHVDNzg0KVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59IHNhdGlzZmllcyBVc2VyQ29uZmlnKTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVCxPQUFPLFNBQVM7QUFDblUsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sV0FBVztBQUNsQixTQUFTLG9CQUFnQztBQUN6QyxPQUFPLG1CQUFtQjtBQUMxQixTQUFTLDRCQUE0QjtBQUxyQyxJQUFNLG1DQUFtQztBQVF6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQTtBQUFBLEVBRTFCLFNBQVM7QUFBQSxJQUNQLElBQUksRUFBRSxhQUFhLEtBQUssQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBLElBSXpCLGNBQWM7QUFBQTtBQUFBLElBQ2QsTUFBTSxFQUFFLFlBQVksVUFBVSxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFPakM7QUFBQTtBQUFBLEVBRUEsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLEtBQUs7QUFBQSxNQUNILE9BQU8sS0FBSyxRQUFRLGtDQUFXLGtCQUFrQjtBQUFBO0FBQUEsTUFDakQsTUFBTTtBQUFBO0FBQUEsTUFFTixTQUFTLENBQUMsTUFBTSxLQUFLO0FBQUEsTUFDckIsVUFBVSxDQUFDLFdBQVcsU0FBUyxNQUFNO0FBQUEsSUFDdkM7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxTQUFTLFdBQVc7QUFBQTtBQUFBLE1BQy9CLFFBQVE7QUFBQSxRQUNOLFNBQVM7QUFBQSxVQUNQLHFCQUFxQjtBQUFBLFlBQ25CLGlCQUFpQjtBQUFBLFlBQ2pCLFNBQVM7QUFBQSxjQUNQO0FBQUEsZ0JBQ0U7QUFBQSxnQkFDQTtBQUFBLGtCQUNFLFNBQVM7QUFBQSxrQkFDVCxhQUFhO0FBQUE7QUFBQTtBQUFBLGtCQUViLFNBQVM7QUFBQSxnQkFDWDtBQUFBLGNBQ0Y7QUFBQSxZQUNGO0FBQUEsVUFDRixDQUFDO0FBQUEsUUFFSDtBQUFBLFFBQ0EsU0FBUztBQUFBLFVBQ1AsT0FBTztBQUFBLFVBQ1AsYUFBYTtBQUFBLFFBQ2Y7QUFBQTtBQUFBLFFBQ0EsUUFBUTtBQUFBO0FBQUEsUUFDUixTQUFTO0FBQUE7QUFBQSxNQUNYO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFzQjsiLAogICJuYW1lcyI6IFtdCn0K
