import React, { Ref, RefAttributes, forwardRef, useCallback, useImperativeHandle, useMemo, useReducer, useRef, useState } from 'react';
import { GPTableInstance, GPtableProps } from './GPprops';
import {
  Column,
  Table,
  useReactTable,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  sortingFns,
  getSortedRowModel,
  FilterFn,
  SortingFn,
  ColumnDef,
  flexRender,
  // FilterFns,
} from '@tanstack/react-table'

import {
  RankingInfo,
  rankItem,
  compareItems,
} from '@tanstack/match-sorter-utils'
import "./GPtable.scss";

import DebouncedInput from './components/DebouncedInput/DebouncedInput';
import Dropdown from './components/DropDown/DropDown';
import BounceCheckBox from './components/BounceCheckbox/BounceCheckBox';
import SVGBTN from './svg/SVGBTN';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank,
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!
    )
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir
}


function Filter({
  column,
  table,
}: {
  column: Column<any, unknown>
  table: Table<any>
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  const sortedUniqueValues = React.useMemo(
    () =>
      typeof firstValue === 'number'
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  )
  // console.log("firstValue", firstValue)

  return typeof firstValue === 'number' ? (
    <div>
      <div className="numberFilter">

        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={value =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min ${column.getFacetedMinMaxValues()?.[0]
            ? `(${column.getFacetedMinMaxValues()?.[0]})`
            : ''
            }`}
          className="gp_input"
        />
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={value =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max ${column.getFacetedMinMaxValues()?.[1]
            ? `(${column.getFacetedMinMaxValues()?.[1]})`
            : ''
            }`}
          className="gp_input"
        />
      </div>

    </div>
  ) : (
    <>
      <datalist id={column.id + 'list'}>
        {sortedUniqueValues.slice(0, 100).map((value: any, index) => (
          <option value={value} key={value + `_${index}`} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={value => column.setFilterValue(value)}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        className="gp_input"
        list={column.id + 'list'}
      />
    </>
  )
}




const GPtable = forwardRef<GPTableInstance, GPtableProps>((props, ref) => {
  const { className,
    column: icolumn,
    data: data,
    // defaultPageSize,
    // defaultToolbar,
    onClickRow,
    option,

  } = props;

  const rerender = useReducer(() => ({}), {})[1];
  const toolbarRender = option?.toolbar?.render || null;
  const globalfilter = option?.toolbar?.globalfilter || false;
  const pagination = option?.pagination || null;
  const paginationArr = (pagination?.paginationArr && Array.isArray(pagination.paginationArr)) ? pagination.paginationArr : [10, 20, 30, 40];
  const defaultPageSize = Number.isInteger(pagination?.defaultPageSize) ? pagination?.defaultPageSize : paginationArr[0];


  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const gpTableWrapRef = useRef<HTMLDivElement>(null);



  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    // const columns = useMemo<any[]>(() => {
    const newColumns = [];


    for (let i = 0; i < icolumn.length; i++) {
      const oneColumn: any = icolumn[i];

      let obj: any = {
        ...icolumn[i],
        enableHiding: true,
        // minSize:5000
        // cell: info => info.getValue()
        // footer: props => props.column.id
        // footer: props => props.column.id,
      }
      // if(icolumn[i].cell){
      //   obj.cell=icolumn[i].cell ;
      // }
      if (oneColumn.checkbox) {

      }
      if (oneColumn.Header) {
        obj.header = (() => oneColumn.Header);
      }
      if (oneColumn.header) {
        obj.header = oneColumn.header;
      }
      if (oneColumn.width) {
        obj.size = oneColumn.width;
      }
      if (oneColumn.minWidth) {
        obj.minSize = oneColumn.minWidth;
      }

      obj.enableHiding = oneColumn.enableHiding !== undefined ? oneColumn.enableHiding : true
      // if(obj.accessorKey){
      //   obj.id = obj.accessorKey;
      // }
      // cell: info => info.getValue()

      newColumns.push(obj)
    }

    // console.log("newColumns", newColumns)
    return newColumns;
    /*
    return [{

      // id: 'firstName',
      // a: 1234,
      accessorKey: 'firstName',
      accessorFn: row => row.firstName, //default
      cell: info => info.getValue(), //default
      // header: () => <span>ㅁㄴㄹ</span>,
      // footer: props => props.column.id,

    },
    {
      // id: 'lastName',
      accessorKey: 'lastName',
      accessorFn: row => row.lastName + "2", //값랜더1차 필터먹힘
      cell: info => info.getValue(),//값랜더2차 여기는 필터가 안댐
      header: () => <span>Last Name</span>,
      // footer: props => props.column.id,
      filterFn: 'fuzzy', //default..
      sortingFn: fuzzySort, //default임..
    }];
    */
  }, [icolumn, data])
  // console.log("columns", columns)

  const initColumVisibility = useMemo(() => {
    let obj: any = {
    };
    for (let i = 0; i < icolumn.length; i++) {
      const oneColumn: any = icolumn[i];
      // console.log("oneColumn",oneColumn)
      if (oneColumn.show === false) {
        obj[oneColumn.accessorKey] = false;
      }
      else {
        obj[oneColumn.accessorKey] = true;
      }
    }
    return obj;
  }, [icolumn])


  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: pagination ? defaultPageSize : data.length,
        pageIndex: 0,
      },

      // columnOrder: ['age', 'firstName', 'lastName'], //customize the initial column order
      columnVisibility: initColumVisibility,
      // expanded: true, //expand all rows by default
      sorting: [
        {
          id: 'age',
          desc: true //sort by age in descending order by default
        }
      ]
      // pagination:false,
      // pageIndex:0,
      // PaginationTableState :{
      //   pageSize:pagination === false ?
      //   (data.length ? (data.length < 5 ? 5 : data.length) : 5)
      //   :
      //   defaultPageSize ? defaultPageSize : 5,
      // }
      // hiddenColumns:((=>{
      // }))


    },
    onColumnFiltersChange: setColumnFilters,
    // onPaginationChange:
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
  });


  useImperativeHandle(ref, () => {
    return {
      test: (value: number) => {
        return value + 1;
      },
      power: () => {
        return "power"
      },
      getGPtableElementRef: () => {
        return gpTableWrapRef?.current;
      },
      getTable: () => {
        return table;
      },
      forceRerender: () => {
        rerender();
      },
      set_columnOrder: (newOrder) => {
        table.setColumnOrder(newOrder);
      },
      get_columnOrder: () => {
        return table.getAllLeafColumns();
      }
    }
  }, [table]);

  // React.useEffect(() => {
  //   if (table.getState().columnFilters[0]?.id === 'fullName') {
  //     if (table.getState().sorting[0]?.id !== 'fullName') {
  //       table.setSorting([{ id: 'fullName', desc: false }])
  //     }
  //   }
  // }, [table.getState().columnFilters[0]?.id])
  // console.log("table.getTotalSize()", table.getTotalSize())

  const [showColumnAttribute, set_showColumnAttribute] = useState(false);

  const rearrangeColumns = useCallback((targetId: string, direction: string) => {
    const allColumns = table.getAllLeafColumns();
    // console.log("allColumns",allColumns)
    const idArr = allColumns.map(d => d.id);
    const newOrder = [...idArr]; // 현재 컬럼 순서를 복사하여 새로운 배열 생성
    // console.log("idArr",idArr2);
    const targetIndex = newOrder.indexOf(targetId);
    let ischanged: boolean = false;
    if (direction === "up" && newOrder[targetIndex - 1]) {
      // "up" 버튼을 누르고 현재 인덱스가 0보다 크면
      const temp = newOrder[targetIndex - 1];
      newOrder[targetIndex - 1] = newOrder[targetIndex];
      newOrder[targetIndex] = temp;
      ischanged = true;
    } else if (direction === "down" && newOrder[targetIndex + 1]) {
      // "down" 버튼을 누르고 현재 인덱스가 배열의 마지막 인덱스가 아니면
      const temp = newOrder[targetIndex + 1];
      newOrder[targetIndex + 1] = newOrder[targetIndex];
      newOrder[targetIndex] = temp;
      ischanged = true;
    }
    if (ischanged) {
      table.setColumnOrder(newOrder);
    }

  }, [table]);

  return (
    <div className={`GP_table ${className}`} ref={gpTableWrapRef} >

      {/* 툴바 */}
      <div className="tableToolbar">
        {globalfilter &&
          <div className="global-filter">
            <DebouncedInput
              // style={{
              //    width:300
              // }}
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              className="gp_input"
              placeholder={`${table.getPrePaginationRowModel().rows.length}rows 전체검색`}
            />
          </div>
        }
        {toolbarRender && toolbarRender()}

        <Dropdown
          // maxHeight="400px"
          defaultShow={showColumnAttribute}
          close={() => set_showColumnAttribute(false)}
          triangleStyle={{ right: "40px" }}
          btnRender={() => {
            return (<><button className="btn" onClick={() => set_showColumnAttribute(true)}>
              <svg version="1.1" style={{
                height: '50%', transition: 'transform .3s ease-in-out',
                transform: showColumnAttribute ? 'rotate(90deg)' : ''
              }}
                viewBox="0 0 512 512" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                fill="currentColor">
                <path d="M424.5,216.5h-15.2c-12.4,0-22.8-10.7-22.8-23.4c0-6.4,2.7-12.2,7.5-16.5l9.8-9.6c9.7-9.6,9.7-25.3,0-34.9l-22.3-22.1 
                                c-4.4-4.4-10.9-7-17.5-7c-6.6,0-13,2.6-17.5,7l-9.4,9.4c-4.5,5-10.5,7.7-17,7.7c-12.8,0-23.5-10.4-23.5-22.7V89.1  c0-13.5-10.9-25.1-24.5-25.1h-30.4c-13.6,0-24.4,11.5-24.4,25.1v15.2c0,12.3-10.7,22.7-23.5,22.7c-6.4,0-12.3-2.7-16.6-7.4l-9.7-9.6  c-4.4-4.5-10.9-7-17.5-7s-13,2.6-17.5,7L110,132c-9.6,9.6-9.6,25.3,0,34.8l9.4,9.4c5,4.5,7.8,10.5,7.8,16.9  c0,12.8-10.4,23.4-22.8,23.4H89.2c-13.7,0-25.2,10.7-25.2,24.3V256v15.2c0,13.5,11.5,24.3,25.2,24.3h15.2  c12.4,0,22.8,10.7,22.8,23.4c0,6.4-2.8,12.4-7.8,16.9l-9.4,9.3c-9.6,9.6-9.6,25.3,0,34.8l22.3,22.2c4.4,4.5,10.9,7,17.5,7  c6.6,0,13-2.6,17.5-7l9.7-9.6c4.2-4.7,10.2-7.4,16.6-7.4c12.8,0,23.5,10.4,23.5,22.7v15.2c0,13.5,10.8,25.1,24.5,25.1h30.4  c13.6,0,24.4-11.5,24.4-25.1v-15.2c0-12.3,10.7-22.7,23.5-22.7c6.4,0,12.4,2.8,17,7.7l9.4,9.4c4.5,4.4,10.9,7,17.5,7  c6.6,0,13-2.6,17.5-7l22.3-22.2c9.6-9.6,9.6-25.3,0-34.9l-9.8-9.6c-4.8-4.3-7.5-10.2-7.5-16.5c0-12.8,10.4-23.4,22.8-23.4h15.2  c13.6,0,23.3-10.7,23.3-24.3V256v-15.2C447.8,227.2,438.1,216.5,424.5,216.5z M336.8,256L336.8,256c0,44.1-35.7,80-80,80  c-44.3,0-80-35.9-80-80l0,0l0,0c0-44.1,35.7-80,80-80C301.1,176,336.8,211.9,336.8,256L336.8,256z"/>
              </svg>컬럼속성
            </button></>)
          }}
        >
          {
            showColumnAttribute &&
            <div className="columnAttribute" >
              <div className="onecheckColumn">
                <BounceCheckBox
                  {...{
                    checked: table.getIsAllColumnsVisible(),
                    onChange: table.getToggleAllColumnsVisibilityHandler(),
                    label: "전체토글"
                  }}
                />
              </div>
              {table.getAllLeafColumns().map(column => {
                // console.log("column", column)

                // console.log("allColumns",allColumns)
                // column.setFilterValue("소")
                const CD: any = column.columnDef;
                const string = CD.Header ? CD.Header : column.id;
                const targetID = column.id;


                return (
                  <div key={column.id} className="onecheckColumn">
                    <BounceCheckBox
                      {...{
                        checked: column.getIsVisible(),
                        onChange: column.getToggleVisibilityHandler(),
                        disabled: !CD.enableHiding,
                        label: string
                      }}
                    />
                    <div>
                      <SVGBTN
                        direction="up"
                        onClick={() => {
                          rearrangeColumns(targetID, "up");

                        }} />
                      <SVGBTN
                        direction="down"
                        onClick={() => {
                          rearrangeColumns(targetID, "down");
                        }} />
                    </div>
                  </div>)
              })}
            </div>
          }
        </Dropdown>
      </div>
      {/* 툴바끝 */}





      {/* 실제테이블 */}
      <div className="tableWrap">
        <table className="table"
          style={{
            width: table.getTotalSize(),
            minWidth: "100%"
          }}
        >
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  // console.log("H",header.column.columnDef.header)
                  // console.log(header.getContext())
                  // console.log("header", header)
                  // console.log("header.column", header.column.columnDef)
                  const columnDef: any = header.column.columnDef;
                  // const size = header.getSize();
                  // console.log("size", size);
                  // header.
                  return (
                    <th key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() === Number.MAX_SAFE_INTEGER ? "auto" : header.getSize() }}
                    >

                      {header.isPlaceholder
                        ? null : (
                          <>
                            <div {...{
                              className: `header`,
                              onClick: columnDef?.useSort === false ? () => { } : header.column.getToggleSortingHandler(),
                            }}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}

                              {/* 리사이즈 */}
                              {header.column.getCanResize() && (
                                <div
                                  onMouseDown={header.getResizeHandler()}
                                  onTouchStart={header.getResizeHandler()}
                                  className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''
                                    }`}
                                ></div>
                              )}

                              {/* 소트 */}
                              <div className={`${columnDef?.useSort === false ? "" : "sortor"} ${header.column.getIsSorted() as string ? header.column.getIsSorted() : ''}`} />

                            </div>


                            {/* 필터 */}
                            {columnDef?.useFilter && header.column.getCanFilter() ? (
                              <div className="filterWrap">
                                <Filter column={header.column} table={table} />
                              </div>
                            ) : null}
                          </>
                        )}


                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>


          {/* 여긴고정 바꾸지말것 */}
          <tbody>
            {table.getRowModel().rows.map(row => {

              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td key={cell.id}
                        style={{
                          // width: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>




      {/* pagination */}
      {pagination &&

        <div className="pagination">

          <button
            className="prev"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <div className="middle">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              Page&nbsp;
              <input
                className="nowPage"
                type="number"
                max={table.getPageCount() || undefined}
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={e => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0
                  table.setPageIndex(page)
                }}
              />
              &nbsp;of&nbsp;{table.getPageCount()}
            </div>

            <div style={{ marginLeft: '10%' }}>
              <select
                className="viewRows"
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                }}
              >
                {paginationArr.map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize} rows
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="next"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>



        </div>

      }



      {/* <div>{table.getPrePaginationRowModel().rows.length} Rows</div> */}

      {/* <div>
          <button onClick={() => rerender()}>Force Rerender</button>
        </div>

        <div>
          <button onClick={() => { }}>Refresh Data</button>
        </div> */}

      {/* <pre>{JSON.stringify(table.getState(), null, 2)}</pre> */}
    </div>


  );
});

export default GPtable;