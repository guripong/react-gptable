import { GPColumn } from "lib/GPTableTypes";
export function loadTable(originArr: GPColumn[],name:string): GPColumn[] {
  let load_columns: any = localStorage.getItem(`GP_${name}`);
  if (load_columns) {
    load_columns = JSON.parse(load_columns);
  }
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
    return originArr;
  } else {
    return originArr;
  }
}
