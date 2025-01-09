"use client";
import React, { useEffect, useRef, ReactNode, CSSProperties } from 'react';
import "./DropDown.scss";

interface DropdownProps {
    // buttonRef: React.RefObject<HTMLButtonElement>;

    children: ReactNode;
    defaultShow: boolean;
    close: () => void;
    btnRender: () => ReactNode;
    triangleStyle ?: CSSProperties;
    maxHeight?: string;
    // onClose?: () => void; // onClose 콜백 함수 타입 추가
    //   onClose?:function;
}

const Dropdown: React.FC<DropdownProps> = ({ maxHeight,triangleStyle,close, btnRender, defaultShow, children }) => {

    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleOutsideClick = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            close();
        }
    };

    useEffect(() => {
        if (defaultShow) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [defaultShow]);


    return (
        <div className={`dropDown`} ref={dropdownRef} >
            {btnRender && btnRender()}
            {defaultShow &&
                <div className="dropDownWrap">
                    <div className="dropDown-triangle" style={{...triangleStyle}}/>
                    <div className="dropDown-content" style={{maxHeight:`${maxHeight}`}}>
                        {children}
                    </div>
                </div>
            }


        </div>
    );
};

export default Dropdown;
