import GPtable from "./GPtable";
import { GPprops } from "./GPprops"; // GPprops를 정의한 파일로의 경로를 사용해야 합니다.

// Main library exports - these are packaged in your distributable
const isOdd = (n: number): boolean => {
  return !!(n & 1);
};

export { GPtable, isOdd  };
export type {GPprops};