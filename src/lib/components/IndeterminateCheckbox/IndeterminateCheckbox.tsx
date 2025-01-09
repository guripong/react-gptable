"use client";
import React,{ HTMLProps, useEffect, useRef } from 'react';

// 스타일드 컴포넌트 정의


// 인더터미네이트 체크박스 컴포넌트
function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      // console.log("동작")
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <div className={className} >
      <input type="checkbox" ref={ref} {...rest}
        style={{width:24,height:24,cursor:"pointer"}}
      />
    </div>
  );
}

export default IndeterminateCheckbox;
