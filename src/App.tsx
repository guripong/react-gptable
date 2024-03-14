import { GPprops, GPtable } from './lib'
// import { GPtable } from "./dist/index.es.js"; // 빌드된 파일의 경로로 변경해야 합니다.
// import type { GPprops } from "./dist";

function App() {
    // GPprops 타입의 속성을 생성합니다.
    const props: GPprops = {
        a: "Hello",
        b: 123,
        c: { a: 456, b: "World" },
    };

    return (
        <>
            사용예시
            <GPtable {...props} /> {/* GPtable 컴포넌트에 props 전달 */}
        </>
    )
}

export default App;
