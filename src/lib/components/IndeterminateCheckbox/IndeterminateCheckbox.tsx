import styled from 'styled-components';
import { HTMLProps, useEffect, useRef } from 'react';

// 스타일드 컴포넌트 정의
const CheckboxInput = styled.input`
  /* 체크박스의 크기 조정 */
  width: 24px;
  height: 24px;
  cursor: pointer; /* 마우스 커서를 포인터로 변경 */
`;

// 인풋 태그를 감싸는 래퍼 스타일드 컴포넌트 정의
const CheckboxWrapper = styled.div`
  /* 추가 스타일을 적용할 부분 */
`;

// 인더터미네이트 체크박스 컴포넌트
function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <CheckboxWrapper className={className}>
      <CheckboxInput type="checkbox" ref={ref} {...rest} />
    </CheckboxWrapper>
  );
}

export default IndeterminateCheckbox;
