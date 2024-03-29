import React, { CSSProperties, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useReducer, useRef, useState } from 'react';
import { GPColumn, GPTableInstance, GPtableProps } from './GPTableTypes';
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
  Header,
  Cell,
  CellContext,
  ColumnSort,
  PaginationState,
  RowSelectionState,
  // FilterFns,
} from '@tanstack/react-table'

import {
  RankingInfo,
  rankItem,
  compareItems,
} from '@tanstack/match-sorter-utils'

import "./GPtable.scss";

import DebouncedInput from './components/DebouncedInput/DebouncedInput';


//dnd 사용예시
//https://codesandbox.io/p/devbox/github/tanstack/table/tree/main/examples/react/column-dnd?embed=1&file=%2Fsrc%2Fmain.tsx%3A138%2C4&theme=light

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'

import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
// needed for row & cell level scope DnD setup
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import IndeterminateCheckbox from './components/IndeterminateCheckbox/IndeterminateCheckbox';

import _ from "lodash";
import { fuzzyFilter } from './filters/filter';
import { loadTable } from './utils/loadTable';
import Loading from './components/Loading/Loading';
import GPtableToolbar from './toolbar/GPtableToolbar';



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
        ~
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




/**
    * Gptable props 설명
    * @param className 클레스내임
    * @param ref 테이블의 인스턴스 참조
    * @param data 테이블에 표시할 데이터
    * @param column 테이블의 컬럼 정의
    * @param onClickRow 테이블 행을 클릭했을 때 실행되는 핸들러 함수
    * @param option 테이블에 대한 옵션 설정
    * @see {@link GPtableProps}
*/
const GPtable = forwardRef<GPTableInstance, GPtableProps<any>>((props, ref) => {
  const { className,
    column: beforeload_column = [{
      Header: "column1",
      accessorKey: "column1",
      // useFilter: true,
    }, {
      Header: "column2",
      accessorKey: "column2",
      // useFilter: true,
    }],
    data: data = [],
    onClickRow,
    option: userOptions = undefined,
  } = props;

  const [beforeload_column_initial] = useState<GPColumn[]>(JSON.parse(JSON.stringify(beforeload_column)));
  const rerender = useReducer(() => ({}), {})[1];
  const [loading, set_loading] = useState<boolean>(false);


  const {
    //툴바 옵션들
    globalfilter, columnAttributeButton, toolbarRender, saveExcelButton,
    //pagination 옵션들
    usePagination, paginationArr, defaultPageSize,
    //column 옵션들
    enableResizingColumn, enableOrderingColumn,
    //row 옵션
    rememberSelRow, selRowBackground, selRowColor, multipleSelRowCheckbox,
    //테이블 자동저장옵션
    autoSavetableName
  } = useMemo(() => {

    const defaultOptions = {
      autoSavetableName: null,
      row: {
        rememberSelRow: true,
        selRowColor: "#000",
        selRowBackground: "#fff",
        multipleSelRowCheckbox: false,
      },
      column: {
        resizing: true,
        ordering: true,
      },
      pagination: null,
      toolbar: {
        globalfilter: false,
        columnAttributeButton: false,
        saveExcelButton:false,
        render: null,
      }
    };

    const option = {
      ...defaultOptions,
      ...userOptions
    };

    const globalfilter = option?.toolbar?.globalfilter;
    const columnAttributeButton = option?.toolbar?.columnAttributeButton;
    const toolbarRender = option?.toolbar?.render;
    const saveExcelButton = option?.toolbar?.saveExcelButton;

    const usePagination = option?.pagination || null;
    const paginationArr = (usePagination?.paginationArr && Array.isArray(usePagination.paginationArr)) ? usePagination.paginationArr : [10, 20, 30, 40];
    const defaultPageSize = Number.isInteger(usePagination?.defaultPageSize) ? usePagination?.defaultPageSize : paginationArr[0];
   
    const enableResizingColumn = option?.column?.resizing ?? true;
    const enableOrderingColumn = option?.column?.ordering ?? true;

    const rememberSelRow = option.row.rememberSelRow;
    const selRowBackground = option.row?.selRowBackground ?? "#fff";
    const selRowColor = option.row?.selRowColor ?? "#000";
   
    const multipleSelRowCheckbox = option.row.multipleSelRowCheckbox ?? false;
    
    const autoSavetableName = option.autoSavetableName;

    return {
      globalfilter,
      columnAttributeButton,
      toolbarRender,
      usePagination,
      paginationArr,
      defaultPageSize,
      enableResizingColumn,
      enableOrderingColumn,
      rememberSelRow,
      selRowBackground,
      selRowColor,
      multipleSelRowCheckbox,
      autoSavetableName,
      saveExcelButton
    };
  }, [userOptions]);

  const gpTableWrapRef = useRef<HTMLDivElement>(null);



  // console.log("rowSelection",rowSelection)

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageSize: usePagination ? defaultPageSize ?? 10 : data.length,
    pageIndex: 0,
  })




  const [globalFilter, setGlobalFilter] = useState<any>('');

  const [columnOrder, setColumnOrder] = React.useState<string[]>([])
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const [sorting, setSorting] = useState<ColumnSort[]>([]);
  //sort remember
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // console.log("sorting",sorting);
  // console.log("columnFilters", columnFilters)

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedRow, setSelectedRow] = useState(null); //한줄


  // console.log("selectedRows",selectedRows)


  const icolumn = useMemo<GPColumn[]>(() => {
    let newLoadedColumn: GPColumn[] = beforeload_column;

    if (autoSavetableName) {
      try {
        const {columns,pageSize} = loadTable(beforeload_column, autoSavetableName);
        newLoadedColumn=columns;
        setPagination((prev:any)=>{
          return{
            ...prev,
            pageSize:pageSize
          }
        })
      }
      catch (err) {
        console.error("table loading실패", err);
        localStorage.removeItem(autoSavetableName);
      }
    }
    return newLoadedColumn;
  }, [beforeload_column, autoSavetableName]);

  const pKey = useMemo(() => {
    for (let i = 0; i < icolumn.length; i++) {
      if (icolumn[i].pKey) {
        return icolumn[i].accessorKey;
      }
    }
    return null;
  }, [icolumn])



  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    // const columns = useMemo<any[]>(() => {

    const newColumns = [];
    if (multipleSelRowCheckbox) {
      newColumns.push({
        Header: "다중선택",
        useFilter: false, //default false
        useSort: false, // default true
        enableHiding: false,// 디폴트true 
        enableResizing: false,// default true
        enableOrdering: false, //default true
        size: 20,
        accessorKey: "multipleSelRowCheckbox",
        header: ({ table }: any) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }: any) => {

          return (<div style={{ width: "100%", display: "flex", justifyContent: "center", alignContent: "center" }}>
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            /></div>
          )
        },
      })
    }

    for (let i = 0; i < icolumn.length; i++) {
      const oneColumn: any = icolumn[i];
      let obj: any = {
        ...icolumn[i],
        enableHiding: true,
      }
      // if(icolumn[i].cell){
      //   obj.cell=icolumn[i].cell ;
      // }
      if (oneColumn.sorting) {
        setSorting(oneColumn.sorting);
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
      newColumns.push(obj);

    }

    const order = newColumns.map(d => d.accessorKey);
    setColumnOrder(order)
    return newColumns;
  }, [icolumn, multipleSelRowCheckbox])

  const initColumnVisibility = useMemo<Record<string, boolean>>(() => {
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
    if (multipleSelRowCheckbox) {
      obj.multipleSelRowCheckbox = true;
    }
    setColumnVisibility(obj);
    return obj;
  }, [icolumn, multipleSelRowCheckbox])

  const initColumnSizing = useMemo<Record<string, number>>(() => {
    let obj: any = {
    };
    for (let i = 0; i < icolumn.length; i++) {
      const oneColumn: any = icolumn[i];
      // console.log("oneColumn",oneColumn)
      if (oneColumn.width) {
        obj[oneColumn.accessorKey] = oneColumn.width;

      }
      else {
        obj[oneColumn.accessorKey] = 150;
      }
    }
    if (multipleSelRowCheckbox) {
      obj.multipleSelRowCheckbox = 20;
    }
    setColumnSizing(obj);
    return obj;
  }, [icolumn, multipleSelRowCheckbox])

  const initColumnFilter = useMemo<ColumnFiltersState>(() => {
    let filterArr = [];
    for (let i = 0; i < icolumn.length; i++) {
      if (icolumn[i].filterValue) {
        filterArr.push({
          id: icolumn[i].accessorKey,
          value: icolumn[i].filterValue
        })
      }
    }
    // console.log("filterArr",filterArr)
    setColumnFilters(filterArr);
    return filterArr;
  }, [icolumn])

  const table = useReactTable({
    data,
    
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    autoResetAll: false,
    defaultColumn: {
      // size:300,
      minSize: 50,
      // maxSize:500,
    },
    state: {
      columnFilters,
      globalFilter,
      columnOrder,
      columnVisibility,
      columnSizing,
      sorting,
      pagination: pagination,
      rowSelection,

    },

    initialState: {
      // pagination: {
      //   pageSize: usePagination ? defaultPageSize : data.length,
      //   pageIndex: 0,
      // },
      columnSizing: initColumnSizing,
      columnFilters: initColumnFilter,
      // columnOrder: ['age', 'firstName', 'lastName'], //customize the initial column order
      columnVisibility: initColumnVisibility,
      // expanded: true, //expand all rows by default

      // sorting: [
      //   {
      //     id: 'age',
      //     desc: true //sort by age in descending order by default
      //   }
      // ]
    },
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting, //컬럼소팅
    onColumnSizingChange: setColumnSizing, //컬럼크기
    onColumnVisibilityChange: setColumnVisibility, //컬럼visible
    onColumnOrderChange: setColumnOrder, //컬럼순서바뀜
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

  const getMultipleSelectRowsOrginal=useCallback(()=>{
    const prevSelectedRows = Object.keys(rowSelection).map(
      (key) =>
        table.getSelectedRowModel().rowsById[key]?.original || []
    )
    return prevSelectedRows;
  },[rowSelection,table]);


  // console.log("rows",rows)
  //저장할때 pagination
  //굉장히 어려운부분
  //data 변경시 pagination과, row selection변경
  useEffect(() => {
    // console.log("pagination 값 초기화")
    // console.log("바뀐data", data)
    function selectedRowsDone(){
      return new Promise(function(resolve){
        setSelectedRow((prevSelectedOneRow) => {
          if (rememberSelRow && pKey && prevSelectedOneRow) {
            // console.log("prevSelectedOneRow",prevSelectedOneRow);
            // console.log("pKey",pKey)
            const remember_dataidx = prevSelectedOneRow[pKey];
            // console.log("remember_dataidx",remember_dataidx)
            const isfind = data.find(d => d[pKey] === remember_dataidx);
            // console.log("isfind",isfind);
            // data.find
            // pKey
            if (isfind) {
              // shouldMovePageTOThisDataIdx=remember_dataidx;
              // console.log("shouldMovePageTOThisDataIdx3::",shouldMovePageTOThisDataIdx)

              resolve(remember_dataidx); //resolve 후에 isfind 도 return되는것이지?
              return isfind;
              
            }
            else{
              resolve(null);
            }
          }
          else{
            resolve(null);
            return null;
          }
        });
      });
    }
    selectedRowsDone().then((res_findkey)=>{
      // console.log("res_findkey",res_findkey);
      setPagination(prev => {
        if (rememberSelRow && pKey) {
          //#@!  해당 pageIndex를 기억할것인가?    
          //data     
          let before_pageSize = prev.pageSize;

          let returnobj={
            ...prev,
            pageIndex:0
          }
          if(res_findkey!==null){
            // const copydata = JSON.parse(JSON.stringify(data));
             const rows = table.getSortedRowModel().rows;
             const data =rows.map(d=>d.original);
            // console.log("rows",copydata,rows)
            for(let i = 0 ; i < data.length ; i++ ){
              if(data[i][pKey]===res_findkey){
                // console.log("i",i)
                let pagenumber = Math.floor((i)/before_pageSize)+1;
                let pageindex= pagenumber-1;
                returnobj.pageIndex=pageindex;
                // console.log("pagenumber",pagenumber);
                break;
              }
            }
          }
          return returnobj;
        }
        else {
          if (usePagination) {
            //pageSize는 기억한다 그대로
            return {
              ...prev,
              // pageSize:  defaultPageSize ?? 10,
              pageIndex: 0,
            }
          }
          else {
            return {
              pageSize: data.length,
              pageIndex: 0,
            }
          }
        }
      })
  
    })

    if (multipleSelRowCheckbox) {
      setRowSelection({});
    }
  }, [data, usePagination, defaultPageSize, rememberSelRow, multipleSelRowCheckbox, pKey,table])




  const resetAllColumnAttributes = useCallback(() => {
    // table.autoreset
    //
    localStorage.removeItem("GP_" + autoSavetableName);
    // console.log("beforeload_column_initial", beforeload_column_initial)
    //visibility 초기화
    let obj: any = {
    };
    for (let i = 0; i < beforeload_column_initial.length; i++) {
      const oneColumn: GPColumn = beforeload_column_initial[i];
      // console.log("oneColumn",oneColumn)
      if (oneColumn.show === false) {
        obj[oneColumn.accessorKey] = false;

      }
      else {
        obj[oneColumn.accessorKey] = true;
      }
    }

    if (multipleSelRowCheckbox) {
      obj.multipleSelRowCheckbox = true;
    }
    // console.log("obj", obj)
    setColumnVisibility(obj);

    //column size 초기화
    obj = {
    };
    for (let i = 0; i < beforeload_column_initial.length; i++) {
      const oneColumn: GPColumn = beforeload_column_initial[i];
      // console.log("oneColumn",oneColumn)
      if (oneColumn.width) {
        obj[oneColumn.accessorKey] = oneColumn.width;

      }
      else {
        obj[oneColumn.accessorKey] = 150;
      }
    }
    if (multipleSelRowCheckbox) {
      obj.multipleSelRowCheckbox = 20;
    }
    setColumnSizing(obj);

    //column 순서 초기화
    const order: string[] = beforeload_column_initial.map(d => d.accessorKey);
    if (multipleSelRowCheckbox) {
      order.unshift("multipleSelRowCheckbox")
    }
    setColumnOrder(order);

    //소팅 초기화
    setSorting([]);

    //필터 초기화
    setGlobalFilter('');
    setColumnFilters([]);

    //
    // set_reloadColumn(true);
    // rerender();
    // table._autoResetPageIndex()

  }, [table, autoSavetableName, beforeload_column_initial, multipleSelRowCheckbox])



  const debouncedSave = useCallback(_.debounce((
    columnOrder: string[],
    columnVisibility: Record<string, boolean>,
    columnSizing: Record<string, number>,
    sorting: ColumnSort[],
    columnFilters: ColumnFiltersState,
    pagination:PaginationState,
  ) => {
    if (autoSavetableName) {

      // console.log("autoSavetableName",autoSavetableName)
      const saveInformation = columnOrder.map(key => ({
        accessorKey: key,
        show: columnVisibility[key],
        width: columnSizing[key],
        filterValue: columnFilters.find(d => d.id === key)?.value ? columnFilters.find(d => d.id === key)?.value : undefined,
        sorting: (sorting && sorting[0]?.id === key) ? sorting : undefined
      }));
      // console.log("saveInformation", saveInformation)
      // console.log(pagination,pagination);
      const {pageSize} =pagination;
      const save={
        pageSize:pageSize,
        columns:saveInformation,
      }
      try {
        localStorage.setItem("GP_" + autoSavetableName, JSON.stringify(save));
      }
      catch (err) {
        console.error("저장실패", err);
      }
      finally {
        // console.log("저장성공")
      }

    }
  }, 300),
    [autoSavetableName]
  );


  // useEffect 내에서 debouncedSave 함수 호출
  useEffect(() => {
    debouncedSave(columnOrder, columnVisibility, columnSizing, sorting, columnFilters,pagination);
  }, [debouncedSave, columnOrder, columnVisibility, columnSizing, sorting, columnFilters,pagination]);




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
      setLoading: (val: boolean) => {
        set_loading(val);
      }
      // set_columnOrder: (newOrder) => {
      //   table.setColumnOrder(newOrder);
      // },
      // get_columnOrder: () => {
      //   return table.getAllLeafColumns();
      // }
    }
  }, [table]);




  //drag and drop sensor 컬럼순서바꾸기
  const sensors = useSensors(
    useSensor(MouseSensor, {
      onActivation: (event) => {
        // console.log("onActivation", event)
      }, // Here!
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )


  // reorder columns after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setColumnOrder(columnOrder => {
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        return arrayMove(columnOrder, oldIndex, newIndex) //this is just a splice util
      })
    }
  }


  // console.log("pagination",pagination);
  // console.log("랜더")
  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className={`GP_table ${className}`} ref={gpTableWrapRef} >
        {/* 툴바 */}
        <GPtableToolbar
          globalfilter={globalfilter}
          saveExcelButton={saveExcelButton}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          toolbarRender={toolbarRender}
          setColumnOrder={setColumnOrder}
          columnAttributeButton={columnAttributeButton}
          resetAllColumnAttributes={resetAllColumnAttributes}
          table={table}
          enableOrderingColumn={enableOrderingColumn}
        />
        {/* 툴바끝 */}


        {/* 실제테이블 */}
        <div className="tableWrap">
          <table className="table"
            style={{
              // tableLayout: 'fixed',
              // width: table.getTotalSize(),
              width: table.getCenterTotalSize(),
              minWidth: "100%"
            }}
          >
            {/* header render 부분 */}
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map(header => {
                      return (
                        <DraggableTableHeader key={header.id} header={header} table={table}
                          enableResizingColumn={enableResizingColumn}
                          enableOrderingColumn={enableOrderingColumn}
                        />
                      )
                    })}
                  </SortableContext>
                </tr>
              ))}
            </thead>



            {/* rows render 부분 */}
            <tbody>
              {loading && <tr><td colSpan={columns.length}><Loading /></td></tr>}
              {!loading && table.getRowModel().rows.map(row => {
                const isSelRow = row.original === selectedRow;
                // console.log("row",row)
                return (
                  <tr key={row.id} style={{ background: isSelRow ? selRowBackground : "", color: isSelRow ? selRowColor : "" }}>
                    {row.getVisibleCells().map(cell => {
                      // console.log("cell",cell)
                      return (
                        <SortableContext
                          key={cell.id}
                          items={columnOrder}
                          strategy={horizontalListSortingStrategy}
                        >
                          <DragAlongCell key={cell.id} cell={cell}

                            onClick={(e) => {
                              setSelectedRow(row.original);
                              if (onClickRow) {
                                onClickRow(e, row.original, cell);
                              }
                            }}

                          />
                        </SortableContext>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* 테이블끝 */}


        {/* pagination */}
        {usePagination &&
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
                  value={pagination.pageIndex + 1}
                  onChange={e => {
                    // let max = table.getPageCount()-1;
                    // console.log("max",max)
                    let page = e.target.value ? Number(e.target.value) - 1 : 0;
                    // console.log("page",page)
                    // if(page>=max){
                    //   page=max;
                    // }
                    setPagination(p => {
                      return {
                        ...p,
                        pageIndex: page
                      }
                    })
                    // table.setPageIndex(page)
                  }}
                />
                &nbsp;of&nbsp;{table.getPageCount()}
              </div>

              <div style={{ marginLeft: '10%' }}>
                <select
                  className="viewRows"
                  value={pagination.pageSize}
                  onChange={e => {
                    setPagination(p => {

                      return {
                        ...p,
                        pageSize: Number(e.target.value)
                      };
                    })
                    // table.setPageSize(Number(e.target.value))
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
      </div>

    </DndContext>
  );
});


const DraggableTableHeader = ({
  header, table, enableResizingColumn, enableOrderingColumn
}: {
  header: Header<any, unknown>;
  table: Table<any>;
  enableResizingColumn: boolean;
  enableOrderingColumn: boolean;
}) => {
  const columnDef: any = header.column.columnDef;
  // const { attributes, isDragging, listeners, setNodeRef, transform } =  useSortable({ id: header.column.id, });
  // enableOrderingColumn이 true이고, enableOrdering이 true인 경우에만 useSortable 사용
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    enableOrderingColumn && columnDef.enableOrdering !== false ?
      useSortable({ id: header.column.id }) :
      { attributes: {}, isDragging: false, listeners: {}, setNodeRef: () => { }, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 } };
  const columnSize = header.column.getSize();
  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    width: columnSize,
    zIndex: isDragging ? 1 : 0,
  };

  // useEffect(()=>{
  //   const key = columnDef.accessorKey;
  //   console.log(`${key}:`,columnSize)

  // },[columnDef,columnSize])



  // console.log("columnSizeVars",columnSizeVars)
  //
  //enableOrderingColumn 일때만
  //attributes  listeners 할당
  // const a = header.getContext();
  const headerString = useMemo(() => {
    const columnDef: any = header.column.columnDef;
    // console.log("columnDef 거시기")
    if (columnDef.Header) {
      return columnDef.Header;
    }
    else {
      return columnDef.accessorKey;
    }
  }, [header.column.columnDef])

  // console.log("headerString",headerString)
  return (
    <th colSpan={header.colSpan} ref={setNodeRef} style={style}>
      {header.isPlaceholder
        ? null
        :
        <div

          {...{
            className: `header`,
          }}

        >
          <div
            className={`${columnDef?.useSort === false ? "headerText" : "headerText sortable"}`}
            style={{
              maxWidth: columnSize + "px"
            }}

            onClick={
              columnDef?.useSort === false
                ? () => { }
                : header.column.getToggleSortingHandler()
            }
            {...(enableOrderingColumn && columnDef.enableOrdering !== false ? { ...attributes, ...listeners } : {})}


          >
            <span title={headerString}>{flexRender(header.column.columnDef.header, header.getContext())}</span>

          </div>

          {/* 소트*/}
          <div className={`${columnDef?.useSort === false ? "" : "sortor"} 
          ${header.column.getIsSorted() as string ? header.column.getIsSorted() : ''}`}
          
            onClick={
              columnDef?.useSort === false
                ? () => { }
                : header.column.getToggleSortingHandler()
            }
          />


          {/* 리사이즈 absolute*/}
          {enableResizingColumn && header.column.getCanResize() && (
            <div
              onDoubleClick={() => header.column.resetSize()}
              onMouseDown={header.getResizeHandler()}
              onTouchStart={header.getResizeHandler()}
              className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''
                }`}
            ></div>
          )}

          <div />
        </div>
      }

      {/* 필터 */}
      {columnDef?.useFilter && header.column.getCanFilter() ? (
        <div className="filterWrap">
          <Filter column={header.column} table={table} />
        </div>
      ) : null}
    </th>
  )
}

const DragAlongCell = ({ cell, onClick }:
  {
    cell: Cell<any, unknown>;
    onClick: (event: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => void;

  }) => {
  const columnDef: any = cell.column.columnDef;

  // const { isDragging, setNodeRef, transform } = useSortable({
  //   id: cell.column.id,
  // })

  const { isDragging, setNodeRef, transform } = columnDef.enableOrdering !== false ?
    useSortable({ id: cell.column.id }) :
    { isDragging: false, setNodeRef: () => { }, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 } };
  const tdref = useRef(null);
  const cellSize = useMemo(() => {
    let size = cell.column.getSize();
    // console.log("tdref",tdref)
    return size;
  }, [cell.column.getSize()]);

  // console.log("cellSize",cellSize)

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: 'width transform 0.2s ease-in-out',
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

  // console.log("cell.getValu()",cell.getValue());
  // console.log("cell.getContext()",cell.getContext())
  const cellText: string = useMemo(() => {
    // console.log("asf",cell.getValue());

    const a = cell.renderValue() || "";
    // const b=cell.column.columnDef;
    // const cc:CellContext<any,unknown>=cell.getContext();
    // let c: any;
    // if (typeof b?.cell === 'function') {
    //     c = b?.cell(cc);
    // } else {
    //     c = undefined; // 또는 다른 적절한 값
    // }
    // console.log("c",c)
    return a.toString();
  }, [cell])

  return (
    <td style={style}
      ref={setNodeRef}

      onClick={onClick}

    >
      <div className="cell"
        ref={tdref}

      >

        <div className="cellText"
          style={{ maxWidth: cellSize }}
        >
          <span title={cellText}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </span>
        </div>


      </div>

    </td>
  )
}


export default GPtable;