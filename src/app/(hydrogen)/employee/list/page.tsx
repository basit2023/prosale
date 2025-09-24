// page.tsx
"use client"
import { useEmployeeData } from '@/components/employee-data/employeeList';
import InvoiceTable from '@/components/employee-data/employee-list/table';
import TableLayout from '../table-layout';
import { Empty } from "rizzui";
import Spinner from '@/components/ui/spinner';
const pageHeader = {
  title: 'All Employees',
  breadcrumb: [
    {
      name: 'All Employees',
    },
    {
      name: 'Table',
    },
  ],
};

export default function EnhancedTablePage() {
   const { data, loading, error } = useEmployeeData();

  // Initial load: show spinner
  if (loading || data === null) {
    return (
      <div className="flex h-[70vh] items-center justify-center gap-3">
        <Spinner size="xl" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Empty text="Failed to load employees. Please try again." textClassName="mt-2" />
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Empty text="No Employee found" textClassName="mt-2" />
      </div>
    );
  }


  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={data}
      fileName="invoice_data"
      header="ID,Name,Email,Mobile,CNIC,Designation,Department,Assigned Office,Status"
    >
      <InvoiceTable data={data} />    
       
    </TableLayout>
  );
}






// 'use client'
// import { routes } from '@/config/routes';
// // import { invoiceData } from '@/data/invoice-data';
// import InvoiceTable from '@/components/employee-data/employee-list/table';
// // import InvoiceTable from '@/app/shared/invoice/invoice-list/table';
// // import { invoiceData } from '@/components/employee-data/employeeList';
// import { useEmployeeData } from '@/components/employee-data/employeeList';
// import TableLayout from '../table-layout';
// import { metaObject } from '@/config/site.config';

// // export const metadata = {
// //   ...metaObject('Enhanced Table'),
// // };

// const pageHeader = {
//   title: 'All Employees',
//   breadcrumb: [         
//     {
//       name: 'All Employees',
//     },
//     {
//       name: 'Table',
//     },
   
//   ],
// };
// export default function EnhancedTablePage() {
//   const invoiceData = useEmployeeData();
//   // eslint-disable-next-line react-hooks/rules-of-hooks
//   // console.log("the product data is:", invoiceData);

//   // Check if invoiceData is empty
//   if (invoiceData.length === 0) {
//     // If empty, wait for a second and then render the components
//     setTimeout(() => {
//       renderComponents();
//       // eslint-disable-next-line react-hooks/rules-of-hooks
//     }, 1000);

//     return null; 
//   }

//   // If not empty, render the components immediately
//   return renderComponents();
//   // eslint-disable-next-line react-hooks/rules-of-hooks

//   function renderComponents() {
//     return (
//       <TableLayout
//         title={pageHeader.title}
//         breadcrumb={pageHeader.breadcrumb}
//         data={invoiceData}
//         fileName="invoice_data"
//         header="ID,Name,Email, Mobile,CNIC,Designation,Department,Assigned Office,Status"
//       >
//         <InvoiceTable data={invoiceData} /> 
//          {/* data={invoiceData} */}
//       </TableLayout>
//     );
//   }

// }
