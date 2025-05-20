"use client";

import React, {
  CSSProperties,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type {
  GPColumn,
  GPColumn2,
  GPTableInstance,
  GPtableProps,
} from "./GPTableTypes";
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
  getSortedRowModel,
  ColumnDef,
  flexRender,
  Header,
  Cell,
  ColumnSort,
  PaginationState,
  RowSelectionState,
  VisibilityState,
  ColumnSizingState,
  ColumnOrderState,
  TableState,
  // FilterFns,
} from "@tanstack/react-table";

import "./GPtable.scss";

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
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
// needed for row & cell level scope DnD setup
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import IndeterminateCheckbox from "./components/IndeterminateCheckbox/IndeterminateCheckbox";

import _ from "lodash";
import { fuzzyFilter } from "./filters/filter";
// import {Filter} from './filters/Filter';

import { loadTable } from "./utils/loadTable";
import Loading from "./components/Loading/Loading";
import GPtableToolbar from "./toolbar/GPtableToolbar";
import Pagination from "./pagination/Pagination";
import CommonFilter from "./filters/CommonFilter";
import styled from "styled-components";
interface TableRowProps {
  $isSelected: number;
  $selRowBackground?: string;
  $selRowColor?: string;
  $hoverColor?: string;
  $hoverBackground?: string;
}

