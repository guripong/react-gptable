import { useReactTable } from '@tanstack/react-table';
import { ForwardRefExoticComponent } from 'react';
// import type { CellContext } from '@tanstack/react-table';
/**
 * 한번에 다 만들고 달아줘
 * **/

interface GPInstanceResponse{
    valid:boolean;
    msg?:string;
}
interface GPTableInstance {
    whenReady: () => Promise<void>;
    /**
     * 특정 key/value 조건을 가진 row를 찾아 선택하고, 해당 row가 위치한 페이지로 이동합니다.
     *
     * - pagination 옵션이 설정된 경우: 해당 row가 위치한 page로 자동 이동합니다.
     * - 조건에 맞는 row가 없으면 false를 반환합니다.
     * - 조건에 맞는 row가 있으면 해당 row를 선택 상태로 설정하고 true를 반환합니다.
     *
     * @param params.key 탐색할 row의 기준 key (예: 'data_idx')
     * @param params.value 탐색할 value
     * @returns boolean - 찾으면 true, 찾지 못하면 false
     */
    setSelectRowAndMovePage: (params:{key:string,value:unknown})=>boolean;
    removeSelectRowAndMovePage: (moveFirstPage?:boolean)=>boolean;

    test?: (value: number) => number;
    power?: () => string;
    getGPtableElementRef: () => HTMLDivElement | null;
    getTable: () => ReturnType<typeof useReactTable>;
    forceRerender: () => void;
    setLoading:(value:boolean)=>void;
    set_columnOrder?: ([]:Array<any>) => void;
    get_columnOrder?: () => any;

    set_customFilter : (id:string,filter:string|[string,string]) =>GPInstanceResponse;
    getSelectedMultipleRows : ()=>any[];
    removeSelectedMultipleRows : ()=>void;
}

type GPCellContextLike<TData, TValue> = {
  getValue: () => TValue;
  renderValue: () => TValue;
  row: { original: TData; value: string };
};

/**
 * GPTable 컴포넌트에서 사용되는 컬럼의 정보를 정의하는 인터페이스입니다.
 * @param Header 컬럼 헤더에 표시할 텍스트입니다. 생략 시 accessorKey가 대체됩니다.
 * @param header 컬럼 헤더를 커스터마이징하는 함수로, JSX 요소로 렌더링할 수 있습니다.
 * @param accessorKey 컬럼에 사용될 데이터의 키(key)입니다.
 * @param enableOrdering 컬럼의 순서 변경 기능을 사용할지 여부를 나타냅니다. 기본값은 true입니다.
 * @param enableResizing 컬럼의 크기를 조정할 수 있는지 여부를 나타냅니다. 기본값은 true입니다.
 * @param enableHiding 컬럼을 숨길 수 있는지 여부를 나타냅니다. 기본값은 true입니다.
 * @param useSort 컬럼의 정렬 기능 사용 여부를 나타냅니다. 기본값은 false.
 * @param useFilter 컬럼의 필터 기능 사용 여부를 나타냅니다. 기본값은 false입니다.
 * @param show 컬럼의 표시 여부를 나타냅니다. 기본값은 true입니다.
 * @param width 컬럼의 너비입니다.
 * @param accessorFn 데이터를 변환하는 함수로, 특정 형식으로 데이터를 가공할 수 있습니다.
 * @param cell 컬럼 셀에 표시할 사용자 정의 컴포넌트입니다.
 * @see {@link GPColumn}
 */
interface GPColumn {
    /**
     *  selection 의 기준이 되는키 기억합니다
     * **/
    pKey?: boolean;
    /**
     * 컬럼 헤더에 표시할 텍스트입니다.
     * 생략 시 accessorKey가 대체됩니다.
     */
    Header?: string;

    /**
     * 컬럼 헤더를 커스터마이징하는 함수입니다.
     * 컬럼 헤더를 사용자 정의 JSX 요소로 렌더링할 수 있습니다.
     */
    header?: (info: any) => JSX.Element;

