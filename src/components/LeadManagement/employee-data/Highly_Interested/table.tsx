'use client';

import React, { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { useGetColumns } from './columns';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(100); // Default to 100 leads

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

  const router = useRouter();
  const pathname:any = usePathname();
  const searchParams:any = useSearchParams();

  // listen for reassigned event -> clear selected rows immediately
  useEffect(() => {
    const onReassigned = (e: any) => {
      try {
        const ids: string[] = (e?.detail?.ids) || [];
        if (ids && ids.length) {
          // remove those ids from selection; if none left, clear selection entirely
          const remaining = selectedRowKeys.filter((k: string) => !ids.includes(k));
          if (remaining.length !== selectedRowKeys.length) {
            setSelectedRowKeys(remaining);
          }
        } else {
          // no ids provided: clear selection
          setSelectedRowKeys([]);
        }

        // ensure table internal state syncs with updated `data` prop (refresh columns/cells)
        // handleReset is provided by useTable and will re-sync internal table data/state
        try {
          handleReset();
        } catch (err) {
          // ignore if handleReset not available or fails
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRowKeys, setSelectedRowKeys, handleReset]);

  // Hydrate from URL on first mount (page, size, total)
  useEffect(() => {
    const qp = Number(searchParams.get('page') || '') || 1;
    const qs = Number(searchParams.get('size') || '') || pageSize;
    const qt = Number(searchParams.get('total') || '') || 300; // default 100

    if (qs !== pageSize) setPageSize(qs);
    if (qt !== totalCount) setTotalCount(qt);
    if (qp !== currentPage) handlePaginate(qp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Keep URL in sync with page/size/total (shallow)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(currentPage));
    params.set('size', String(pageSize));
    params.set('total', String(totalCount)); // Update total leads in URL
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentPage, pageSize, totalCount, router, pathname, searchParams]);

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
    data,
    sortConfig,
    checkedItems: selectedRowKeys,
    onHeaderCellClick,
    onDeleteItem,
    onChecked: handleRowSelect,
    handleSelectAll,
  });

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  const loadMoreLeads = () => {
    setTotalCount((prev) => prev + 100); // Increase total leads by 100
  };

  // Determine if we're on the last page
  const isLastPage = currentPage * pageSize >= totalCount;


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
          setPageSize: (size: number) => {
            setPageSize(size); // URL sync happens via effect above
          },
          total: totalCount, // Use controlled total count
          current: currentPage,
          onChange: (page: number) => handlePaginate(page),
        }}
        filterOptions={{
          searchTerm,
          onSearchClear: () => {
            handleSearch('');
          },
          onSearchChange: (event) => {
            handleSearch(event.target.value);
          },
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
          >
            {/* Show "Load More" button only when the current page is the last one */}
            
          </TableFooter>
          {(isLastPage && totalCount) && (

              <button
                type="button"
                className="rounded-md border px-2 py-2 mt-4 text-xs text-blue-500 hover:bg-blue-50"
                onClick={loadMoreLeads}
              >
                Load More
              </button>
            )}
          </div>
        }
        className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
      />
    </>
  );
};

export default InvoiceTable;


//before adding the specific location


// 'use client';

// import React, { useCallback, useState } from 'react';
// import dynamic from 'next/dynamic';
// import { useTable } from '@/hooks/use-table';
// import { useColumn } from '@/hooks/use-column';
// import { Button } from '@/components/ui/button';
// import ControlledTable from '@/components/controlled-table';
// import { useGetColumns  } from './columns';



// const FilterElement = dynamic(
//   () => import('@/app/shared/invoice/invoice-list/filter-element'),
//   { ssr: false }
// );
// const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
//   ssr: false,
// });

// const filterState = {
//   amount: ['', ''],
//   createdAt: [null, null],
//   dueDate: [null, null],
//   status: '',
// };

// const InvoiceTable = ({ data = [] }: { data: any[] }) => {
//   const [pageSize, setPageSize] = useState(10);
//   const {
//     isLoading,
//     isFiltered,
//     tableData,
//     currentPage,
//     totalItems,
//     handlePaginate,
//     filters,
//     updateFilter,
//     searchTerm,
//     handleSearch,
//     sortConfig,
//     handleSort,
//     selectedRowKeys,
//     setSelectedRowKeys,
//     handleRowSelect,
//     handleSelectAll,
//     handleDelete,
//     handleReset,
//   } = useTable(data, pageSize, filterState);

//   const onHeaderCellClick = useCallback((value: string) => ({
//     onClick: () => {
//       handleSort(value);
//     },
//   }), [handleSort]);

//   const onDeleteItem = useCallback((id: string) => {
//     handleDelete(id);
//   }, [handleDelete]);

//   const columns = useGetColumns({
//     data,
//     sortConfig,
//     checkedItems: selectedRowKeys,
//     onHeaderCellClick,
//     onDeleteItem,
//     onChecked: handleRowSelect,
//     handleSelectAll,
//   });

//   const { visibleColumns, checkedColumns, setCheckedColumns } = useColumn(columns);

//   return (
//     <>
//       <ControlledTable
//         variant="modern"
//         data={tableData}
//         isLoading={isLoading}
//         showLoadingText={true}
//         // @ts-ignore
//         columns={visibleColumns}
//         paginatorOptions={{
//           pageSize,
//           setPageSize,
//           total: totalItems,
//           current: currentPage,
//           onChange: (page: number) => handlePaginate(page),
//         }}
//         filterOptions={{
//           searchTerm,
//           onSearchClear: () => {
//             handleSearch('');
//           },
//           onSearchChange: (event) => {
//             handleSearch(event.target.value);
//           },
//           hasSearched: isFiltered,
//           columns,
//           checkedColumns,
//           setCheckedColumns,
//         }}
//         tableFooter={
//           <TableFooter
//             checkedItems={selectedRowKeys}
//             handleDelete={(ids: string[]) => {
//               setSelectedRowKeys([]);
//               handleDelete(ids);
//             }}
//           >
//             {/* <Button size="sm" className="dark:bg-gray-300 dark:text-gray-800">
//               Re-send {selectedRowKeys.length}{' '}
//               {selectedRowKeys.length > 1 ? 'Invoices' : 'Invoice'}{' '}
//             </Button> */}
//           </TableFooter>
//         }
//         className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
//       />
//     </>
//   );
// };

// export default InvoiceTable;
