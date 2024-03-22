import React, { useMemo } from 'react';
import styled from 'styled-components';

interface SVGBTNProps {
    onClick: () => void;
    direction?: string;
}

interface SVGBtnProps {
    direction?: string;
}

interface StyledSVGProps {
    degree: string;
}

const SVGBtn = styled.div<SVGBtnProps>`
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
        // cursor: pointer !important;
        // background: red;
    }
`;

// styled-components에서 'degree' prop을 사용하지 않도록 설정
const StyledSVG = styled.svg<StyledSVGProps>`
    width: 80%;
    fill: currentColor;
    transform: ${({ degree }) => `rotate(${degree})`};
`;

const SVGBTN: React.FC<SVGBTNProps> = ({ onClick, direction, ...props }) => {
    const degree = useMemo(() => {
        if (direction === 'up') {
            return '180deg';
        } else {
            return '0deg';
        }
    }, [direction]);

    return (
        <SVGBtn {...props} onClick={onClick}>
            {/* degree prop을 사용하지 않도록 수정 */}
            <StyledSVG degree={degree} viewBox="0 0 255 255">
                <polygon points="0,63.75 127.5,191.25 255,63.75" />
            </StyledSVG>
        </SVGBtn>
    );
};

export default SVGBTN;
