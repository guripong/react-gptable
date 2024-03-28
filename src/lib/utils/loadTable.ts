import { GPColumn } from "lib/GPTableTypes";
type LoadTableResult = {
  columns: GPColumn[]; // 로드된 컬럼 배열
  pageSize: number | null; // 로드된 페이지 크기 또는 null
};

export function loadTable(originArr: GPColumn[],name:string): LoadTableResult {
  let load: any = localStorage.getItem(`GP_${name}`);
  if (load) {
    load = JSON.parse(load);
  }
  const load_columns = load.columns;
  const pageSize = load.pageSize;

  if (load_columns) {
    //order 맞게 배열
    originArr.sort((a, b) => {
      const aIndex = load_columns.findIndex((d: GPColumn) => d.accessorKey === a.accessorKey);
      const bIndex = load_columns.findIndex((d: GPColumn) => d.accessorKey === b.accessorKey);
      // load_columns에 없는 accessorKey는 후순위로 정렬
      if (aIndex === -1 && bIndex === -1) {
        return 0;
      } else if (aIndex === -1) {
        return 1;
      } else if (bIndex === -1) {
        return -1;
      }

      return aIndex - bIndex;
    });
    // width 와 show값 재할당
    for (let i = 0; i < originArr.length; i++) {
      let find = load_columns.find((d: any) => d.accessorKey === originArr[i].accessorKey);
      if (find) {
        originArr[i] = {
          ...originArr[i],
          ...find
        };
      }
    }
    return {
      columns:originArr,
      pageSize:pageSize
    };
  } else {
    return {
      columns:originArr,
      pageSize:null
    }
  }
}
