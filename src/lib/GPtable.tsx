import React, { Ref, forwardRef, useImperativeHandle, useRef } from 'react';
import { GPtableProps} from './GPprops';
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
  FilterFns,
} from '@tanstack/react-table'
import {
  RankingInfo,
  rankItem,
  compareItems,
} from '@tanstack/match-sorter-utils'

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

const GPtable = forwardRef<HTMLDivElement, GPtableProps>((props, ref) => {
  const { className,
    columns,
    data,
    defaultPageSize,
    pagination,
    defaultToolbar,
    toolbar,
    onClickRow
  } = props;

  
  const gpTableRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    ref as Ref<{
      test: (value: number) => number;
      power: () => string;
      getTableRef: () => HTMLDivElement | null; // 반환 타입 명시
    }>,
    () => ({
      test: (value: number) => {
        return value + 1;
      },
      power:()=>{
        return "power"
      },
      getTableRef:()=>{
        return gpTableRef?.current;
      }
    }),
    []
  );

  // const table = useReactTable({
  //   data,
  //   columns,
  //   filterFns: {
  //     fuzzy: fuzzyFilter,
  //   },
  //   state: {
  //     columnFilters,
  //     globalFilter,
  //   },
  //   onColumnFiltersChange: setColumnFilters,
  //   onGlobalFilterChange: setGlobalFilter,
  //   globalFilterFn: fuzzyFilter,
  //   getCoreRowModel: getCoreRowModel(),
  //   getFilteredRowModel: getFilteredRowModel(),
  //   getSortedRowModel: getSortedRowModel(),
  //   getPaginationRowModel: getPaginationRowModel(),
  //   getFacetedRowModel: getFacetedRowModel(),
  //   getFacetedUniqueValues: getFacetedUniqueValues(),
  //   getFacetedMinMaxValues: getFacetedMinMaxValues(),
  //   debugTable: true,
  //   debugHeaders: true,
  //   debugColumns: false,
  // })

  // React.useEffect(() => {
  //   if (table.getState().columnFilters[0]?.id === 'fullName') {
  //     if (table.getState().sorting[0]?.id !== 'fullName') {
  //       table.setSorting([{ id: 'fullName', desc: false }])
  //     }
  //   }
  // }, [table.getState().columnFilters[0]?.id])

  return (
    <div ref={gpTableRef} className={className}>
      안녕하세요 asf
    </div>
  );
});

export default GPtable;