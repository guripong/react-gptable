import { useCallback, useState } from "react";
import { useReactTable } from "@tanstack/react-table";
import BounceCheckBox from "../components/BounceCheckbox/BounceCheckBox";
import DebouncedInput from "../components/DebouncedInput/DebouncedInput";
// import DebouncedInput from "lib/components/DebouncedInput/DebouncedInput";
import Dropdown from "../components/DropDown/DropDown";
import SVGBTN from "../svg/SVGBTN";

interface GPtableToolbarProps {
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
        table,
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
                triangleStyle={{ right: "40px" }}
                btnRender={() => {

                    return (<><button className="btn" onClick={() => set_showExcelDownloadList(d => !d)}>
                        다운로드
                    </button></>)
                }} >
                {showExcelDownloadList &&
                    <>
                        <button>aaaaaaaaaaa</button>
                        <button>aaaaaaaaaaa</button>
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
                        <div>
                            order,sizing,visible,
                            sorting,filter는 <br />초기화 완료

                            <br />
                            selectrow와 mutiplecheckbox는?
                            <br />
                            <button onClick={resetAllColumnAttributes}>컬럼 초기화</button>
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