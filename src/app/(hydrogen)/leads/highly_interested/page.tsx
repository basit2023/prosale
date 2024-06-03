



'use client'
import { routes } from '@/config/routes';
// import { invoiceData } from '@/data/invoice-data';
import InvoiceTable from '@/components/LeadManagement/employee-data/Highly_Interested/table';
// import InvoiceTable from '@/app/shared/invoice/invoice-list/table';
// import { invoiceData } from '@/components/employee-data/employeeList';
import { useEmployeeData } from '@/components/LeadManagement/employee-data/Leads';
import TableLayout from '../table-layout';
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




