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

  return typeof firstValue === 'number' ? (
    <div>
      <div className="flex space-x-2">

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
        {sortedUniqueValues.slice(0, 5000).map((value: any) => (
          <option value={value} key={value} />
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




// // A debounced input react component
// function DebouncedInput({
//   value: initialValue,
//   onChange,
//   debounce = 200,
//   ...props
// }: {
//   value: string | number
//   onChange: (value: string | number) => void
//   debounce?: number
// } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
//   const [value, setValue] = React.useState(initialValue)

//   React.useEffect(() => {
//     setValue(initialValue)
//   }, [initialValue])

//   React.useEffect(() => {
//     const timeout = setTimeout(() => {
//       onChange(value)
//     }, debounce)
//     return () => clearTimeout(timeout)
//   }, [value])

//   return (
//     <input {...props} value={value} onChange={e => setValue(e.target.value)} />
//   )
// }


const GPtable = forwardRef<GPTableInstance, GPtableProps>((props, ref) => {
  const { className,
    column: icolumn,
    data: data,
    defaultPageSize,
    defaultToolbar,
    toolbar,
    onClickRow,
    option
  } = props;

  const rerender = useReducer(() => ({}), {})[1];
  const globalfilter = option?.globalfilter || false;
  const pagination = option?.pagination || false;
  const paginationArr = (option?.paginationArr && Array.isArray(option.paginationArr)) ? option.paginationArr : [10, 20, 30, 40];



  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const gpTableRef = useRef<HTMLDivElement>(null);



  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    const newColumns=[];
    for(let i = 0 ; i<icolumn.length; i++){
      newColumns.push({
        ...icolumn[i],
        // header: () => <span>{icolumn[i].Header}</span>
      })
    }



    return [{

      id: 'firstName',
      a: 1234,
      accessorKey: 'firstName',
      accessorFn: row => row.firstName,
      cell: info => info.getValue(),
      // header: () => <span>ㅁㄴㄹ</span>,
      footer: props => props.column.id,

    },
    {
      id: 'lastName',
      accessorKey: 'lastName',
      accessorFn: row => row.lastName + "2", //값랜더1차 필터먹힘
      cell: info => info.getValue(),//값랜더2차 여기는 필터가 안댐
      header: () => <span>Last Name</span>,
      footer: props => props.column.id,
      filterFn: 'fuzzy', //default..
      sortingFn: fuzzySort, //default임..
    }];
  }, [icolumn, data])


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
    onColumnFiltersChange: setColumnFilters,
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
        return gpTableRef?.current;
      },
      getTable: () => {
        return table;
      },
      forceRerender: () => {
        rerender();
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

  return (
    <div className={`GP_table ${className}`} ref={gpTableRef} >

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
      </div>

      <table className="table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                // console.log("H",header.column.columnDef.header)
                // console.log(header.getContext())


                return (
                  <th key={header.id}
                    colSpan={header.colSpan}
                    style={{ position: 'relative', width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null : (
                        <>
                          <div style={{background:"red"}}
                            {...{
                              className: `header`,
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(header.column.columnDef.header,header.getContext())}

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
                            <div className={`sortor ${header.column.getIsSorted() as string?header.column.getIsSorted() :'nonea'}`}/>

                          </div>

                          {header.column.getCanFilter() ? (
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
                    <td key={cell.id}>
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



      아래 페이지 이동
      {pagination &&
        <>
          <div className="flex items-center gap-2">
            <button
              className="border rounded p-1"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {'<<'}
            </button>
            <button
              className="border rounded p-1"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<'}
            </button>
            <button
              className="border rounded p-1"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>'}
            </button>
            <button
              className="border rounded p-1"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {'>>'}
            </button>
            <span className="flex items-center gap-1">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </strong>
            </span>
            <span className="flex items-center gap-1">
              | Go to page:
              <input
                type="number"
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={e => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0
                  table.setPageIndex(page)
                }}
                className="border p-1 rounded w-16"
              />
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
            >
              {paginationArr.map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>


          <div>{table.getPrePaginationRowModel().rows.length} Rows</div>


        </>
      }


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