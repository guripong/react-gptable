import React, { Ref, RefAttributes, forwardRef, useImperativeHandle, useMemo, useReducer, useRef, useState } from 'react';
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
import { DebouncedInput } from './components/DebouncedInput';
import Dropdown from './components/DropDown';
//https://codesandbox.io/p/devbox/github/tanstack/table/tree/main/examples/react/filters?embed=1&file=%2Fsrc%2Fmain.tsx%3A72%2C2-178%2C1&theme=light

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
  console.log("firstValue", firstValue)

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
        {sortedUniqueValues.slice(0, 5000).map((value: any, index) => (
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
    // toolbar,
    onClickRow,
    option
  } = props;

  const rerender = useReducer(() => ({}), {})[1];
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
        /*
            table.setColumnOrder(
              faker.helpers.shuffle(table.getAllLeafColumns().map(d => d.id))
            )
        */
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
  const columnAttributeBtnRef = useRef(null);

  const [columnAttributePopup, set_columnAttributePopup] = useState(false);
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
              placeholder=" 모든컬럼검색"
            />
          </div>
        }

        <button className="btn" ref={columnAttributeBtnRef} onClick={() => {
          set_columnAttributePopup(d => !d);
        }} >config</button>
        
        <Dropdown buttonRef={columnAttributeBtnRef} show={columnAttributePopup} 
          onClose={()=>{
            set_columnAttributePopup(false);
        }}>
          {columnAttributePopup &&
            <div className="columnAttribute" >
              <div className="onecheckColumn">
                <label>
                  <input
                    {...{
                      type: 'checkbox',
                      checked: table.getIsAllColumnsVisible(),
                      onChange: table.getToggleAllColumnsVisibilityHandler(),
                    }}
                  />{' '}
                  전체토글
                </label>
              </div>
              {table.getAllLeafColumns().map(column => {
                // console.log("column", column)
                // column.setFilterValue("소")
                const CD: any = column.columnDef;
                const string = CD.Header ? CD.Header : column.id;
                return (
                  <div key={column.id} className="onecheckColumn">
                    <label>
                      <input
                        {...{
                          type: 'checkbox',
                          checked: column.getIsVisible(),
                          onChange: column.getToggleVisibilityHandler(),
                          disabled: !CD.enableHiding
                        }}
                      />{' '}
                      {string}
                    </label>
                  </div>)
              })}

            </div>
          }
        </Dropdown>

        {/* 
        {columnAttributePopup &&
          <div className="columnAttribute" >

            <div className="onecheckColumn">
              <label>
                <input
                  {...{
                    type: 'checkbox',
                    checked: table.getIsAllColumnsVisible(),
                    onChange: table.getToggleAllColumnsVisibilityHandler(),
                  }}
                />{' '}
                전체토글
              </label>
            </div>
            {table.getAllLeafColumns().map(column => {
              // console.log("column", column)
              // column.setFilterValue("소")
              const CD: any = column.columnDef;
              const string = CD.Header ? CD.Header : column.id;
              return (
                <div key={column.id} className="onecheckColumn">
                  <label>
                    <input
                      {...{
                        type: 'checkbox',
                        checked: column.getIsVisible(),
                        onChange: column.getToggleVisibilityHandler(),
                        disabled: !CD.enableHiding
                      }}
                    />{' '}
                    {string}
                  </label>
                </div>)
            })}

          </div>
        } */}
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



      <div>{table.getPrePaginationRowModel().rows.length} Rows</div>





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