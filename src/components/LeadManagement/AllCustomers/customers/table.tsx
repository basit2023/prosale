'use client';
import apiService from '@/utils/apiService';
import React, { useCallback, useState,useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import { Button } from '@/components/ui/button';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from './columns';
// import { useEmployeeData } from '@/components/LeadManagement/AllCustomers/AllCustomer';
import Spinner from '@/components/ui/spinner';
import { useSession } from 'next-auth/react';

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

const InvoiceTable = ({ data = [] }: { data: any[] }) => {   //
  const [pageSize, setPageSize] = useState(10);
//   const data  = useEmployeeData();
//   console.log("the data from useEmployeeData is:",data)
// // eslint-disable-next-line react-hooks/rules-of-hooks
//   // Destructure the hook values outside of the JSX
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

  // useMemo for memoized columns
  const columns = React.useMemo(
    () =>
      getColumns({
        data,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onDeleteItem,
        onChecked: handleRowSelect,
        handleSelectAll,
      }),
    [selectedRowKeys, onHeaderCellClick, sortConfig.key, sortConfig.direction, onDeleteItem, handleRowSelect, handleSelectAll]
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

// export type Invoice = {
//   id: string;
//   name: string;
//   mobile: number;
//   project_name: string;
//   project_status: string;
//   interested_in: string;
//   status:string;
//   view_dt:any;
//   email:any;
//   job_title:string;
//   city:string;
//   country:any;
     
// };

// export const useEmployeeData = () => {
//   const { data: session } = useSession();
//   const [value, setValue] = useState([]);
//   const [value1, setValue1] = useState([]);
//   const [isLoad, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         if (session) {
//           const response = await apiService.get(`/all-customers`);
//           const userData = response.data.leads;
//           setData(userData);
//         }
//       } catch (error) {
//         console.error('Error fetching customer data:', error);
//         toast.error('Error fetching customer data. Please try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [session]);

//   const productsData = (value || []).map((user) => ({
//     id:user.id,
//     name: user.customer_name,
   
//     mobile: user.mobile,
//     project_name: user.project_name,
//     project_status: user.project_status,
//     interested_in: user.interested_in,
//     view_dt: user.view_dt,
//     status:user.status,
//     email:user.email,
//     job_title:user.job_title,
//     city:user.city,
//     country:user.country,
   

    
//   }));

//   return productsData;
// };

