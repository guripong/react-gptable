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

// GPprops 인터페이스 정의
interface GPtableProps {
    className?: string;
    column: ColumnDef<any, any>[]; // 여기서 컬럼의 타입을 정확히 지정해야 합니다.
    data: any[]; // 데이터의 타입도 정확히 지정해야 합니다.

    onClickRow?: (e: MouseEvent, row: any) => void; // 클릭된 행의 타입을 정확히 지정해야 합니다.
    option?: {
      
        // pagination?: boolean;
        pagination?:{
            paginationArr?: Array<number>;
            defaultPageSize?:number;
        }
        toolbar?:{
            globalfilter?: boolean;
            defaultToolbar?: boolean;
            columnAttributeButton?: boolean;
            toolbar?: () => JSX.Element;
        }
    }
}// 컬럼의 타입 정의


// GPtable 컴포넌트 타입 선언
// declare const GPtable: ForwardRefExoticComponent<GPtableProps & RefAttributes<GPTableInstance>>;
declare const GPtable: ForwardRefExoticComponent<GPtableProps>;
export { GPtable };
export type { GPTableInstance, GPtableProps };