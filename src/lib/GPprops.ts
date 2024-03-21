import { ColumnDef, useReactTable } from '@tanstack/react-table';
import { ForwardRefExoticComponent } from 'react';
// import { RefAttributes } from 'react';

interface GPTableInstance {
    /**
    * 숫자를 입력받아 1을 더한 값을 반환합니다.
    * @param value 입력으로 받는 숫자
    * @returns 1을 더한 값
    */
    test: (value: number) => number;
    power: () => string;
    getGPtableElementRef: () => HTMLDivElement | null;
    getTable: () => ReturnType<typeof useReactTable>;
    forceRerender: () => void;
    set_columnOrder: ([]:Array<any>) => void;
    get_columnOrder: () => any;
}



interface Column {
    accessorKey: string;            // 컬럼에 사용될 데이터의 키(key)
    enableResizing?: boolean;       // 컬럼의 크기를 조정할 수 있는지 여부 (기본값: true)
    useSort?: boolean;              // 정렬 기능 사용 여부 (기본값: true)
    useFilter?: boolean;            // 필터 기능 사용 여부 (기본값: true)
    enableHiding?: boolean;         // 숨기기 기능 사용 여부 (기본값: true)
    width?: number;                 // 컬럼의 너비 (옵션)
    Header?: string;                // 컬럼 헤더에 표시할 텍스트 (옵션, 생략 시 accessorKey로 대체됨)
    accessorFn?: (row: any) => any; // 데이터 변환 함수 (옵션)
    cell?: (info: any) => JSX.Element; // 컬럼 셀에 표시할 사용자 정의 컴포넌트 (옵션)
    type?: string;                  // 컬럼 타입 (옵션)
}

interface GPtableProps<T> {
    className?: string;
    /**
     * 
     * column 설명 여기에추가해줘
     * @see {@link Column}
     * **/
    column: Column[]; // 여기서 컬럼의 타입을 정확히 지정해야 합니다.
    data: T[]; // 데이터의 타입도 정확히 지정해야 합니다.

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
    option?: {
        row?:{
            selRowColor?:string;
            selRowBackground?:string;
            multipleSelRowCheckbox?:boolean;
        }
        column?:{
            resizing?:boolean;
            ordering?:boolean;
        }
        /**
          아무것도 안넣으면 pagination false.. default
        **/
        pagination?:{
            paginationArr?: Array<number>;
            defaultPageSize?:number;
        }
        toolbar?:{
            globalfilter?: boolean;
            defaultToolbar?: boolean;
            columnAttributeButton?: boolean;
            render?: () => JSX.Element;
        }
    }
}// 컬럼의 타입 정의


   
declare const GPtable: ForwardRefExoticComponent<GPtableProps<any>>;

export { GPtable };
export type { GPTableInstance, GPtableProps };