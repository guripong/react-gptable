import { ForwardRefExoticComponent } from 'react';
import { RefAttributes } from 'react';

// GPprops 인터페이스 정의
export interface GPprops {
    a: string;
    b: number;
    c: {
        a: number;
        b: string;
    };
}

// GPtable 컴포넌트 타입 선언
declare const GPtable: ForwardRefExoticComponent<GPprops & RefAttributes<HTMLDivElement>>;
export default GPtable;