const StyledTableRow = styled.tr<TableRowProps>`
  background-color: ${(props) =>
    props.$isSelected ? props.$selRowBackground : "inherit"};
  color: ${(props) => (props.$isSelected ? props.$selRowColor : "inherit")};
  // 다른 스타일 속성들

  &:hover {
    background-color: ${(props) => props.$hoverBackground};
    color: ${(props) => props.$hoverColor};
    // 다른 hover 스타일 속성들
  }
`;
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
  const {
    className,
    column: beforeload_column = [
      {
        Header: "column1",
        accessorKey: "column1",
        // useFilter: true,
      },
      {
        Header: "column2",
        accessorKey: "column2",
        // useFilter: true,
      },
    ],
    data: data = [],
    onClickRow,
    onCheckRow,
    option: userOptions = undefined,
    toolbar,
  } = props;

  const [beforeload_column_initial] = useState<GPColumn2[]>(() => {
    const copy = JSON.parse(JSON.stringify(beforeload_column));
    for (let i = 0; i < copy.length; i++) {
      if (!copy[i].accessorKey && copy[i].accessor) {
        copy[i].accessorKey = copy[i].accessor;
      }
    }
    return copy;
  });
  const rerender = useReducer(() => ({}), {})[1];
  const [loading, set_loading] = useState<boolean>(false);

  const toolbarRender = toolbar || null;

  const {
    //툴바 옵션들
    globalfilter,
    columnAttributeButton,
    saveExcelButton,
    //pagination 옵션들
    paginationArr,
    defaultPageSize,
    usePagination,
    //column 옵션들
    enableResizingColumn,
    enableOrderingColumn,
    //row 옵션
    rememberSelRow,
    selRowBackground,
    selRowColor,
    multipleSelRowCheckbox,
    hoverRowBackground,
    hoverRowColor,
    //테이블 자동저장옵션
    autoSavetableName,
  } = useMemo(() => {
    const defaultOptions = {
      autoSavetableName: null,
      row: {
        rememberSelRow: true,
        selRowColor: "#000",
        selRowBackground: "#fff",
        multipleSelRowCheckbox: false,
        hoverRowColor: "#000",
        hoverRowBackground: "#fff",
      },
      column: {
        resizing: true,
        ordering: true,
      },
      pagination: null,
      toolbar: {
        globalfilter: false,
        columnAttributeButton: false,
        saveExcelButton: false,
        // render: null,
      },
    };

    const option = {
      ...defaultOptions,
      ...userOptions,
    };

    const globalfilter = option?.toolbar?.globalfilter;
    const columnAttributeButton = option?.toolbar?.columnAttributeButton;
    const saveExcelButton = option?.toolbar?.saveExcelButton;

    const usePagination = option?.pagination || null;
    const paginationArr =
      usePagination?.paginationArr && Array.isArray(usePagination.paginationArr)
        ? usePagination.paginationArr
        : [10, 20, 30, 40];
    const defaultPageSize = Number.isInteger(usePagination?.defaultPageSize)
      ? usePagination?.defaultPageSize
      : paginationArr[0];

    const enableResizingColumn = option?.column?.resizing ?? true;
    const enableOrderingColumn = option?.column?.ordering ?? true;

    const rememberSelRow = option.row.rememberSelRow;
    const selRowBackground = option.row?.selRowBackground;
    const selRowColor = option.row?.selRowColor;
    const hoverRowColor = option.row?.hoverRowColor;
    const hoverRowBackground = option.row?.hoverRowBackground;

    const multipleSelRowCheckbox = option.row.multipleSelRowCheckbox ?? false;

    const autoSavetableName = option.autoSavetableName;

    return {
      globalfilter,
      columnAttributeButton,
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
      saveExcelButton,
      hoverRowColor,
      hoverRowBackground,
    };
  }, [userOptions]);

  // console.log("enableOrderingColumn",enableOrderingColumn)
  const gpTableWrapRef = useRef<HTMLDivElement>(null);

  // console.log("rowSelection",rowSelection)

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageSize: usePagination ? defaultPageSize ?? 10 : data.length,
    pageIndex: 0,
  });

  const [globalFilter, setGlobalFilter] = useState<any>("");
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [sorting, setSorting] = useState<ColumnSort[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // console.log("sorting",sorting);
  // console.log("columnFilters", columnFilters)

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedRow, setSelectedRow] = useState(null); //한줄
  const [selMultipleRows, setSelMultipleRows] = useState<any[]>([]);

  useEffect(() => {
    if (onCheckRow) {
      // console.log("selMultipleRows",selMultipleRows)
      onCheckRow(selMultipleRows);
    }
  }, [selMultipleRows, onCheckRow]);

  //컬럼의 visibility 가 보이다가 안보일때 필터도 제거하는부분
  const beforeColumnVisibility = useRef(columnVisibility);
  useEffect(() => {
    for (const key in beforeColumnVisibility.current) {
      if (beforeColumnVisibility.current[key] && !columnVisibility[key]) {
        //보이다가 숨겼을땐 필터도 제거해야함
        setColumnFilters((prevFilters) =>
          prevFilters.filter((filter) => filter.id !== key),
        );
      }
    }
    beforeColumnVisibility.current = columnVisibility;
  }, [columnVisibility, columnFilters]);

  // usePagination에 따라서 pagerows 갯수가 바뀜
  useEffect(() => {
    if (usePagination) {
      setPagination((p) => {
        return {
          ...p,
          pageIndex: 0,
        };
      });
    }
  }, [columnFilters, usePagination]);

  const icolumn = useMemo<GPColumn[]>(() => {
    let newLoadedColumn: GPColumn[] = beforeload_column;
    for (let i = 0; i < newLoadedColumn.length; i++) {
      if (!newLoadedColumn[i].accessorKey && newLoadedColumn[i].accessor) {
        const a: any = newLoadedColumn[i].accessor;
        newLoadedColumn[i].accessorKey = a;
      }
    }

    if (autoSavetableName) {
      try {
        const { columns, pageSize: loadPageSize } = loadTable(
          beforeload_column,
          autoSavetableName,
        );
        // console.log("columns",columns)
        newLoadedColumn = columns;
        setPagination((prev: any) => {
          return {
            ...prev,
            pageSize: loadPageSize || defaultPageSize,
          };
        });
      } catch (err) {
        console.error("table loading실패", err);
        localStorage.removeItem(autoSavetableName);
      }
    }
    return newLoadedColumn;
  }, [beforeload_column, autoSavetableName, defaultPageSize]);

  const pKey = useMemo(() => {
    for (let i = 0; i < icolumn.length; i++) {
      if (icolumn[i].pKey) {
        return icolumn[i]?.accessorKey || icolumn[i].accessor;
      }
    }
    return null;
  }, [icolumn]);

  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    // const columns = useMemo<any[]>(() => {

    const newColumns = [];
    if (multipleSelRowCheckbox) {
      newColumns.push({
        Header: "다중선택",
        useFilter: false, //default false
        useSort: false, // default true
        enableHiding: false, // 디폴트true
        enableResizing: false, // default true
        enableOrdering: false, //default true
        size: 50,
        minSize: 50,
        maxSize: 50,
        accessorKey: "multipleSelRowCheckbox",
        header: ({ table }: any) => {
          return (
            <IndeterminateCheckbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />
          );
        },
        cell: ({ row }: any) => {
          return (
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          );
        },
      });
    }

    for (let i = 0; i < icolumn.length; i++) {
      const oneColumn: any = icolumn[i];
      let obj: any = {
        ...icolumn[i],
        enableHiding: true,
      };
      // if(icolumn[i].cell){
      //   obj.cell=icolumn[i].cell ;
      // }
      if (oneColumn.sorting) {
        setSorting(oneColumn.sorting);
      }

      if (oneColumn.Header) {
        obj.header = () => oneColumn.Header;
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

      obj.enableHiding =
        oneColumn.enableHiding !== undefined ? oneColumn.enableHiding : true;
      newColumns.push(obj);
    }

    const order = newColumns.map((d) => d.accessorKey);
    setColumnOrder(order);
    return newColumns;
  }, [icolumn, multipleSelRowCheckbox]);

  const initColumnVisibility = useMemo<Record<string, boolean>>(() => {
    let obj: any = {};
    for (let i = 0; i < icolumn.length; i++) {
      const oneColumn: any = icolumn[i];
      // console.log("oneColumn",oneColumn)
      if (oneColumn.show === false) {
        obj[oneColumn.accessorKey] = false;
      } else {
        obj[oneColumn.accessorKey] = true;
      }
    }
    if (multipleSelRowCheckbox) {
      obj.multipleSelRowCheckbox = true;
    }
    setColumnVisibility(obj);
    return obj;
  }, [icolumn, multipleSelRowCheckbox]);

  const initColumnSizing = useMemo<Record<string, number>>(() => {
    let obj: any = {};
    for (let i = 0; i < icolumn.length; i++) {
      const oneColumn: any = icolumn[i];
      // console.log("oneColumn",oneColumn)
      if (oneColumn.width) {
        obj[oneColumn.accessorKey] = oneColumn.width;
      } else {
        obj[oneColumn.accessorKey] = 150;
      }
    }
    if (multipleSelRowCheckbox) {
      obj.multipleSelRowCheckbox = 20;
    }
    setColumnSizing(obj);
    return obj;
  }, [icolumn, multipleSelRowCheckbox]);

  const initColumnFilter = useMemo<ColumnFiltersState>(() => {
    let filterArr: ColumnFiltersState = [];
    for (let i = 0; i < icolumn.length; i++) {
      if (icolumn[i].filterValue) {
        filterArr.push({
          id: icolumn[i].accessorKey || "",
          value: icolumn[i].filterValue,
        });
      }
    }
    // console.log("filterArr",filterArr)
    setColumnFilters(filterArr);
    return filterArr;
  }, [icolumn]);

  const table = useReactTable({
    data,

    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    autoResetAll: false,
    defaultColumn: {
      // size:300,
      minSize: 20,
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
    columnResizeMode: "onChange",

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

  // console.log("rows",rows)
  //저장할때 pagination
  //굉장히 어려운부분
  //data 변경시 pagination과, row selection변경
  useEffect(() => {
    // console.log("pagination 값 초기화")
    // console.log("usePagination",usePagination)
    // console.log("defaultPageSize",defaultPageSize)
    // console.log("rememberSelRow",rememberSelRow)
    // console.log("multipleSelRowCheckbox",multipleSelRowCheckbox)
    // console.log("바뀐data", data)

    // console.log("동작")
    function selectedRowsDone() {
      return new Promise(function (resolve) {
        setSelectedRow((prevSelectedOneRow) => {
          if (rememberSelRow && pKey && prevSelectedOneRow) {
            // console.log("prevSelectedOneRow",prevSelectedOneRow);
            // console.log("pKey",pKey)
            const remember_dataidx = prevSelectedOneRow[pKey];
            // console.log("remember_dataidx",remember_dataidx)
            const isfind = data.find((d) => d[pKey] === remember_dataidx);
            // console.log("isfind",isfind);
            // data.find
            // pKey
            if (isfind) {
              // shouldMovePageTOThisDataIdx=remember_dataidx;
              // console.log("shouldMovePageTOThisDataIdx3::",shouldMovePageTOThisDataIdx)

              resolve(remember_dataidx); //resolve 후에 isfind 도 return되는것이지?
              return isfind;
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
            return null;
          }
        });
      });
    }

    selectedRowsDone().then((res_findkey) => {
      // console.log("res_findkey",res_findkey);
      setPagination((prev) => {
        if (rememberSelRow && pKey) {
          //#@!  해당 pageIndex를 기억할것인가?
          //data
          let before_pageSize = prev.pageSize;

          let returnobj = {
            ...prev,
            pageIndex: 0,
          };
          if (res_findkey !== null) {
            // const copydata = JSON.parse(JSON.stringify(data));
            const rows = table.getSortedRowModel().rows;
            const data = rows.map((d) => d.original);
            // console.log("rows",copydata,rows)
            for (let i = 0; i < data.length; i++) {
              if (data[i][pKey] === res_findkey) {
                // console.log("i",i)
                let pagenumber = Math.floor(i / before_pageSize) + 1;
                let pageindex = pagenumber - 1;
                returnobj.pageIndex = pageindex;
                // console.log("pagenumber",pagenumber);
                break;
              }
            }
          }
          return returnobj;
        } else {
          if (usePagination) {
            //pageSize는 기억한다 그대로
            return {
              ...prev,
              // pageSize:  defaultPageSize ?? 10,
              pageIndex: 0,
            };
          } else {
            return {
              pageSize: data.length,
              pageIndex: 0,
            };
          }
        }
      });
    });
  }, [data, usePagination, defaultPageSize, rememberSelRow, pKey, table]);

  //데이터바뀔시 체크박스 해제
  useEffect(() => {
    if (multipleSelRowCheckbox) {
      // console.log("비워")
      setRowSelection({});
    }
  }, [multipleSelRowCheckbox, data]);

  const resetAllColumnAttributes = useCallback(() => {
    // table.autoreset
    //
    localStorage.removeItem("GP_" + autoSavetableName);
    // console.log("beforeload_column_initial", beforeload_column_initial)
    //visibility 초기화
    let obj: any = {};
    for (let i = 0; i < beforeload_column_initial.length; i++) {
      const oneColumn: GPColumn2 = beforeload_column_initial[i];

      // console.log("oneColumn",oneColumn)
      if (oneColumn.show === false) {
        obj[oneColumn.accessorKey] = false;
      } else {
        obj[oneColumn.accessorKey] = true;
      }
    }

    if (multipleSelRowCheckbox) {
      obj.multipleSelRowCheckbox = true;
    }
    // console.log("obj", obj)
    setColumnVisibility(obj);

    //column size 초기화
    obj = {};
    for (let i = 0; i < beforeload_column_initial.length; i++) {
      const oneColumn: GPColumn2 = beforeload_column_initial[i];

      // console.log("oneColumn",oneColumn)
      if (oneColumn.width) {
        obj[oneColumn.accessorKey] = oneColumn.width;
      } else {
        obj[oneColumn.accessorKey] = 150;
      }
    }
    if (multipleSelRowCheckbox) {
      obj.multipleSelRowCheckbox = 20;
    }
    setColumnSizing(obj);

    //column 순서 초기화
    const order: string[] = beforeload_column_initial.map((d) => d.accessorKey);
    if (multipleSelRowCheckbox) {
      order.unshift("multipleSelRowCheckbox");
    }
    setColumnOrder(order);

    //소팅 초기화
    setSorting([]);

    //필터 초기화
    setGlobalFilter("");
    setColumnFilters([]);
  }, [
    table,
    autoSavetableName,
    beforeload_column_initial,
    multipleSelRowCheckbox,
  ]);

  const debouncedSave = useCallback(
    _.debounce(
      (
        columnOrder: string[],
        columnVisibility: Record<string, boolean>,
        columnSizing: Record<string, number>,
        sorting: ColumnSort[],
        columnFilters: ColumnFiltersState,
        pagination: PaginationState,
      ) => {
        if (autoSavetableName) {
          // console.log("autoSavetableName",autoSavetableName)
          const saveInformation = columnOrder.map((key) => ({
            accessorKey: key,
            show: columnVisibility[key],
            width: columnSizing[key],
            filterValue: columnFilters.find((d) => d.id === key)?.value
              ? columnFilters.find((d) => d.id === key)?.value
              : undefined,
            sorting: sorting && sorting[0]?.id === key ? sorting : undefined,
          }));
          // console.log("saveInformation", saveInformation)
          // console.log(pagination,pagination);
          const { pageSize } = pagination;
          const save = {
            pageSize: pageSize,
            columns: saveInformation,
          };
          try {
            localStorage.setItem(
              "GP_" + autoSavetableName,
              JSON.stringify(save),
            );
          } catch (err) {
            console.error("저장실패", err);
          } finally {
            // console.log("저장성공")
          }
        }
      },
      300,
    ),
    [autoSavetableName],
  );

  // useEffect 내에서 debouncedSave 함수 호출
  useEffect(() => {
    debouncedSave(
      columnOrder,
      columnVisibility,
      columnSizing,
      sorting,
      columnFilters,
      pagination,
    );
  }, [
    debouncedSave,
    columnOrder,
    columnVisibility,
    columnSizing,
    sorting,
    columnFilters,
    pagination,
  ]);

  useEffect(() => {
    //  console.log("rowSelection",rowSelection)
    const nowSelectedRows = Object.keys(rowSelection).map((key) => {
      return table.getSelectedRowModel().rowsById[key]?.original || [];
      // console.log("여기")
    });
    // console.log("prevSelectedRows",prevSelectedRows)
    setSelMultipleRows(nowSelectedRows);
  }, [rowSelection, table]);

  const setSelectRowAndMovePage: GPTableInstance["setSelectRowAndMovePage"] =
    useCallback(
      ({ key, value }) => {
        if (!key || value === undefined || value === null) return false;

        const rows = table.getSortedRowModel().rows;
        const data = rows.map((d) => d.original);
        const targetIndex = data.findIndex((row) => row[key] === value);

        if (targetIndex === -1) return false;

        const pageSize = pagination.pageSize;
        const newPageIndex = Math.floor(targetIndex / pageSize);

        // 페이지 이동
        setPagination((prev) => ({
          ...prev,
          pageIndex: newPageIndex,
        }));

        // 해당 row 선택
        setSelectedRow(data[targetIndex]);

        return true;
      },
      [table, pagination],
    );
  const isReadyRef = useRef(false);
  const resolveReadyPromiseRef = useRef<() => void>();
  const [readyPromise] = useState<Promise<void>>(() => {
    return new Promise<void>((resolve) => {
      resolveReadyPromiseRef.current = resolve;
    });
  });

  useEffect(() => {
    const rows = table.getSortedRowModel().rows;
    if (rows.length > 0 && !isReadyRef.current) {
      isReadyRef.current = true;
      resolveReadyPromiseRef.current?.();
    }
  }, [table]);

  useImperativeHandle(
    ref,
    () => {
      return {
        whenReady: () => readyPromise,
        setSelectRowAndMovePage: setSelectRowAndMovePage,
        test: (value: number) => {
          return value + 1;
        },
        power: () => {
          return "power";
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
        },
        set_customFilter: (id, filter) => {
          //컬럼리스트중에 해당 ID가 있는지 확인
          //없으면  valid false , msg 해당 컬럼에 해당 id가 없습니다
          //해당 ID가 visibility false이면
          //해당컬럼이 보이지않아서 필터를 걸 수 없습니다
          const visibleColumn = table.getAllLeafColumns();
          let isColumnExist = visibleColumn.find((c) => c.id === id);
          if (!isColumnExist) {
            return {
              valid: false,
              msg: `${id} 컬럼이 존재하지 않습니다`,
            };
          }
          let tableState: TableState = table.getState();
          let { columnFilters, columnVisibility } = tableState;
          // console.log("tableState",tableState)
          // let obj = table.getState(), { columnFilters, columnVisibility } = obj;

          let isTargetFilterHide = columnVisibility[id] === false;
          if (isTargetFilterHide) {
            return {
              valid: false,
              msg: `${id} 컬럼이 숨겨진상태라 필터를 걸 수 없습니다`,
            };
          }
          //필터 타입을 확인해야하는데..
          //해당 필터가 무엇인지?
          setColumnFilters((prevFilters) => {
            const existingFilterIndex = prevFilters.findIndex(
              (column) => column.id === id,
            );

            if (existingFilterIndex !== -1) {
              // If the filter exists, update its value
              prevFilters[existingFilterIndex].value = filter;
            } else {
              // If the filter doesn't exist, add it to the array
              prevFilters.push({ id: id, value: filter });
            }
            return [...prevFilters]; // Ensure returning a new array to trigger re-render
          });
          return {
            valid: true,
            msg: "성공",
          };
        },
        getSelectedMultipleRows: () => {
          return selMultipleRows;
        },
        removeSelectedMultipleRows: () => {
          setRowSelection({});
        },
        // set_columnOrder: (newOrder) => {
        //   table.setColumnOrder(newOrder);
        // },
        // get_columnOrder: () => {
        //   return table.getAllLeafColumns();
        // }
      };
    },
    [readyPromise,table, selMultipleRows, setSelectRowAndMovePage],
  );

  //drag and drop sensor 컬럼순서바꾸기

  // reorder columns after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    // console.log("Asfasf")
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
      });
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
    useSensor(KeyboardSensor, {}),
  );
  // console.log("columns.length",columns.length)
  // console.log("pagination",pagination);
  // console.log("랜더")
  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className={`GP_table ${className}`} ref={gpTableWrapRef}>
        {/* 툴바 */}
        <GPtableToolbar
          data={data}
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
          <table
            className="table"
            style={{
              // tableLayout: 'fixed',
              // width: table.getTotalSize(),
              width: table.getCenterTotalSize(),
              minWidth: "100%",
            }}
          >
            {/* header render 부분 */}
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <GP_Header
                          key={header.id}
                          header={header}
                          table={table}
                          enableResizingColumn={enableResizingColumn}
                          enableOrderingColumn={enableOrderingColumn}
                        />
                      );
                    })}
                  </SortableContext>
                </tr>
              ))}
            </thead>

            {/* rows render 부분 */}
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={columns.length}>
                    <Loading />
                  </td>
                </tr>
              )}
              {!loading &&
                table.getRowModel().rows.map((row) => {
                  const isSelRow = row.original === selectedRow ? 1 : 0;
                  // console.log("row",row)
                  //hoverRowBackground
                  //hoverRowColor
                  return (
                    <StyledTableRow
                      key={row.id}
                      $isSelected={isSelRow}
                      $selRowBackground={selRowBackground}
                      $selRowColor={selRowColor}
                      $hoverColor={hoverRowColor}
                      $hoverBackground={hoverRowBackground}
                    >
                      {row.getVisibleCells().map((cell) => {
                        // console.log("cell",cell)
                        return (
                          <SortableContext
                            key={cell.id}
                            items={columnOrder}
                            strategy={horizontalListSortingStrategy}
                          >
                            <GP_Cell
                              key={cell.id}
                              cell={cell}
                              onClick={(e) => {
                                setSelectedRow((origin) => {
                                  if (row.original === origin) {
                                    return null;
                                  } else {
                                    return row.original;
                                  }
                                });
                                if (onClickRow) {
                                  onClickRow(e, row.original, cell);
                                }
                              }}
                            />
                          </SortableContext>
                        );
                      })}
                    </StyledTableRow>
                  );
                })}
            </tbody>
          </table>
        </div>
        {/* 테이블끝 */}

        {/* pagination */}
        {usePagination && (
          <Pagination
            setPagination={setPagination}
            table={table}
            pagination={pagination}
            paginationArr={paginationArr}
          />
        )}
      </div>
    </DndContext>
  );
});

