import React from 'react';
import styled from 'styled-components';

interface SVGBTNProps {
    onClick: () => void;
    direction?: string;
}
const SVGBtn = styled.div<SVGBTNProps>`
    width: 15px;
    height: 15px;
    background-color: transparent;
    color: gray;
    display: flex;
    align-items: center;
    cursor: pointer;
    border: 1px solid gray;
    box-sizing: border-box;
    justify-content: center;

    &:hover {
        &, * {
            cursor: pointer !important;
  
            fill:lightgray;
        }
    }
`;

const SVGBTN: React.FC<SVGBTNProps> = ({ onClick, direction, ...props }) => {
    return (
        <SVGBtn {...props} onClick={onClick}>
            {/* degree prop을 사용하지 않도록 수정 */}
            <svg 
                style={{
                    width:'80%',
                    transform:`rotate(${direction === 'up' ? '180deg' : '0deg'})`
                }}
                fill="currentColor"viewBox="0 0 255 255">
                <polygon points="0,63.75 127.5,191.25 255,63.75" />
            </svg>
        </SVGBtn>
    );
};

export default SVGBTN;
