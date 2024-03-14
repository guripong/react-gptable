import { ColumnDef } from '@tanstack/react-table';
import { ForwardRefExoticComponent } from 'react';
import { RefAttributes } from 'react';

// GPprops 인터페이스 정의
export interface GPtableProps {
    className?: string;
    columns: ColumnDef<any, any>[]; // 여기서 컬럼의 타입을 정확히 지정해야 합니다.
    data: any[]; // 데이터의 타입도 정확히 지정해야 합니다.
    defaultPageSize?: number;
    pagination?: boolean;
    defaultToolbar?: boolean;
    toolbar?: () => JSX.Element;
    onClickRow?: (e: MouseEvent, row: any) => void; // 클릭된 행의 타입을 정확히 지정해야 합니다.
}// 컬럼의 타입 정의



// GPtable 컴포넌트 타입 선언
declare const GPtable: ForwardRefExoticComponent<GPtableProps & RefAttributes<HTMLDivElement>>;
export default GPtable;