const GP_Header = ({
  header,
  table,
  enableResizingColumn,
  enableOrderingColumn,
}: {
  header: Header<any, unknown>;
  table: Table<any>;
  enableResizingColumn: boolean;
  enableOrderingColumn: boolean;
}) => {
  const columnDef: any = header.column.columnDef;
  // console.log("enableOrderingColumn",enableOrderingColumn)
  // const { attributes, isDragging, listeners, setNodeRef, transform } =  useSortable({ id: header.column.id, });
  // enableOrderingColumn이 true이고, enableOrdering이 true인 경우에만 useSortable 사용

  const { attributes, isDragging, listeners, setNodeRef, transform } =
    enableOrderingColumn && columnDef.enableOrdering !== false
      ? useSortable({ id: header.column.id })
      : {
          attributes: {},
          isDragging: false,
          listeners: {},
          setNodeRef: () => {},
          transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
        };
  const columnSize = header.column.getSize();

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
    whiteSpace: "nowrap",
    width: columnSize,
    zIndex: isDragging ? 1 : 0,
  };

  const isMultipleCheckBox = useMemo(() => {
    const columnDef: any = header.column.columnDef;
    if (columnDef.accessorKey === "multipleSelRowCheckbox") {
      return true;
    }
    return false;
  }, [header.column.columnDef]);

  const headerString = useMemo(() => {
    const columnDef: any = header.column.columnDef;
    // console.log("columnDef 거시기")
    if (columnDef.Header) {
      return columnDef.Header;
    } else {
      return columnDef.accessorKey || columnDef.accessor;
    }
  }, [header.column.columnDef]);

  // console.log("headerString",headerString)
  return (
    <th colSpan={header.colSpan} ref={setNodeRef} style={style}>
      {header.isPlaceholder ? null : (
        <div
          {...{
            className: `header no-drag`,
          }}
        >
          {isMultipleCheckBox ? (
            <>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </>
          ) : (
            <>
              <div
                className={`${columnDef?.useSort === false ? "headerText" : "headerText sortable"}`}
                style={{
                  maxWidth: columnSize + "px",
                }}
                onClick={
                  columnDef?.useSort === false
                    ? () => {}
                    : header.column.getToggleSortingHandler()
                }
                {...(enableOrderingColumn && columnDef.enableOrdering !== false
                  ? { ...attributes, ...listeners }
                  : {})}
              >
                <span title={headerString}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </span>
              </div>

              {/* 소트*/}
              <div
                className={`${columnDef?.useSort === false ? "" : "sortor"}
                 ${(header.column.getIsSorted() as string) ? header.column.getIsSorted() : ""}`}
                onClick={
                  columnDef?.useSort === false
                    ? () => {}
                    : header.column.getToggleSortingHandler()
                }
                {...(enableOrderingColumn && columnDef.enableOrdering !== false
                  ? { ...attributes, ...listeners }
                  : {})}
              />

              {/* 리사이즈 absolute*/}
              {enableResizingColumn && header.column.getCanResize() && (
                <div
                  onDoubleClick={() => header.column.resetSize()}
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                  className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""}`}
                ></div>
              )}
            </>
          )}
        </div>
      )}

      {/* 필터 */}
      {columnDef?.useFilter && header.column.getCanFilter() ? (
        <div className="filterWrap">
          <CommonFilter column={header.column} table={table} />
        </div>
      ) : null}
    </th>
  );
};

const GP_Cell = ({
  cell,
  onClick,
}: {
  cell: Cell<any, unknown>;
  onClick: (event: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => void;
}) => {
  const columnDef: any = cell.column.columnDef;

  // const { isDragging, setNodeRef, transform } = useSortable({
  //   id: cell.column.id,
  // })

  const { isDragging, setNodeRef, transform } =
    columnDef.enableOrdering !== false
      ? useSortable({ id: cell.column.id })
      : {
          isDragging: false,
          setNodeRef: () => {},
          transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
        };
  const tdref = useRef(null);
  const cellSize = useMemo(() => {
    let size = cell.column.getSize();
    // console.log("tdref",tdref)
    return size;
  }, [cell.column.getSize()]);

  // console.log("cellSize",cellSize)

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };
  const isMultipleCheckBox = useMemo(() => {
    const columnDef: any = cell.column.columnDef;
    if (columnDef.accessorKey === "multipleSelRowCheckbox") {
      return true;
    }
    return false;
  }, [cell.column.columnDef]);

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
  }, [cell]);

  return (
    <td
      style={style}
      ref={setNodeRef}
      onClick={isMultipleCheckBox ? () => {} : onClick}
    >
      <div className="cell" ref={tdref}>
        {isMultipleCheckBox ? (
          <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>
        ) : (
          <div className="cellText" style={{ maxWidth: cellSize }}>
            <span title={cellText}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </span>
          </div>
        )}
      </div>
    </td>
  );
};

export default GPtable;
