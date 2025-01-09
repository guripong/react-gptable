"use client";
import { PaginationState } from '@tanstack/react-table';
import React from 'react';

interface PaginationProps {
  table: any; // Replace 'any' with the correct type of your table component
  pagination: PaginationState; // Replace 'any' with the correct type of your pagination state
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>; // Replace 'any' with the correct type of your setPagination function
  paginationArr: number[]; // Replace 'number[]' with the correct type of your paginationArr array
}

const Pagination: React.FC<PaginationProps> = ({ table, pagination, setPagination, paginationArr }) => {
  return (
    <div className="pagination">
      <button
        className="prev"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        {'<'}
      </button>
      <div className="middle">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          Page&nbsp;
          <input
            className="nowPage"
            type="number"
            max={table.getPageCount() || undefined}
            value={pagination.pageIndex + 1}
            onChange={e => {
              let page = e.target.value ? Number(e.target.value) - 1 : 0;
              setPagination((p:any) => ({
                ...p,
                pageIndex: page
              }));
            }}
          />
          &nbsp;of&nbsp;{table.getPageCount()}
        </div>

        <div style={{ marginLeft: '10%' }}>
          <select
            className="viewRows"
            value={pagination.pageSize}
            onChange={e => {
              setPagination(p => ({
                ...p,
                pageSize: Number(e.target.value)
              }));
            }}
          >
            {paginationArr.map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize} rows
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        className="next"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        {'>'}
      </button>
    </div>
  );
};

export default Pagination;
