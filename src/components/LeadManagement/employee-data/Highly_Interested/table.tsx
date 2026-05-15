'use client';

import React, { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { useGetColumns } from './columns';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

const filterState = {
  amount: ['', ''],
  createdAt: [null, null],
  dueDate: [null, null],
  status: '',
};

interface InvoiceTableProps {
  data: any[];
  loadMore?: () => void;
  totalLeads?: number;
  isLoading?: boolean;
}

const InvoiceTable = ({ 
  data = [], 
  loadMore, 
  totalLeads = 0,
  isLoading: isParentLoading = false 
}: InvoiceTableProps) => {
  const [pageSize, setPageSize] = useState<number>(10);

  const {
    isLoading,
    isFiltered,
    tableData,
    currentPage,
    handlePaginate,
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

  const router = useRouter();
  const pathname: any = usePathname();
  const searchParams: any = useSearchParams();

  useEffect(() => {
    const onReassigned = (e: any) => {
      try {
        const ids: string[] = (e?.detail?.ids) || [];
        if (ids && ids.length) {
          const remaining = selectedRowKeys.filter((k: string) => !ids.includes(k));
          if (remaining.length !== selectedRowKeys.length) {
            setSelectedRowKeys(remaining);
          }
        } else {
          setSelectedRowKeys([]);
        }
        try {
          handleReset();
        } catch (err) {}
      } catch (err) {
        setSelectedRowKeys([]);
      }
    };
    window.addEventListener('leads:reassigned', onReassigned);
    window.addEventListener('leads:change', onReassigned);
    return () => {
      window.removeEventListener('leads:reassigned', onReassigned);
      window.removeEventListener('leads:change', onReassigned);
    };
  }, [selectedRowKeys, setSelectedRowKeys, handleReset]);

  useEffect(() => {
    const qp = Number(searchParams.get('page') || '') || 1;
    const qs = Number(searchParams.get('size') || '') || pageSize;

    if (qs !== pageSize) setPageSize(qs);
    if (qp !== currentPage) handlePaginate(qp);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(currentPage));
    params.set('size', String(pageSize));
    params.set('total', String(totalLeads));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentPage, pageSize, totalLeads, router, pathname, searchParams]);

  const onHeaderCellClick = useCallback(
    (value: string) => ({
      onClick: () => {
        handleSort(value);
      },
    }),
    [handleSort]
  );

  const onDeleteItem = useCallback(
    (id: string) => {
      handleDelete(id);
    },
    [handleDelete]
  );

  const columns = useGetColumns({
    data: tableData,
    sortConfig,
    checkedItems: selectedRowKeys,
    onHeaderCellClick,
    onDeleteItem,
    onChecked: handleRowSelect,
    handleSelectAll,
  });

  const { visibleColumns, checkedColumns, setCheckedColumns } = useColumn(columns);

  const isLastPage = currentPage * pageSize >= data.length;
  const hasMoreOnServer = data.length < totalLeads;

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
          total: data.length, // Client-side pagination of currently loaded data
          current: currentPage,
          onChange: (page: number) => handlePaginate(page),
        }}
        filterOptions={{
          searchTerm,
          onSearchClear: () => handleSearch(''),
          onSearchChange: (event) => handleSearch(event.target.value),
          hasSearched: isFiltered,
          columns,
          checkedColumns,
          setCheckedColumns,
        }}
        tableFooter={
          <div className='flex flex-col justify-end'>
            <TableFooter
              checkedItems={selectedRowKeys}
              handleDelete={(ids: string[]) => {
                setSelectedRowKeys([]);
                handleDelete(ids);
              }}
            />
            {isLastPage && hasMoreOnServer && (
              <Button
                variant="outline"
                className="mt-4 w-full border-dashed border-gray-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={loadMore}
                isLoading={isParentLoading}
              >
                Load More Leads ({totalLeads - data.length} remaining)
              </Button>
            )}
          </div>
        }
        className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
      />
    </>
  );
};

export default InvoiceTable;
