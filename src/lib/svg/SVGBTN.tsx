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
    // margin: 1px;
    // margin-right: 4px;
    // cursor: pointer;
    &:hover {
        // cursor: pointer !important;
        // background: red;
    }
`;

const StyledSVG = styled.svg<StyledSVGProps>`
    width: 80%;
    fill: currentColor;
    transform: ${({ degree }) => `rotate(${degree})`};

    polygon:hover {
        // fill: blue; // 원하는 hover 효과 스타일 지정
        // cursor:pointer;
    }
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
            <StyledSVG degree={degree} viewBox="0 0 255 255">
                <polygon points="0,63.75 127.5,191.25 255,63.75" />
            </StyledSVG>
        </SVGBtn>
    );
};

export default SVGBTN;
