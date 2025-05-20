import React, { useReducer } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GPtable, IndeterminateCheckbox } from "./lib";
import type {
  GPTableInstance,
  GPColumn,
  GPtableProps,
  GPtableOption,
} from "./lib";
import "./App.scss";

// import { GPtable } from 'react-gptable';
// import type { GPColumn, GPTableInstance } from 'react-gptable';
// import "react-gptable/dist/style.css";

// ESM
import { faker } from "@faker-js/faker";
import { sample } from "lodash";
// import { GPtableOption } from './lib/GPTableTypes';

type Person = {
  data_idx: number;
  firstName: string;
  lastName: string;
  age?: number;
  subRows?: Person[];
  mycheckbox2?: boolean | any;
  something?: any;
};

// import { GPtable } from "./dist/index.es.js"; // 빌드된 파일의 경로로 변경해야 합니다.
// import type { GPprops } from "./dist";

//  import  { GPTableInstance, GPtable,IndeterminateCheckbox,
//   GPColumn}  from 'react-gptable'

function App() {
  // const rerender = useReducer(() => ({}), {})[1];
  const [selRow, setSelRow] = useState(null);
  const column: GPColumn[] = useMemo(() => {
    let originArr: GPColumn[] = [
      {
        pKey: true,
        Header: "pKeyidx",
        accessor: "data_idx", //key name
        useSort: false, // default true
        // useFilter: true, // default false

        enableResizing: false, // default true
        enableOrdering: false, // default true
        enableHiding: true, //default true
        width: 80,
      },
      {
        Header: "가능.assggasg",
        accessor: "data_idx2", //key name
        width: 100,
        // defaultSort:"desc",
        cell: (info: any) => {
          const { row, getValue, renderValue } = info;
          // console.log("허허",row);
          return (
            <div>
              <span title={row.value}>{getValue()}</span>
            </div>
          );
        }, //필터불가 //2차랜더값
      },
      {
        useSort: true, //default true
        useFilter: true, //deafault false
        enableHiding: false, // 디폴트true
        enableResizing: true, // default true

        // Header: "성", // 표시될 글자 안넣으면 accessor name으로 표시
        accessor: "firstName", //key name
        // minWidth:44, //최소 컬럼넓이
        width: 150,
        accessorFn: (row: any) => {
          return row.firstName + "@검색가능";
        }, //필터가능  //1차랜더값
        // cell: (info: any) => {
        //   const { row, getValue } = info;
        //   // console.log("허허",row);
        //   return <div>
        //     <span title={getValue()}>
        //      {getValue() + "님"}
        //     </span>

        //   </div>;
        // },//필터불가 //2차랜더값
      },
      {
        Header: "이름",
        accessor: "lastName",
        useFilter: false,
        show: false, //default true
      },
      // {
      //   useSort: false,
      //   width: 150,
      //   accessor: "mycheckbox2",
      //   Header: "어떤값",
      //   header: ({ table }: any) => {
      //     return <>체크시 실제값이 바뀜 custom rendering</>
      //   },
      //   cell: ({ row }: any) => {
      //     return (
      //       <div style={{ background: "rgba(255,0,0,0.1)" }} onClick={() => {
      //         row.original.mycheckbox2 = !row.original.mycheckbox2;
      //         gptableRef?.current?.forceRerender();
      //       }}>
      //         <IndeterminateCheckbox
      //           {...{
      //             checked: row.original.mycheckbox2 * 1 ? true : false,
      //             // disabled: !row.getCanSelect(),
      //             // indeterminate: row.getIsSomeSelected(),
      //             onChange: () => {
      //             },
      //           }}
      //         />
      //         {"실제바뀐값:" + row.original.mycheckbox2}
      //       </div>
      //     )
      //   },
      // },
      {
        width: 300,
        Header: "나이",
        accessor: "age",
        useFilter: true,
        // filterValue:[undefined,"0"],
        cell: (info: any) => {
          const { row, getValue } = info;
          // console.log("허허",row);
          return <div>{getValue() + "살"}</div>;
        }, //필터불가 //2차랜더값
        // width: 300,
        // Filter: SelectColumnFilter,
      },
    ];

    // originArr = loadTable(originArr,"oppa");

    return originArr;
  }, []);

  const [data, setData] = useState<Person[]>(() => {
    function createRandomUser() {
      return {
        data_idx: faker.number.int(),
        firstName: faker.internet.userName(),
        lastName: faker.internet.userName(),
        age: faker.number.int({ min: 5, max: 40 }),
      };
    }
    let d: Person[] = faker.helpers.multiple(createRandomUser, {
      count: 5000,
    });
    // console.log("d",d)

    return [
      {
        data_idx: 1,
        firstName: "소1111111111111111111111111",
        lastName: "기영",
        age: 24,
        mycheckbox2: 1,
        something: 1,
      },
      {
        data_idx: 2,
        firstName: "박",
        lastName: "서하",
        age: -5,
      },
      {
        data_idx: 3,
        firstName: "류",
        lastName: "기정",
        age: 14,
      },
      {
        data_idx: 4,
        firstName: "정",
        lastName: "연광",
        age: 3,
      },
      ...d,
    ];
  });

  const gptableRef = useRef<GPTableInstance>(null);
  const gptableRef2 = useRef<GPTableInstance>(null);

  const refreshdata = useCallback(() => {
    // console.log("새로고친후 체크값들 기억X")
    gptableRef.current?.setLoading(true);
    setTimeout(function () {
      gptableRef.current?.setLoading(false);
      setData([
        {
          data_idx: 2,
          firstName: "박",
          lastName: "서하",
          age: -5,
        },
        {
          data_idx: 3,
          firstName: "류",
          lastName: "기정",
          age: 14,
        },
        {
          data_idx: 4,
          firstName: "정",
          lastName: "연광",
          age: 3,
        },
        {
          data_idx: 1,
          firstName: "소",
          lastName: "기광",
          age: 3,
        },
      ]);
    }, 600);
  }, []);

  const setCustomFilter = useCallback(() => {
    let res = gptableRef.current?.set_customFilter("age", ["", "5"]);
    console.log("res", res);
    // let res2=gptableRef.current?.set_customFilter("firstName",'소');
  }, []);

  const handleOnCheckRow = useCallback((rows: Person[]) => {
    console.log("허허허rows", rows);
  }, []);

  // console.log("랜더")
  const tableOption = useMemo<GPtableOption>(() => {
    return {
      //saveTable:"asf", //잇을때만 저장
      //저장할때는 width 순서 hide   // sort안하고
      autoSavetableName: "oppa", //필터값 기억한다
      //컬럼순서
      row: {
        rememberSelRow: true, //default true //한줄선택 기억 pKey가 있다면
        selRowColor: "#666",
        selRowBackground: "rgba(255,0,0,.1)", //1줄선택로우 배경색 default transparent
        hoverRowColor: "#fff",
        hoverRowBackground: "red",
        multipleSelRowCheckbox: true, //다중 선택row default false
      },
      column: {
        resizing: true, //모든컬럼 리사이징 가능여부 default true
        ordering: true, //모든컬럼 오더링 가능여부 default true
      },
      pagination: {
        paginationArr: [1, 2, 3, 10, 50], //default 10,20,30,40
        // defaultPageSize: 2,  //default = paginationArr[0]
      },
      toolbar: {
        globalfilter: true, //default false
        columnAttributeButton: true, // defaulte false,
        saveExcelButton: true, //default false,
      },
    };
  }, [refreshdata, setCustomFilter]);

  return (
    <div className="app" style={{ background: "#eee" }}>
      <div>
        <button onClick={async()=>{
          // gptableRef.current?.setSelectRowAndMovePage({key:"data_idx",value:4});

          await gptableRef.current?.whenReady();
          gptableRef.current?.setSelectRowAndMovePage({key:"age",value:24});

        }}>강제로 pKey_idx4번 고르기</button>
      </div>
      <div style={{ width: "800px", display: "flex", background: "#fff" }}>
        {/* 1번테이블 */}
        <GPtable
          className="hoho"
          ref={gptableRef}
          data={data}
          column={column}
          onCheckRow={handleOnCheckRow}
          onClickRow={(e, row, cell) => {
            // console.log("클릭row",row);
            // console.log("클릭cell",cell);
            setSelRow(row);
          }}
          //새로고침시 체크 됨 날라가고 pkey

          //한줄고른거 안날라가고 pkey값이 있으면 해당 page로 이동한다
          //필터값 기억한다 default

          option={tableOption}
          toolbar={() => {
            return (
              <>
                <button
                  className="btn"
                  disabled={selRow ? true : false}
                  onClick={() => {
                    gptableRef?.current?.removeSelectedMultipleRows();
                  }}
                >
                  제거 checkmultipleRows
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    let rows = gptableRef?.current?.getSelectedMultipleRows();
                    console.log("rows", rows);
                  }}
                >
                  선택checkRows 조회
                </button>
                <button className="btn btn-green" onClick={refreshdata}>
                  새로고침
                </button>
                <button className="btn btn-red" onClick={setCustomFilter}>
                  나이 max5 필터 걸기
                </button>
                {/* <button className="btn btn-orange" disabled={true}>테이블저장</button> */}
              </>
            );
          }}
        />



      </div>

    </div>
  );
}

export default App;
