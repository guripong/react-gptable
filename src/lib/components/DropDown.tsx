import React, { useState, useEffect, useRef, ReactNode } from 'react';
import "./DropDown.scss";

interface DropdownProps {
    buttonRef: React.RefObject<HTMLButtonElement>;
    show?: boolean;
    children: ReactNode;
    onClose?: () => void; // onClose 콜백 함수 타입 추가
    //   onClose?:function;
}

const Dropdown: React.FC<DropdownProps> = ({ show, buttonRef, children, onClose }) => {
    const [isOpen, setIsOpen] = useState(show || false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // if (show) {
        setIsOpen(show || false);

    }, [show])

    const handleOutsideClick = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
            if (onClose) {
                onClose();
            }

        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen]);

    useEffect(() => {
        if (buttonRef.current && dropdownRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const dropdownRect = dropdownRef.current.getBoundingClientRect();
      
            const buttonCenterX = buttonRect.left + buttonRect.width / 2;
            const buttonCenterY = buttonRect.top + buttonRect.height / 2;
      
            const dropdownWidth = dropdownRect.width;
            const dropdownHeight = dropdownRect.height;
      
            dropdownRef.current.style.left = `${buttonRect.left - (dropdownWidth / 2 - buttonRect.width / 2)}px`;
            dropdownRef.current.style.top = `${buttonCenterY - dropdownHeight / 2}px`;
          }
    }, [buttonRef]);

    return (
        <div className="dropDown" ref={dropdownRef}>
            {isOpen && (
                <div className="dropDownWrap">
                    <div className="dropDown-triangle" />
                    <div  className="dropDown-content">

                        {children}
                    </div>
                </div>

            )}
        </div>
    );
};

export default Dropdown;
