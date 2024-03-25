import React from 'react';
import styled, { keyframes } from 'styled-components';

// 회전 애니메이션 키프레임 정의
const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// 스타일된 컴포넌트 정의
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height:150px;
`;

const Loader = styled.div`
  border: 6px solid #f3f3f3; /* Light grey */
  border-top: 6px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spinAnimation} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: 10px;
`;

const Loading: React.FC = () => {
  return (
    <LoadingContainer>
      <Loader />
      <LoadingText>Loading...</LoadingText>
    </LoadingContainer>
  );
};

export default Loading;
