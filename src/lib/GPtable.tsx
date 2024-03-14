import React,{ forwardRef } from 'react';
import { GPprops } from './GPprops';

const GPtable = forwardRef<HTMLDivElement , GPprops>((props, ref) => {
    const {a,b,c} = props;

  return (
    <div ref={ref}>
      안녕하세요 {a}{b}{c.a}
    </div>
  );
});

export default GPtable;