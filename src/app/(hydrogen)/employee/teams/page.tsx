



'use client'
import { routes } from '@/config/routes';
import InvoiceTable from '@/components/AllZons/teamtable/table';
import { useTeamData } from '@/components/AllZons/AllTeams'
import TableLayout from './table-layout1';
import { metaObject } from '@/config/site.config';
import { Empty } from "rizzui";
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'All Teams',
  breadcrumb: [         
   
  ],
};
export default function EnhancedTablePage() {
  const invoiceData = useTeamData();
  // eslint-disable-next-line react-hooks/rules-of-hooks
 
  if (invoiceData.length === 0) {
    setTimeout(() => {
      renderComponents();
    }, 1000);

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        
        
        <Empty text="No Data found" textClassName="mt-2" />;
      </div>
    );
  }

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
        <InvoiceTable data={invoiceData as any} />
      </TableLayout>
    );
  }

}




