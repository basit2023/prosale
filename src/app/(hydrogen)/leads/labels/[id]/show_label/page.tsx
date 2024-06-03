



'use client'
import { routes } from '@/config/routes';
// import { invoiceData } from '@/data/invoice-data';
import InvoiceTable from '@/components/LeadManagement/employee-data/Highly_Interested/table';
// import InvoiceTable from '@/app/shared/invoice/invoice-list/table';
// import { invoiceData } from '@/components/employee-data/employeeList';
import { useEmployeeData } from '@/components/LeadManagement/employee-data/Leads';
// import TableLayout from '../../../table-layout';
import TableLayout from '../../../table-layout';
import { metaObject } from '@/config/site.config';

import { Empty } from "rizzui";
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Highly Interested',
  breadcrumb: [         
    // {
    //   href: routes.eCommerce.dashboard,
    //   name: 'Home',
    // },
    // {
    //   name: 'Tables',
    // },
    // {
    //   name: 'Enhanced',
    // },
  ],
};
export default function EnhancedTablePage() {
  let id:string='';
  const invoiceData = useEmployeeData({id});
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // console.log("the product data is:", invoiceData);

  // Check if invoiceData is empty
  if (invoiceData.length === 0) {
    // If empty, wait for a second and then render the components
    setTimeout(() => {
      renderComponents();
    }, 1000);

    
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        
        
        <Empty text="No Data found" textClassName="mt-2" />;
      </div>
    );
  }

  // If not empty, render the components immediately
  return renderComponents();

  function renderComponents() {
    return (
      <TableLayout
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
        data={invoiceData}
        fileName="invoice_data"
        header="ID,Name,Email, Mobile,CNIC,Designation,Department,Assigned Office,Status"
      >
        <InvoiceTable data={invoiceData} />
      </TableLayout>
    );
  }

}







// import Link from 'next/link';
// import { routes } from '@/config/routes';
// import { Button } from '@/components/ui/button';
// import PageHeader from '@/app/shared/page-header';
// import InvoiceTable from '@/app/shared/invoice/invoice-list/table';
// import { PiPlusBold } from 'react-icons/pi';
// import { invoiceData } from '@/data/invoice-data';
// import ExportButton from '@/app/shared/export-button';
// import { metaObject } from '@/config/site.config';

// export const metadata = {
//   ...metaObject('Invoices'),
// };

// const pageHeader = {
//   title: 'Invoice List',
//   breadcrumb: [
//     {
//       href: routes.eCommerce.dashboard,
//       name: 'Home',
//     },
//     {
//       href: routes.invoice.home,
//       name: 'Invoice',
//     },
//     {
//       name: 'List',
//     },
//   ],
// };

// export default function InvoiceListPage() {
//   return (
//     <>
//       <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
//         <div className="mt-4 flex items-center gap-3 @lg:mt-0">
//           <ExportButton
//             data={invoiceData}
//             fileName="invoice_data"
//             header="ID,Name,Username,Avatar,Email,Due Date,Amount,Status,Created At"
//           />
//           {/* <Link href={routes.invoice.create} className="w-full @lg:w-auto">
//             <Button
//               tag="span"
//               className="w-full @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100"
//             >
//               <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
//               Add Invoice
//             </Button>
//           </Link> */}
//         </div>
//       </PageHeader>

//       <InvoiceTable data={invoiceData} />
//     </>
//   );
// }

//  'use client'

//  import Link from 'next/link';
// import { PiPlusBold } from 'react-icons/pi';
// import { routes } from '@/config/routes';
// import { Button } from '@/components/ui/button';
// import PageHeader from '@/app/shared/page-header';
// import ProductsTable from '@/components/employee-data/employees-list/table';
// import useEmployeeData from '@/components/employee-data/employeeList';
// import { metaObject } from '@/config/site.config';
// import ExportButton from '@/app/shared/export-button';
// import React, { useEffect, useState } from 'react';

// // export const metadata = {
// //   ...metaObject('Employees List'),
// // };
// // console.log("the array is:",employeeDataArray)
// const pageHeader = {
//   title: 'All Employees',
//   breadcrumb: [
//     {
//       href: routes.eCommerce.dashboard,
//       name: 'E-Commerce',
//     },
//     {
//       href: routes.eCommerce.products,
//       name: 'Products',
//     },
//     {
//       name: 'List',
//     },
//   ],
// };

// export default function ProductsPage() {
//   // const [employeeData, setEmployeeData] = useState([]);

//   // useEffect(() => {
//   //   const fetchData = async () => {
//   //     const data = await useEmployeeData();
//   //     setEmployeeData(data);
//   //   };

//   //   fetchData();
//   // }, []); 

//   // console.log(employeeData);
//   const productsData = useEmployeeData();
//   console.log("the product data is:",productsData)
//   return (
//     <>
//       <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
//         <div className="mt-4 flex items-center gap-3 @lg:mt-0">
//           {/* <ExportButton
//             data={employeeData}
//             fileName="employee_data"
//             header="ID,Name,Category,Product Thumbnail,SKU,Stock,Price,Status,Rating"
//           /> */}
//         </div>
//       </PageHeader>

//       <ProductsTable data={productsData} />
//     </>
//   );
// }
