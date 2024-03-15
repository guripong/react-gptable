import { useEffect, useMemo, useRef, useState } from 'react';
import { GPTableInstance, GPtable, isOdd } from './lib';
// import { GPTableInstance } from 'lib';
import "./App.scss"

type Person = {
  firstName: string
  lastName: string
  age?: number
  subRows?: Person[]
}

// import { GPtable } from "./dist/index.es.js"; // 빌드된 파일의 경로로 변경해야 합니다.
// import type { GPprops } from "./dist";
// import { GPprops, GPtable, isOdd } from 'react-gptable'


function App() {

  const column = useMemo(() => {
    return [
      {
        Header: "성",
        accessorKey: "firstName",
        useFilter: true,
        width: 50,
        cell: () => {
          return <div>
            asf
          </div>;
        }
      },
      {
        Header: "이름",
        accessorKey: "lastName",
        useFilter: true,
        width: 50,
        // Filter: SelectColumnFilter,
      },
      {
        Header: "나이",
        accessorKey: "age",
        useFilter: true,
        width: 50,
        // Filter: SelectColumnFilter,
      }
    ];
  }, []);

  const [data, setData] = useState<Person[]>([{
    firstName: "소",
    lastName: "기영",
    age: 24
  }, {
    firstName: "박",
    lastName: "서하",
    // age:36
  }, {
    firstName: "류",
    lastName: "기정",
    age: 14
  }]);


  const gptableRef = useRef<GPTableInstance>(null);

  useEffect(() => {
    console.log("gptableRef", gptableRef);
    if (gptableRef?.current) {
      const tableRef = gptableRef.current;
      // const gptable=tableRef.getTable();
      // console.log(tableRef.test(2));
      // console.log(gptable.setPageIndex(0));

    }
  }, [gptableRef])



  return (<div className="app">
    {/* {"isOdd사용후:" + isOdd(4)} */}
    <div>
      아래가 테이블
    </div>
    <div style={{ width: '500px', outline: "2px solid pink" }}>
      <GPtable
        ref={gptableRef}
        className="hoho"
        data={data}
        column={column}



        option={{
          globalfilter: true,//default false
          pagination: true, //default false
          paginationArr: [5, 10] //default 10,20,30,40

        }}
      />
    </div>

  </div>)
}

export default App;
