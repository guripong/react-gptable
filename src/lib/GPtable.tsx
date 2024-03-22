import React, { CSSProperties,  forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useReducer, useRef, useState } from 'react';
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
  Header,
  Cell,
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



const DraggableTableHeader = ({
  header, table , enableResizingColumn ,enableOrderingColumn
}: {
  header: Header<any, unknown>;
  table: Table<any>;
  enableResizingColumn : boolean;
  enableOrderingColumn : boolean;
}) => {
  const columnDef: any = header.column.columnDef;
  // const { attributes, isDragging, listeners, setNodeRef, transform } =  useSortable({ id: header.column.id, });
  // enableOrderingColumn이 true이고, enableOrdering이 true인 경우에만 useSortable 사용
  const { attributes, isDragging, listeners, setNodeRef, transform } =  
  enableOrderingColumn && columnDef.enableOrdering !== false ? 
  useSortable({ id: header.column.id }) : 
  { attributes: {}, isDragging: false, listeners: {}, setNodeRef: () => {}, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1} };
  const columnSize =header.column.getSize();
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
            // className="headerText"
            className={`${columnDef?.useSort === false ? "headerText" : "headerText sortable"}`}
            onClick={
              columnDef?.useSort === false
                ? () => { }
                : header.column.getToggleSortingHandler()
            }
            {...(enableOrderingColumn&&columnDef.enableOrdering!==false ? { ...attributes, ...listeners } : {})}
            // {...attributes}
            // {...listeners}

          >{flexRender(header.column.columnDef.header, header.getContext())}</div>

          {/* 소트*/}
          <div className={`${columnDef?.useSort === false ? "" : "sortor"} ${header.column.getIsSorted() as string ? header.column.getIsSorted() : ''}`} />


          {/* 리사이즈 absolute*/}
          {enableResizingColumn&&header.column.getCanResize() && (
            <div
              onDoubleClick={()=>header.column.resetSize()}
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
  const columnDef:any = cell.column.columnDef;

  // const { isDragging, setNodeRef, transform } = useSortable({
  //   id: cell.column.id,
  // })

  const { isDragging, setNodeRef, transform } =  columnDef.enableOrdering !== false ? 
  useSortable({ id: cell.column.id }) : 
  { isDragging: false,  setNodeRef: () => {}, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1} };


  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: 'width transform 0.2s ease-in-out',
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <td style={style} ref={setNodeRef}
      onClick={onClick}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
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
    column: icolumn = [{
      Header: "column1",
      accessorKey: "column1",
      // useFilter: true,
    }, {
      Header: "column2",
      accessorKey: "column2",
      // useFilter: true,
    }],
    data: data = [],
    // defaultPageSize,
    // defaultToolbar,
    onClickRow,
    option = {
      autoSavetableName:null,
      row:{
        selRowColor:"#000",
        selRowBackground:"#fff", //1줄선택로우 배경색 default transparent         
        multipleSelRowCheckbox:false, //다중 선택row default false
      },
      column: {
        resizing: true,
        ordering: true,
      },
      pagination: null,
      toolbar: {
        globalfilter: false,
        columnAttributeButton: false,
        render: null,
      }
    },
  } = props;

  const rerender = useReducer(() => ({}), {})[1];


  
  //툴바 옵션들
  //다운로드 버튼 툴바 옵션 추가할것.
  const globalfilter = option?.toolbar?.globalfilter ?? false;
  const columnAttributeButton = option?.toolbar?.columnAttributeButton;
  const toolbarRender = (option?.toolbar?.render) ? option.toolbar.render : null;
  // console.log("toolbarRender",typeof option?.toolbar?.render)
  //pagination 옵션들
  const pagination = option?.pagination || null;
  const paginationArr = (pagination?.paginationArr && Array.isArray(pagination.paginationArr)) ? pagination.paginationArr : [10, 20, 30, 40];
  const defaultPageSize = Number.isInteger(pagination?.defaultPageSize) ? pagination?.defaultPageSize : paginationArr[0];

  //column 옵션들
  const enableResizingColumn = option?.column?.resizing ?? true;
  const enableOrderingColumn = option?.column?.ordering ?? true;

  //row 옵션
  const selRowBackground = option?.row?.selRowBackground ?? "#fff";
  const selRowColor = option?.row?.selRowColor ?? "#000";
  const multipleSelRowCheckbox = option?.row?.multipleSelRowCheckbox ?? false;

  //테이블 자동저장옵션
  const autoSavetableName = option?.autoSavetableName;


  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const gpTableWrapRef = useRef<HTMLDivElement>(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [columnOrder, setColumnOrder] = React.useState<string[]>([])
  const [showColumnAttribute, set_showColumnAttribute] = useState<boolean>(false);
  const [columnVisibility, setColumnVisibility] = useState<any>({})
  const [columnSizing,setColumnSizing] = useState<any>({});


  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    // const columns = useMemo<any[]>(() => {

    const newColumns = [];
    if(multipleSelRowCheckbox){
      newColumns.push({
        Header:"다중선택",
        useFilter:false, //default false
        useSort: false, // default true
        enableHiding: false,// 디폴트true 
        enableResizing: false,// default true
        enableOrdering:false, //default true
        size: 20,
        accessorKey: "multipleSelectRowCheckBox",
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
          
          return(<div style={{width:"100%",display:"flex",justifyContent:"center",alignContent:"center"}}>
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          /></div>
        )},
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
      newColumns.push(obj);

    }
    setColumnOrder(newColumns.map(d => d.accessorKey))
    return newColumns;
  }, [icolumn, data,multipleSelRowCheckbox])
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
    if(multipleSelRowCheckbox){
      obj.multipleSelRowCheckbox = true;
    }
     setColumnVisibility(obj);
    return obj;
  }, [icolumn,multipleSelRowCheckbox])

  const initColumSizing = useMemo(() => {
    let obj: any = {
    };
    for (let i = 0; i < icolumn.length; i++) {
      const oneColumn: any = icolumn[i];
      // console.log("oneColumn",oneColumn)
      if (oneColumn.width) {
        obj[oneColumn.accessorKey] = oneColumn.width;
        
      }
      else{
        obj[oneColumn.accessorKey] = 150;
      }
    }
    if(multipleSelRowCheckbox){
      obj.multipleSelRowCheckbox= 20;
    }
    setColumnSizing(obj);
    return obj;
  }, [icolumn,multipleSelRowCheckbox])



  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    defaultColumn:{
      // size:300,
      minSize:50,
      // maxSize:500,
    },
    state: {
      columnFilters,
      globalFilter,
      columnOrder,
      columnVisibility,
      columnSizing,
    },
    initialState: {
      pagination: {
        pageSize: pagination ? defaultPageSize : data.length,
        pageIndex: 0,
      },
      columnSizing:initColumSizing,
      // columnOrder: ['age', 'firstName', 'lastName'], //customize the initial column order
      columnVisibility: initColumVisibility,
      // expanded: true, //expand all rows by default

      // sorting: [
      //   {
      //     id: 'age',
      //     desc: true //sort by age in descending order by default
      //   }
      // ]

      
    },
    onColumnSizingChange:setColumnSizing,
    onColumnVisibilityChange:setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
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

  useEffect(()=>{
    if(autoSavetableName){
      //저장할것
      // console.log("columnOrder",columnOrder)
      // console.log("columnVisibility",columnVisibility)
      // console.log("columnSizing",columnSizing)
      const saveInformation=[];
      for(let i = 0 ; i <columnOrder.length ;i++){
        const key = columnOrder[i];
        const show = columnVisibility[key];
        const size = columnSizing[key];
        saveInformation.push({
          key:key,
          show:show,
          size:size
        });
      }
      localStorage.setItem("GP_"+autoSavetableName,JSON.stringify(saveInformation));
      console.log("saveInformation",saveInformation)
      // let a = table.getState().columnSizing;
      // console.log("a",a);

    }
   
  },[columnOrder,columnVisibility,columnSizing,table,autoSavetableName])
  
   


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
      // set_columnOrder: (newOrder) => {
      //   table.setColumnOrder(newOrder);
      // },
      // get_columnOrder: () => {
      //   return table.getAllLeafColumns();
      // }
    }
  }, [table]);




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
      setColumnOrder(newOrder);
    }
  }, []);


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

   // const columnSizeVars = React.useMemo(() => {
  //   const headers = table.getFlatHeaders()
  //   const colSizes: { [key: string]: number } = {}
  //   for (let i = 0; i < headers.length; i++) {
  //     const header = headers[i]!
  //     // colSizes[`--header-${header.id}-size`] = header.getSize()
  //     colSizes[`${header.column.id}`] = header.column.getSize()
  //   }
  //   console.log("colSizes",colSizes)
  //   return colSizes
  // }, [table.getState().columnSizingInfo])


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
        <div className="tableToolbar">
          {globalfilter &&
            <div className="global-filter">
              <DebouncedInput
                value={globalFilter ?? ''}

                onChange={value => setGlobalFilter(String(value))}
                className="gp_input"
                placeholder={`${table.getPrePaginationRowModel().rows.length}rows 전체검색`}
              />
            </div>
          }
          {toolbarRender && toolbarRender()}
          {columnAttributeButton &&
            <Dropdown
              // maxHeight="400px"
              defaultShow={showColumnAttribute}
              close={() => set_showColumnAttribute(false)}
              triangleStyle={{ right: "40px" }}
              btnRender={() => {
                return (<><button className="btn" onClick={() => set_showColumnAttribute(d => !d)}>
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
                    // if(CD.enableOrdering===false){
                    //   return null;
                    // }

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
                        {enableOrderingColumn &&CD.enableOrdering!==false&&
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
                        }
                      </div>)
                  })}
                </div>
              }
            </Dropdown>
          }
        </div>
        {/* 툴바끝 */}





        {/* 실제테이블 */}
        <div className="tableWrap">
          <table className="table"
            style={{
              // width: table.getTotalSize(),
              width: table.getCenterTotalSize(),
              minWidth: "100%"
            }}
          >
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
              {table.getRowModel().rows.map(row => {
                const isSelRow = row.original===selectedRow;
                // console.log("row",row)
                return (
                  <tr key={row.id}style={{background:isSelRow?selRowBackground:"",color:isSelRow?selRowColor:""}}>
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

    </DndContext>
  );
});

export default GPtable;