    /**
     * 컬럼에 사용될 데이터의 키(key)입니다.
     */
    accessorKey?: string;
      /**
     * 컬럼에 사용될 데이터의 키(key)입니다. accessorKey를 다치기힘들면 이것만치세요
     */
    accessor?: string;

    /**
     * 컬럼의 순서 변경 기능을 사용할지 여부를 나타냅니다.
     */
    enableOrdering?: boolean;

    /**
     * 컬럼의 크기를 조정할 수 있는지 여부를 나타냅니다.
     * 기본값은 true입니다.
     */
    enableResizing?: boolean;

    /**
     * 컬럼을 숨길 수 있는지 여부를 나타냅니다.
     * 기본값은 true입니다.
     */
    enableHiding?: boolean;

    /**
     * 컬럼의 정렬 기능 사용 여부를 나타냅니다.
     * 기본값은 true입니다.
     */
    useSort?: boolean;

    /**
     * 컬럼의 필터 기능 사용 여부를 나타냅니다.
     * 기본값은 true입니다.
     */
    useFilter?: boolean;

    /**
     * 컬럼어 default filter value입니다
     * number value의 경우 min max
     * **/
    filterValue?: string | any[];

    /**
     * 컬럼의 표시 여부를 나타냅니다.
     * 기본값은 true입니다.
     */
    show?: boolean;

    /**
     * 컬럼의 너비입니다.
     */
    width?: number;

    /**
     * 데이터를 변환하는 함수입니다.
     * 특정 형식으로 데이터를 가공할 수 있습니다.
     */
    accessorFn?: (row: any) => any;

    /**
     * 컬럼 셀에 표시할 사용자 정의 컴포넌트입니다.
     */
    cell?: (info: any) => JSX.Element;

}
interface GPColumn2 {
    /**
     *  selection 의 기준이 되는키 기억합니다
     * **/
    pKey?: boolean;
    /**
     * 컬럼 헤더에 표시할 텍스트입니다.
     * 생략 시 accessorKey가 대체됩니다.
     */
    Header?: string;

    /**
     * 컬럼 헤더를 커스터마이징하는 함수입니다.
     * 컬럼 헤더를 사용자 정의 JSX 요소로 렌더링할 수 있습니다.
     */
    header?: (info: any) => JSX.Element;

    /**
     * 컬럼에 사용될 데이터의 키(key)입니다.
     */
    accessorKey: string;
      /**
     * 컬럼에 사용될 데이터의 키(key)입니다. accessorKey를 다치기힘들면 이것만치세요
     */

    /**
     * 컬럼의 순서 변경 기능을 사용할지 여부를 나타냅니다.
     */
    enableOrdering?: boolean;

    /**
     * 컬럼의 크기를 조정할 수 있는지 여부를 나타냅니다.
     * 기본값은 true입니다.
     */
    enableResizing?: boolean;

    /**
     * 컬럼을 숨길 수 있는지 여부를 나타냅니다.
     * 기본값은 true입니다.
     */
    enableHiding?: boolean;

    /**
     * 컬럼의 정렬 기능 사용 여부를 나타냅니다.
     * 기본값은 true입니다.
     */
    useSort?: boolean;

    /**
     * 컬럼의 필터 기능 사용 여부를 나타냅니다.
     * 기본값은 true입니다.
     */
    useFilter?: boolean;

    /**
     * 컬럼어 default filter value입니다
     * number value의 경우 min max
     * **/
    filterValue?: string | any[];

    /**
     * 컬럼의 표시 여부를 나타냅니다.
     * 기본값은 true입니다.
     */
    show?: boolean;

    /**
     * 컬럼의 너비입니다.
     */
    width?: number;

    /**
     * 데이터를 변환하는 함수입니다.
     * 특정 형식으로 데이터를 가공할 수 있습니다.
     */
    accessorFn?: (row: any) => any;

