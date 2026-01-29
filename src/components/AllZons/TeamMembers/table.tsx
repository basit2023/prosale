'use client';

import React, { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import { Button } from '@/components/ui/button';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from './columns';
import apiService from '@/utils/apiService';
import toast from 'react-hot-toast';


const FilterElement = dynamic(
  () => import('@/app/shared/invoice/invoice-list/filter-element'),
  { ssr: false }
);
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

const filterState = {
  amount: ['', ''],
  createdAt: [null, null],
  dueDate: [null, null],
  status: '',
};

const InvoiceTable = ({ data = [] }: { data: any[] }) => {
  const [pageSize, setPageSize] = useState(10);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // Destructure the hook values outside of the JSX
  const {
    isLoading,
    isFiltered,
    tableData,
    currentPage,
    totalItems,
    handlePaginate,
    filters,
    updateFilter,
    searchTerm,
    handleSearch,
    sortConfig,
    handleSort,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    handleDelete,
    handleReset,
  } = useTable(data, pageSize, filterState);

  const onHeaderCellClick = useCallback((value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  }), [handleSort]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const onDeleteItem = useCallback((id: string) => {
    handleDelete(id);
  }, [handleDelete]);

  const onRemoveMember = useCallback(async (id: string) => {
    try {
      const response = await apiService.put(`/remove-team-member/${id}`);
      if (response.data.success) {
        toast.success(response.data.message || 'Member removed from team');
        handleDelete(id);
      } else {
        toast.error(response.data.message || 'Failed to remove member');
      }
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.message || 'Error removing member');
    }
  }, [handleDelete]);

  // useMemo for memoized columns
  const columns = React.useMemo(
    () =>
      getColumns({
        data,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onDeleteItem,
        onRemoveMember,
        onChecked: handleRowSelect,
        handleSelectAll,
      }),
    [selectedRowKeys, onHeaderCellClick, sortConfig.key, sortConfig.direction, onDeleteItem, onRemoveMember, handleRowSelect, handleSelectAll]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } = useColumn(columns);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return (
    <>
      <ControlledTable
        variant="modern"
        data={tableData}
        isLoading={isLoading}
        showLoadingText={true}
        // @ts-ignore
        columns={visibleColumns}
        paginatorOptions={{
          pageSize,
          setPageSize,
          total: totalItems,
          current: currentPage,
          onChange: (page: number) => handlePaginate(page),
        }}
        // filterOptions={{
        //   searchTerm,
        //   onSearchClear: () => {
        //     handleSearch('');
        //   },
        //   onSearchChange: (event) => {
        //     handleSearch(event.target.value);
        //   },
        //   hasSearched: isFiltered,
        //   columns,
        //   checkedColumns,
        //   setCheckedColumns,
        // }}
        // filterElement={
        //   <FilterElement
        //     isFiltered={isFiltered}
        //     filters={filters}
        //     updateFilter={updateFilter}
        //     handleReset={handleReset}
        //   />
        // }
        // tableFooter={
        //   <TableFooter
        //     checkedItems={selectedRowKeys}
        //     handleDelete={(ids: string[]) => {
        //       setSelectedRowKeys([]);
        //       handleDelete(ids);
        //     }}
        //   >
        //     <Button size="sm" className="dark:bg-gray-300 dark:text-gray-800">
        //       Re-send {selectedRowKeys.length}{' '}
        //       {selectedRowKeys.length > 1 ? 'Invoices' : 'Invoice'}{' '}
        //     </Button>
        //   </TableFooter>
        // }
        className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
      />
    </>
  );
};

export default InvoiceTable;
