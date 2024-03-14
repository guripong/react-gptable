import { useMemo, useState } from 'react';
import { GPprops, GPtable ,isOdd} from './lib';
import { Person } from 'tempType';
// import { GPtable } from "./dist/index.es.js"; // 빌드된 파일의 경로로 변경해야 합니다.
// import type { GPprops } from "./dist";
// import { GPprops, GPtable, isOdd } from 'react-gptable'
function App() {
  const columns = useMemo(() => {
    return [
      {
        Header: "글번호",
        accessorKey: "board_idx",
        useFilter: true,
        width: 50,
      },
      {
        Header: "종류",
        accessorKey: "board_category",
        useFilter: true,
        width: 50,
        // Filter: SelectColumnFilter,
      }
    ];
  }, []);
  const [data,setData]=useState<Person[]>([]);

    return (<>
    {"isOdd사용후:"+isOdd(4)}
    <GPtable 
    
        data={[]}
        columns={columns}
    
    />
    </>)
}

export default App;
