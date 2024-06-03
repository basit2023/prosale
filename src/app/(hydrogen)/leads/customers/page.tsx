



'use client'
import { routes } from '@/config/routes';
// import { invoiceData } from '@/data/invoice-data';
import InvoiceTable from '@/components/LeadManagement/AllCustomers/customers/table';
// import InvoiceTable from '@/components/LeadManagement/employee-data/Highly_Interested/table';
import { useEmployeeData } from '@/components/LeadManagement/AllCustomers/AllCustomer';
import TableLayout from './tabel-layout';
// import TableLayout from '../table-layout';
import { metaObject } from '@/config/site.config';
import { useSession } from 'next-auth/react';
import { Empty } from "rizzui";
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'All Customers',
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
  const { data: session } = useSession();
  const invoiceData = useEmployeeData(session?.user?.email);
  
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
        
        
        <Empty text="No Customer found" textClassName="mt-2" />;
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
//



