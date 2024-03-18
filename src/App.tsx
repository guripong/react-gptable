import { HTMLProps, useEffect, useMemo, useRef, useState } from 'react';
import { GPTableInstance, GPtable, isOdd } from './lib';
// import { GPTableInstance } from 'lib';
import "./App.scss"

type Person = {
  firstName: string
  lastName: string
  age?: number
  subRows?: Person[]
  mycheckbox?:any
  mycheckbox2?: boolean | any
  something?:any
}

// import { GPtable } from "./dist/index.es.js"; // 빌드된 파일의 경로로 변경해야 합니다.
// import type { GPprops } from "./dist";
// import { GPprops, GPtable, isOdd } from 'react-gptable'


function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!)

  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  )
}

function App() {

  const column = useMemo(() => {
    return [
      {
        accessorKey: "data_idx", //key name
        // show:false,
      },
      {
        useSort:true, //default true
        useFilter: true, //deafault true
        enableHiding: false,// 디폴트true 
        enableResizing:false,// default true

        Header: "성", // 표시될 글자 안넣으면 accessorKey name으로 표시
        accessorKey: "firstName", //key name
        // minWidth:44, //최소 컬럼넓이
        width: 150,

        accessorFn: (row: any) => {
          return row.firstName + "@"
        },//필터가능  //1차랜더값
        cell: (info: any) => {
          const { row, getValue } = info;
          // console.log("허허",row);
          return <div>
            {getValue() + "#"}
          </div>;
        },//필터불가 //2차랜더값
      },
      {
        Header: "이름",
        accessorKey: "lastName",
        useFilter: false,
        show:false,//default false  

        // width: 300,

        // Filter: SelectColumnFilter,
      },
      {
        useSort:false,
        width: 20,
        accessorKey: "mycheckbox",
        type: "checkbox",
        header: ({ table }: any) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }: any) => (
          <div>
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      },
      {
        useSort:false,
        width: 150,
        accessorKey: "mycheckbox2",
        Header:"어떤값",
        header: ({ table }: any) => {
          return <>체크시 실제값이 바뀜</>
        },
        cell: ({ row }: any) => {
          // console.log("horow", row.original)

          return (
            <div style={{background:"rgba(255,0,0,0.1)"}}onClick={()=>{
              row.original.mycheckbox2=!row.original.mycheckbox2;
              gptableRef?.current?.forceRerender();
            }}>
              <IndeterminateCheckbox
                {...{
                  checked: row.original.mycheckbox2*1 ? true : false,
                  // disabled: !row.getCanSelect(),
                  // indeterminate: row.getIsSomeSelected(),
                  onChange: ()=>{
       
                  },
                }}
              />
              {"실제바뀐값:"+row.original.mycheckbox2}
            </div>
          )
        }
        ,
      },

      {
        Header: "나이",
        accessorKey: "age",
        useFilter: true,
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
    something:1,
  }, {
    firstName: "박",
    lastName: "서하",
    age: -5,

    // age:36
  }, {
    firstName: "류",
    lastName: "기정",
    age: 14,
 
  }, {
    firstName: "정",
    lastName: "연광",
    age: 3,
    mycheckbox2: 0
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



  return (<div className="app">
    {/* {"isOdd사용후:" + isOdd(4)} */}
    <div>
      아래가 테이블 wrapper Size 에따른 크기
    </div>
    <br />
    <div style={{ width: '800px', outline: "2px solid pink" }}>
      <GPtable
        ref={gptableRef}
        className="hoho"
        data={data}
        column={column}


        option={{
          
          pagination: {
            paginationArr: [2, 3, 10,50], //default 10,20,30,40
            // defaultPageSize: 3,  //default = paginationArr[0]
          },
          toolbar:{
            globalfilter: true,//default false
            columnAttributeButton : true,// defaulte true,
            toolbar:()=>{
              return (<div>
                a
                </div>)
            }
          }
        }}


      />
    </div>

  </div>)
}

export default App;