    /**
     * 컬럼 셀에 표시할 사용자 정의 컴포넌트입니다.
     */
    cell?: (info: any) => JSX.Element;

}


/**
*   - row: 행 관련 옵션 설정입니다.
*       - selRowBackground: 선택된 행의 배경색입니다. (기본값: '#fff')
*       - multipleSelRowCheckbox: 다중 선택 행의 체크박스 사용 여부입니다. (기본값: false)
*   - column: 컬럼 관련 옵션 설정입니다.
*       - resizing: 컬럼 크기 조절 기능을 사용할지 여부입니다. (기본값: true)
*       - ordering: 컬럼 순서 변경 기능을 사용할지 여부입니다. (기본값: true)
*   - pagination: 페이징 옵션을 설정합니다.
*       - paginationArr: 페이지 번호 배열입니다.
*       - defaultPageSize: 기본 페이지 크기입니다.
*   - toolbar: 툴바 옵션 설정입니다.
*       - globalfilter: 전역 필터 기능을 사용할지 여부입니다.
*       - defaultToolbar: 기본 툴바를 사용할지 여부입니다.
*       - columnAttributeButton: 컬럼 속성 버튼을 표시할지 여부입니다.

**/
interface GPtableOption {
    autoSavetableName?: string;
    row?: {
        selRowColor?: string;
        selRowBackground?: string;
        multipleSelRowCheckbox?: boolean;
        rememberSelRow?: boolean;
        hoverRowColor?: string;
        hoverRowBackground?: string;
    }
    column?: {
        resizing?: boolean;
        ordering?: boolean;
    }
    /**
      아무것도 안넣으면 pagination false.. default
    **/
    pagination?: {
        paginationArr?: Array<number>;
        defaultPageSize?: number;
    }
    toolbar?: {
        globalfilter?: boolean;
        columnAttributeButton?: boolean;
        saveExcelButton?: boolean;
    }
}

interface GPtableProps<T> {
    className?: string;
    /**
     *
     * column 설명 여기에추가해줘
     * @see {@link Column}
     * **/
    column: GPColumn[]; // 여기서 컬럼의 타입을 정확히 지정해야 합니다.
    data: T[]; // 데이터의 타입도 정확히 지정해야 합니다.

    onCheckRow?:(rows: any[] )=>any;


    onClickRow?: (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>, row: any , cell:any) => void; // 클릭된 행의 타입을 정확히 지정해야 합니다.
    /**
    *   - row: 행 관련 옵션 설정입니다.
    *       - selRowBackground: 선택된 행의 배경색입니다. (기본값: '#fff')
    *       - multipleSelRowCheckbox: 다중 선택 행의 체크박스 사용 여부입니다. (기본값: false)
    *   - column: 컬럼 관련 옵션 설정입니다.
    *       - resizing: 컬럼 크기 조절 기능을 사용할지 여부입니다. (기본값: true)
    *       - ordering: 컬럼 순서 변경 기능을 사용할지 여부입니다. (기본값: true)
    *   - pagination: 페이징 옵션을 설정합니다.
    *       - paginationArr: 페이지 번호 배열입니다.
    *       - defaultPageSize: 기본 페이지 크기입니다.
    *   - toolbar: 툴바 옵션 설정입니다.
    *       - globalfilter: 전역 필터 기능을 사용할지 여부입니다.
    *       - defaultToolbar: 기본 툴바를 사용할지 여부입니다.
    *       - columnAttributeButton: 컬럼 속성 버튼을 표시할지 여부입니다.
    *       - render: 툴바를 렌더링하는 함수입니다.
    **/
    option?: GPtableOption

    toolbar?: () => JSX.Element;
}// 컬럼의 타입 정의



declare const GPtable: ForwardRefExoticComponent<GPtableProps<any>>;

export { GPtable };
export type { GPTableInstance, GPtableProps ,GPColumn2,GPColumn  ,GPtableOption};
