'use client';

import React, { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { useGetColumns } from './columns';

const filterState = {
  amount: ['', ''],
  createdAt: [null, null],
  dueDate: [null, null],
  status: '',
};

interface InvoiceTableProps {
  data: any[];
  onPageChange?: (page: number) => void;
  totalProjects?: number;
  currentPage?: number;
  pageSize?: number;
  isLoading?: boolean;
}

const InvoiceTable = ({ 
  data = [], 
  onPageChange, 
  totalProjects = 0,
  currentPage = 1,
  pageSize: propPageSize = 10,
  isLoading: isParentLoading = false
}: InvoiceTableProps) => {
  const [pageSize, setPageSize] = useState(propPageSize);
  
  const {
    isLoading,
    isFiltered,
    tableData,
    searchTerm,
    handleSearch,
    sortConfig,
    handleSort,
    handleDelete,
  } = useTable(data, pageSize, filterState);

  const onHeaderCellClick = useCallback((value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  }), [handleSort]);

  const onDeleteItem = useCallback((id: string) => {
    handleDelete(id);
  }, [handleDelete]);

  const columns = useGetColumns({
    data: tableData,
    sortConfig,
    checkedItems: [], // No selection needed
    onHeaderCellClick,
    onDeleteItem,
    handleSelectAll: () => {}, // No selection needed
  });

  const { visibleColumns } = useColumn(columns);

  return (
    <>
      <ControlledTable
        variant="modern"
        data={tableData}
        isLoading={isLoading || isParentLoading}
        showLoadingText={true}
        columns={visibleColumns}
        paginatorOptions={{
          pageSize,
          setPageSize,
          total: totalProjects,
          current: currentPage,
          onChange: (page: number) => onPageChange?.(page),
        }}
        className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
      />
    </>
  );
};

export default InvoiceTable;
