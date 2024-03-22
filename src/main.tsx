import React from "react";
import ReactDOM from "react-dom/client";

// import {GPtable} from "./dist/index.es.js"; // 빌드된 파일의 경로로 변경해야 합니다.
import App from './App'
// import {GPtable} from "./lib";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
        <App />
  // </React.StrictMode>
);
