import { useEffect, useMemo, useRef, useState } from 'react';
import { GPTableInstance, GPtable, isOdd ,IndeterminateCheckbox} from './lib';
import "./App.scss"

type Person = {
  firstName: string
  lastName: string
  age?: number
  subRows?: Person[]
  mycheckbox2?: boolean | any
  something?: any
}

// import { GPtable } from "./dist/index.es.js"; // 빌드된 파일의 경로로 변경해야 합니다.
// import type { GPprops } from "./dist";
// import { GPprops, GPtable, isOdd } from 'react-gptable'




function App() {

  const column = useMemo(() => {
    return [
      {
        Header:"resize,sort,ordering불가",
        accessorKey: "data_idx", //key name
        useSort: false, // default true
        useFilter:false, // default false

        enableResizing: false,// default true
        enableOrdering:false, // default true
        enableHiding: true, //default true
      
      },
      {
        Header:"가능.................",
        accessorKey: "data_idx2", //key name
      },
      {
        useSort: true, //default true
        useFilter: true, //deafault false
        enableHiding: false,// 디폴트true 
        enableResizing: true,// default true

        Header: "성", // 표시될 글자 안넣으면 accessorKey name으로 표시
        accessorKey: "firstName", //key name
        // minWidth:44, //최소 컬럼넓이
        width: 150,
        accessorFn: (row: any) => {
          return row.firstName + "@123"
        },//필터가능  //1차랜더값
        cell: (info: any) => {
          const { row, getValue } = info;
          // console.log("허허",row);
          return <div>
            {getValue() + "님"}
          </div>;
        },//필터불가 //2차랜더값
      },
      {
        Header: "이름",
        accessorKey: "lastName",
        useFilter: false,
        show: false,//default true  
      },
      {
        useSort: false,
        width: 150,
        accessorKey: "mycheckbox2",
        Header: "어떤값",
        header: ({ table }: any) => {
          return <>체크시 실제값이 바뀜 custom rendering</>
        },
        cell: ({ row }: any) => {
          return (
            <div style={{ background: "rgba(255,0,0,0.1)" }} onClick={() => {
              row.original.mycheckbox2 = !row.original.mycheckbox2;
              gptableRef?.current?.forceRerender();
            }}>
              <IndeterminateCheckbox
                {...{
                  checked: row.original.mycheckbox2 * 1 ? true : false,
                  // disabled: !row.getCanSelect(),
                  // indeterminate: row.getIsSomeSelected(),
                  onChange: () => {
                  },
                }}
              />
              {"실제바뀐값:" + row.original.mycheckbox2}
            </div>
          )
        },
      },
      {
        width:300,
        Header: "나이",
        accessorKey: "age",
        useFilter: true,
        cell: (info: any) => {
          const { row, getValue } = info;
          // console.log("허허",row);
          return <div>
            {getValue() + "살"}
          </div>;
        },//필터불가 //2차랜더값
        // width: 300,
        // Filter: SelectColumnFilter,
      },
      // {
      //   Header: "a",
      //   accessorKey: "a",
      //   useFilter: true,
      //   // width: 330,
      //   // Filter: SelectColumnFilter,
      // },
      // {
      //   Header: "b",
      //   accessorKey: "b",
      //   useFilter: true,
      //   // width: 330,
      //   // Filter: SelectColumnFilter,
      // },
      // {
      //   Header: "c",
      //   accessorKey: "c",
      //   useFilter: true,
      //   // width: 330,
      //   // Filter: SelectColumnFilter,
      // },
      // {
      //   Header: "d",
      //   accessorKey: "d",
      //   useFilter: true,
      //   // width: 330,
      //   // Filter: SelectColumnFilter,
      // }
    ];
  }, []);


  const [data, setData] = useState<Person[]>([{
    firstName: "소",
    lastName: "기영",
    age: 24,
    mycheckbox2: 1,
    something: 1,
  }, {
    firstName: "박",
    lastName: "서하",
    age: -5,
  }, {
    firstName: "류",
    lastName: "기정",
    age: 14,

  }, {
    firstName: "정",
    lastName: "연광",
    age: 3,
  }]);


  const gptableRef = useRef<GPTableInstance>(null);

  useEffect(() => {
    // console.log("gptableRef", gptableRef);
    if (gptableRef?.current) {
      const tableRef = gptableRef.current;
      // const gptable=tableRef.getTable();
      // console.log(tableRef.test(2));
      // console.log(gptable.setPageIndex(0));

    }
  }, [gptableRef])



  return (<div className="app" style={{ background: "#eee" }} >
    {/* {"isOdd사용후:" + isOdd(4)} */}
    <div>
      아래가 테이블 wrapper Size 에따른 크기
    </div>
    <br />
    <div style={{ width: '800px', display: "flex", background: "#fff" }}>

      <GPtable
        className="hoho"
        ref={gptableRef}

        data={data}
        column={column}
        
        onClickRow={(e,row,cell)=>{
          // console.log("클릭row",row);
          // console.log("클릭cell",cell);
        }}

        // tableName={"asf"}
        
        option={{
          //saveTable:"asf", //잇을때만 저장
          //저장할때는 width 순서 hide   // sort안하고
          autoSavetableName:"oppa",
          //컬럼순서 
          row:{
            selRowColor:"#fff",
            selRowBackground:"#0000cd", //1줄선택로우 배경색 default transparent         
            multipleSelRowCheckbox:true, //다중 선택row default false
          },
          column:{
            resizing:true, //모든컬럼 리사이징 가능여부 default true
            ordering:true, //모든컬럼 오더링 가능여부 default true
          },
          pagination: {
            paginationArr: [1,2, 3, 10, 50], //default 10,20,30,40
            defaultPageSize: 2,  //default = paginationArr[0]
          },
          toolbar: {
            globalfilter: true,//default false
            columnAttributeButton: true,// defaulte false,
            render: () => {
              return (<>
                <button className="btn btn-green" onClick={()=>{
                  console.log("새로고친후 체크값들 기억X")
                  setData([
                    {
                    firstName: "소",
                    lastName: "기영",
                    age: 24,
                    mycheckbox2: 1,
                    something: 1,
                  }, 
                  {
                    firstName: "박",
                    lastName: "서하",
                    age: -5,
                  }, 
                  {
                    firstName: "류",
                    lastName: "기정",
                    age: 14,
                
                  }, {
                    firstName: "정",
                    lastName: "연광",
                    age: 3,
                  }])
                }}>새로고침</button>
                {/* <button className="btn btn-orange" disabled={true}>테이블저장</button> */}
              </>)
            }
          }
        }}


      />


    </div>

  </div>)
}

export default App;
