import { useCallback, useState } from "react";
import { useReactTable } from "@tanstack/react-table";
import BounceCheckBox from "../components/BounceCheckbox/BounceCheckBox";
import DebouncedInput from "../components/DebouncedInput/DebouncedInput";
// import DebouncedInput from "lib/components/DebouncedInput/DebouncedInput";
import Dropdown from "../components/DropDown/DropDown";
import SVGBTN from "../svg/SVGBTN";
import { GPColumn } from "lib/GPTableTypes";

interface GPtableToolbarProps {
    data:any[],
    globalfilter: boolean | undefined;
    saveExcelButton: boolean | undefined;
    globalFilter: string | null;
    setGlobalFilter: (value: string) => void;
    toolbarRender: (() => JSX.Element) | null | undefined;
    setColumnOrder: (newOrder: string[]) => void;
    columnAttributeButton: boolean | undefined;
    resetAllColumnAttributes: () => void;
    table: ReturnType<typeof useReactTable>; // 테이블 관련 데이터 및 메서드에 대한 타입 (실제로 사용되는 타입에 따라 세부적으로 정의해야 함)
    enableOrderingColumn: boolean;

}

const GPtableToolbar: React.FC<GPtableToolbarProps> = (props) => {
    const { globalfilter, saveExcelButton,
        globalFilter, setGlobalFilter,
        toolbarRender, setColumnOrder,
        columnAttributeButton, resetAllColumnAttributes,
        table,data,
        enableOrderingColumn } = props;

    const [showColumnAttribute, set_showColumnAttribute] = useState<boolean>(false);
    const [showExcelDownloadList, set_showExcelDownloadList] = useState<boolean>(false);
    const rearrangeColumns = useCallback((targetId: string, direction: string) => {
        const allColumns = table.getAllLeafColumns();
        // console.log("allColumns",allColumns)
        const idArr = allColumns.map((d: any) => d.id);
        const newOrder = [...idArr]; // 현재 컬럼 순서를 복사하여 새로운 배열 생성
        // console.log("idArr",idArr2);
        const targetIndex = newOrder.indexOf(targetId);
        let ischanged: boolean = false;
        if (direction === "up" && newOrder[targetIndex - 1]) {
            // "up" 버튼을 누르고 현재 인덱스가 0보다 크면
            // console.log("newOrder[targetIndex - 1]",newOrder[targetIndex - 1])
            // console.log(allColumns.find(d=>d.id===newOrder[targetIndex - 1]));

            const columndDef: any = allColumns.find(d => d.id === newOrder[targetIndex - 1])?.columnDef;
            console.log("columndDef.enableOrdering", columndDef.enableOrdering)
            if (columndDef.enableOrdering === false) {
                return;
            }

            const temp = newOrder[targetIndex - 1];
            newOrder[targetIndex - 1] = newOrder[targetIndex];
            newOrder[targetIndex] = temp;
            ischanged = true;
        } else if (direction === "down" && newOrder[targetIndex + 1]) {
            // "down" 버튼을 누르고 현재 인덱스가 배열의 마지막 인덱스가 아니면
            const columndDef: any = allColumns.find(d => d.id === newOrder[targetIndex + 1])?.columnDef;
            if (columndDef.enableOrdering === false) {
                return;
            }


            const temp = newOrder[targetIndex + 1];
            newOrder[targetIndex + 1] = newOrder[targetIndex];
            newOrder[targetIndex] = temp;
            ischanged = true;
        }

        if (ischanged) {
            setColumnOrder(newOrder);
        }
    }, []);


    const downloadcsv = useCallback((option:string) => {
        //option = all or visible or checked
        //"multipleSelRowCheckbox"
        // 데이터에 쉼표가 포함된 경우, 따옴표로 감싸는 함수
        function escapeDataIfNeeded(data:string) {
            if (typeof data !== 'string') {
                return data;
            }
            
            // 만약 데이터에 쉼표가 없다면, 그대로 반환
            if (!data.includes(',')) {
                return data;
            }
            // 데이터에 쉼표가 있는 경우, 따옴표로 감싸서 반환
            return `"${data}"`;
        }

        // console.log("table.getSelectedRowModel()",table.getSelectedRowModel().flatRows[0].original)
        const selRows=table.getSelectedRowModel().flatRows.map(d=>d.original);
        const viewRows= table.getRowModel().rows.map(d=>d.original);
        const allRows = [...data];
        let rows=null;
        if(option==="checked"){
            rows=selRows;
        }
        else{
            rows=allRows;
        }


        // console.log("allRows",allRows)
        // console.log("selRows",selRows)
        const allColumns = table.getAllLeafColumns();
        const csvRows = [];
        let headerRow = [];
        console.log(allColumns);

        for (let i = 0; i < allColumns.length; i++) {
            const columnDef: any = allColumns[i].columnDef;
            // console.log("columnDef", columnDef)
            if (columnDef.accessorKey === "multipleSelRowCheckbox") {
                continue;
            }

            if (option === 'visible') {
                if (allColumns[i].getIsVisible() === true) {
                    headerRow.push(escapeDataIfNeeded(columnDef.Header) ?? escapeDataIfNeeded(columnDef.accessorKey));
                }
            }
            else if (option === 'all') {
                headerRow.push(escapeDataIfNeeded(columnDef.Header) ?? escapeDataIfNeeded(columnDef.accessorKey));
            }

        }
        csvRows.push(headerRow);

        console.log("csvRows",csvRows);
        console.log("rows",rows)
        for(let i = 0 ; i<rows.length; i++){
            const oneRow = [];
            for(let j = 0 ; j < allColumns.length; j++){
                const columnDef: any = allColumns[j].columnDef;
                if (columnDef.accessorKey === "multipleSelRowCheckbox") {
                    continue;
                }
                if (option === 'visible') {
                    if (allColumns[i].getIsVisible() === true) {
                        oneRow.push(escapeDataIfNeeded(rows[i][columnDef.accessorKey]??''));
                    }
                }
                else if (option === 'all') {
                    oneRow.push(escapeDataIfNeeded(rows[i][columnDef.accessorKey]??''));
                }
            }
            csvRows.push(oneRow);
        }
        console.log("csvRows",csvRows);
        var BOM = "\uFEFF";
        let csvdata = BOM + csvRows.map(e => e.join(",")).join("\n");
        const csvData = new Blob([csvdata], { type: 'text/csv;charset=utf-8;' });
        console.log("csvData",csvData)
        
        // CSV 파일 다운로드
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(csvData);
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        /*
        // console.log(data);
     

        var BOM = "\uFEFF";
        let csvdata = BOM + csvRows.map(e => e.join(",")).join("\n");
        const csvData = new Blob([csvdata], { type: 'text/csv;charset=utf-8;' });
        // FileSaver.saveAs(csvData, option + '_data.csv');
        */

    },[table,data]);

    

    return (<div className="tableToolbar">
        {globalfilter &&
            <div className="global-filter">
                <DebouncedInput
                    value={globalFilter ?? ''}

                    onChange={value => setGlobalFilter(String(value))}
                    className="gp_input"
                    placeholder={`${table.getPrePaginationRowModel().rows.length}rows 전체검색`}
                />
            </div>
        }
        {toolbarRender && toolbarRender()}
        {saveExcelButton &&
            <Dropdown
                defaultShow={showExcelDownloadList}
                close={() => set_showExcelDownloadList(false)}
                triangleStyle={{ right: "35px" }}
                btnRender={() => {

                    return (<><button className="btn" onClick={() => set_showExcelDownloadList(d => !d)}>
                         <svg className={showExcelDownloadList ? "shiver" : ""} version="1.0" xmlns="http://www.w3.org/2000/svg" style={{ height: '40%' }}
                                    viewBox="0 0 1250.000000 1280.000000"
                                    preserveAspectRatio="xMidYMid meet">
                                    <g transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)"
                                        fill="currentColor" stroke="none">
                                        <path d="M0 6400 l0 -6400 6250 0 6250 0 -1 5368 0 5367 -1047 1032 -1047
                                    1033 -5202 0 -5203 0 0 -6400z m9390 3555 l0 -1935 -3140 0 -3140 0 0 1935 0
                                    1935 3140 0 3140 0 0 -1935z m1370 -6450 l0 -2455 -4510 0 -4510 0 0 2455 0
                                    2455 4510 0 4510 0 0 -2455z"/>
                                        <path d="M7210 9955 l0 -1205 695 0 695 0 0 1205 0 1205 -695 0 -695 0 0
                                    -1205z"/>
                                        <path d="M2650 4845 l0 -295 3600 0 3600 0 0 295 0 295 -3600 0 -3600 0 0
                                    -295z"/>
                                        <path d="M2652 3518 l3 -293 3595 0 3595 0 3 293 2 292 -3600 0 -3600 0 2
                                    -292z"/>
                                        <path d="M2650 2110 l0 -290 3600 0 3600 0 0 290 0 290 -3600 0 -3600 0 0
                                    -290z"/>
                                    </g>
                                </svg>
                        &nbsp;다운로드
                    </button></>)
                }} >
                {showExcelDownloadList &&
                    <>
                        <button className="btn-download"  onClick={() => downloadcsv('all')}>
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                x="0px" y="0px" viewBox="0 0 115.28 122.88" xmlSpace="preserve" 
                                style={{
                                    fillRule: "evenodd", clipRule: "evenodd", height: '20px'
                                    , color: 'green'
                                }}
                                fill="currentColor">
                                <g><path d="M25.38,57h64.88V37.34H69.59c-2.17,0-5.19-1.17-6.62-2.6c-1.43-1.43-2.3-4.01-2.3-6.17V7.64l0,0H8.15 c-0.18,0-0.32,0.09-0.41,0.18C7.59,7.92,7.55,8.05,7.55,8.24v106.45c0,0.14,0.09,0.32,0.18,0.41c0.09,0.14,0.28,0.18,0.41,0.18 c22.78,0,58.09,0,81.51,0c0.18,0,0.17-0.09,0.27-0.18c0.14-0.09,0.33-0.28,0.33-0.41v-11.16H25.38c-4.14,0-7.56-3.4-7.56-7.56 V64.55C17.82,60.4,21.22,57,25.38,57L25.38,57z M45.88,82.35l6.29,1.9c-0.42,1.76-1.09,3.24-2,4.42c-0.91,1.18-2.03,2.08-3.38,2.68 c-1.35,0.6-3.06,0.9-5.14,0.9c-2.53,0-4.59-0.37-6.19-1.1c-1.6-0.74-2.98-2.03-4.14-3.87c-1.16-1.84-1.75-4.21-1.75-7.09 c0-3.84,1.02-6.79,3.06-8.85c2.05-2.06,4.94-3.09,8.68-3.09c2.92,0,5.23,0.59,6.9,1.77c1.67,1.18,2.92,3,3.73,5.45l-6.32,1.4 c-0.22-0.7-0.45-1.22-0.7-1.54c-0.41-0.55-0.9-0.97-1.48-1.26c-0.58-0.3-1.23-0.44-1.95-0.44c-1.63,0-2.88,0.65-3.75,1.96 c-0.65,0.97-0.98,2.49-0.98,4.56c0,2.57,0.39,4.33,1.17,5.29c0.78,0.95,1.88,1.43,3.3,1.43c1.37,0,2.41-0.38,3.11-1.16 C45.06,84.93,45.56,83.82,45.88,82.35L45.88,82.35z M54.47,84.17l6.81-0.43c0.15,1.1,0.45,1.95,0.9,2.52 c0.74,0.94,1.79,1.41,3.17,1.41c1.02,0,1.81-0.24,2.36-0.72c0.56-0.48,0.83-1.04,0.83-1.67c0-0.6-0.26-1.14-0.78-1.62 c-0.52-0.48-1.75-0.92-3.66-1.35c-3.15-0.7-5.38-1.64-6.72-2.82c-1.35-1.17-2.03-2.66-2.03-4.48c0-1.19,0.35-2.31,1.04-3.37 c0.69-1.06,1.73-1.9,3.12-2.5c1.39-0.61,3.29-0.91,5.71-0.91c2.97,0,5.23,0.55,6.78,1.66c1.56,1.1,2.48,2.86,2.78,5.27l-6.75,0.4 c-0.18-1.05-0.56-1.82-1.13-2.3c-0.58-0.48-1.37-0.72-2.38-0.72c-0.83,0-1.46,0.18-1.89,0.53c-0.42,0.35-0.63,0.78-0.63,1.29 c0,0.37,0.17,0.7,0.51,0.99c0.33,0.31,1.13,0.59,2.39,0.85c3.14,0.68,5.38,1.36,6.73,2.05c1.36,0.69,2.35,1.55,2.96,2.57 c0.62,1.02,0.92,2.17,0.92,3.44c0,1.49-0.41,2.86-1.23,4.12c-0.83,1.25-1.97,2.21-3.45,2.86c-1.48,0.65-3.34,0.97-5.58,0.97 c-3.95,0-6.68-0.76-8.2-2.28C55.53,88.44,54.67,86.51,54.47,84.17L54.47,84.17z M76.91,68.63h7.5l5.23,16.71l5.16-16.71h7.28 l-8.62,23.22h-7.77L76.91,68.63L76.91,68.63z M97.79,57h9.93c4.16,0,7.56,3.41,7.56,7.56v31.42c0,4.15-3.41,7.56-7.56,7.56h-9.93 v13.55c0,1.61-0.65,3.04-1.7,4.1c-1.06,1.06-2.49,1.7-4.1,1.7c-29.44,0-56.59,0-86.18,0c-1.61,0-3.04-0.64-4.1-1.7 c-1.06-1.06-1.7-2.49-1.7-4.1V5.85c0-1.61,0.65-3.04,1.7-4.1c1.06-1.06,2.53-1.7,4.1-1.7h58.72C64.66,0,64.8,0,64.94,0 c0.64,0,1.29,0.28,1.75,0.69h0.09c0.09,0.05,0.14,0.09,0.23,0.18l29.99,30.36c0.51,0.51,0.88,1.2,0.88,1.98 c0,0.23-0.05,0.41-0.09,0.65V57L97.79,57z M67.52,27.97V8.94l21.43,21.7H70.19c-0.74,0-1.38-0.32-1.89-0.78 C67.84,29.4,67.52,28.71,67.52,27.97L67.52,27.97z" />
                                </g>
                            </svg>&nbsp;전체 column
                        </button>

                        
                        <button className="btn-download"  onClick={() => downloadcsv('visible')}>
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                x="0px" y="0px" viewBox="0 0 115.28 122.88" xmlSpace="preserve" style={{
                                    fillRule: "evenodd", clipRule: "evenodd", height: '20px'
                                    , color: 'green'
                                }}
                                fill="currentColor">
                                <g><path d="M25.38,57h64.88V37.34H69.59c-2.17,0-5.19-1.17-6.62-2.6c-1.43-1.43-2.3-4.01-2.3-6.17V7.64l0,0H8.15 c-0.18,0-0.32,0.09-0.41,0.18C7.59,7.92,7.55,8.05,7.55,8.24v106.45c0,0.14,0.09,0.32,0.18,0.41c0.09,0.14,0.28,0.18,0.41,0.18 c22.78,0,58.09,0,81.51,0c0.18,0,0.17-0.09,0.27-0.18c0.14-0.09,0.33-0.28,0.33-0.41v-11.16H25.38c-4.14,0-7.56-3.4-7.56-7.56 V64.55C17.82,60.4,21.22,57,25.38,57L25.38,57z M45.88,82.35l6.29,1.9c-0.42,1.76-1.09,3.24-2,4.42c-0.91,1.18-2.03,2.08-3.38,2.68 c-1.35,0.6-3.06,0.9-5.14,0.9c-2.53,0-4.59-0.37-6.19-1.1c-1.6-0.74-2.98-2.03-4.14-3.87c-1.16-1.84-1.75-4.21-1.75-7.09 c0-3.84,1.02-6.79,3.06-8.85c2.05-2.06,4.94-3.09,8.68-3.09c2.92,0,5.23,0.59,6.9,1.77c1.67,1.18,2.92,3,3.73,5.45l-6.32,1.4 c-0.22-0.7-0.45-1.22-0.7-1.54c-0.41-0.55-0.9-0.97-1.48-1.26c-0.58-0.3-1.23-0.44-1.95-0.44c-1.63,0-2.88,0.65-3.75,1.96 c-0.65,0.97-0.98,2.49-0.98,4.56c0,2.57,0.39,4.33,1.17,5.29c0.78,0.95,1.88,1.43,3.3,1.43c1.37,0,2.41-0.38,3.11-1.16 C45.06,84.93,45.56,83.82,45.88,82.35L45.88,82.35z M54.47,84.17l6.81-0.43c0.15,1.1,0.45,1.95,0.9,2.52 c0.74,0.94,1.79,1.41,3.17,1.41c1.02,0,1.81-0.24,2.36-0.72c0.56-0.48,0.83-1.04,0.83-1.67c0-0.6-0.26-1.14-0.78-1.62 c-0.52-0.48-1.75-0.92-3.66-1.35c-3.15-0.7-5.38-1.64-6.72-2.82c-1.35-1.17-2.03-2.66-2.03-4.48c0-1.19,0.35-2.31,1.04-3.37 c0.69-1.06,1.73-1.9,3.12-2.5c1.39-0.61,3.29-0.91,5.71-0.91c2.97,0,5.23,0.55,6.78,1.66c1.56,1.1,2.48,2.86,2.78,5.27l-6.75,0.4 c-0.18-1.05-0.56-1.82-1.13-2.3c-0.58-0.48-1.37-0.72-2.38-0.72c-0.83,0-1.46,0.18-1.89,0.53c-0.42,0.35-0.63,0.78-0.63,1.29 c0,0.37,0.17,0.7,0.51,0.99c0.33,0.31,1.13,0.59,2.39,0.85c3.14,0.68,5.38,1.36,6.73,2.05c1.36,0.69,2.35,1.55,2.96,2.57 c0.62,1.02,0.92,2.17,0.92,3.44c0,1.49-0.41,2.86-1.23,4.12c-0.83,1.25-1.97,2.21-3.45,2.86c-1.48,0.65-3.34,0.97-5.58,0.97 c-3.95,0-6.68-0.76-8.2-2.28C55.53,88.44,54.67,86.51,54.47,84.17L54.47,84.17z M76.91,68.63h7.5l5.23,16.71l5.16-16.71h7.28 l-8.62,23.22h-7.77L76.91,68.63L76.91,68.63z M97.79,57h9.93c4.16,0,7.56,3.41,7.56,7.56v31.42c0,4.15-3.41,7.56-7.56,7.56h-9.93 v13.55c0,1.61-0.65,3.04-1.7,4.1c-1.06,1.06-2.49,1.7-4.1,1.7c-29.44,0-56.59,0-86.18,0c-1.61,0-3.04-0.64-4.1-1.7 c-1.06-1.06-1.7-2.49-1.7-4.1V5.85c0-1.61,0.65-3.04,1.7-4.1c1.06-1.06,2.53-1.7,4.1-1.7h58.72C64.66,0,64.8,0,64.94,0 c0.64,0,1.29,0.28,1.75,0.69h0.09c0.09,0.05,0.14,0.09,0.23,0.18l29.99,30.36c0.51,0.51,0.88,1.2,0.88,1.98 c0,0.23-0.05,0.41-0.09,0.65V57L97.79,57z M67.52,27.97V8.94l21.43,21.7H70.19c-0.74,0-1.38-0.32-1.89-0.78 C67.84,29.4,67.52,28.71,67.52,27.97L67.52,27.97z" />
                                </g>
                            </svg>&nbsp;보이는 column
                        </button>
                    </>
                }

            </Dropdown>
        }
        {columnAttributeButton &&
            <Dropdown
                // maxHeight="400px"
                defaultShow={showColumnAttribute}
                close={() => set_showColumnAttribute(false)}
                triangleStyle={{ right: "40px" }}
                btnRender={() => {

                    return (<><button className="btn" onClick={() => set_showColumnAttribute(d => !d)}>
                        <svg version="1.1" style={{
                            height: '50%', transition: 'transform .3s ease-in-out',
                            transform: showColumnAttribute ? 'rotate(90deg)' : ''
                        }}
                            viewBox="0 0 512 512" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            fill="currentColor">
                            <path d="M424.5,216.5h-15.2c-12.4,0-22.8-10.7-22.8-23.4c0-6.4,2.7-12.2,7.5-16.5l9.8-9.6c9.7-9.6,9.7-25.3,0-34.9l-22.3-22.1 
                           c-4.4-4.4-10.9-7-17.5-7c-6.6,0-13,2.6-17.5,7l-9.4,9.4c-4.5,5-10.5,7.7-17,7.7c-12.8,0-23.5-10.4-23.5-22.7V89.1  c0-13.5-10.9-25.1-24.5-25.1h-30.4c-13.6,0-24.4,11.5-24.4,25.1v15.2c0,12.3-10.7,22.7-23.5,22.7c-6.4,0-12.3-2.7-16.6-7.4l-9.7-9.6  c-4.4-4.5-10.9-7-17.5-7s-13,2.6-17.5,7L110,132c-9.6,9.6-9.6,25.3,0,34.8l9.4,9.4c5,4.5,7.8,10.5,7.8,16.9  c0,12.8-10.4,23.4-22.8,23.4H89.2c-13.7,0-25.2,10.7-25.2,24.3V256v15.2c0,13.5,11.5,24.3,25.2,24.3h15.2  c12.4,0,22.8,10.7,22.8,23.4c0,6.4-2.8,12.4-7.8,16.9l-9.4,9.3c-9.6,9.6-9.6,25.3,0,34.8l22.3,22.2c4.4,4.5,10.9,7,17.5,7  c6.6,0,13-2.6,17.5-7l9.7-9.6c4.2-4.7,10.2-7.4,16.6-7.4c12.8,0,23.5,10.4,23.5,22.7v15.2c0,13.5,10.8,25.1,24.5,25.1h30.4  c13.6,0,24.4-11.5,24.4-25.1v-15.2c0-12.3,10.7-22.7,23.5-22.7c6.4,0,12.4,2.8,17,7.7l9.4,9.4c4.5,4.4,10.9,7,17.5,7  c6.6,0,13-2.6,17.5-7l22.3-22.2c9.6-9.6,9.6-25.3,0-34.9l-9.8-9.6c-4.8-4.3-7.5-10.2-7.5-16.5c0-12.8,10.4-23.4,22.8-23.4h15.2  c13.6,0,23.3-10.7,23.3-24.3V256v-15.2C447.8,227.2,438.1,216.5,424.5,216.5z M336.8,256L336.8,256c0,44.1-35.7,80-80,80  c-44.3,0-80-35.9-80-80l0,0l0,0c0-44.1,35.7-80,80-80C301.1,176,336.8,211.9,336.8,256L336.8,256z"/>
                        </svg>컬럼속성
                    </button></>)
                }}
            >
                {
                    showColumnAttribute &&
                    <div className="columnAttribute" >
                        <div style={{display:"flex",justifyContent:"center",alignItems:"center",marginRight:5}}>
                      
                            <button className="btn" onClick={resetAllColumnAttributes}>컬럼 초기화</button>
                        </div>
                        <div className="onecheckColumn">
                            <BounceCheckBox
                                {...{
                                    checked: table.getIsAllColumnsVisible(),
                                    onChange: table.getToggleAllColumnsVisibilityHandler(),
                                    label: "전체토글"
                                }}
                            />
                        </div>
                        {table.getAllLeafColumns().map((column: any) => {
                            // console.log("column", column)
                            // console.log("allColumns",allColumns)
                            // column.setFilterValue("소")
                            const CD: any = column.columnDef;
                            const string = CD.Header ? CD.Header : column.id;
                            const targetID = column.id;
                            // console.log("targetID",targetID)
                            if (targetID === "multipleSelRowCheckbox") {
                                return null;
                            }
                            // if(CD.enableOrdering===false){
                            //   return null;
                            // }
                            
              

                            return (
                                <div key={column.id} className="onecheckColumn">
                                    <BounceCheckBox
                                        {...{
                                            checked: column.getIsVisible(),
                                            onChange: column.getToggleVisibilityHandler(),
                                            disabled: !CD.enableHiding,
                                            label: string
                                        }}
                                    />
                                    {enableOrderingColumn && CD.enableOrdering !== false &&
                                        <div>
                                            <SVGBTN
                                                direction="up"
                                                onClick={() => {
                                                    rearrangeColumns(targetID, "up");

                                                }} />
                                            <SVGBTN
                                                direction="down"
                                                onClick={() => {
                                                    rearrangeColumns(targetID, "down");
                                                }} />
                                        </div>
                                    }
                                </div>)
                        })}
                    </div>
                }
            </Dropdown>
        }
    </div>)
}

export default GPtableToolbar;  