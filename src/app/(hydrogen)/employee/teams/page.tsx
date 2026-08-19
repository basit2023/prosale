



'use client'
import { routes } from '@/config/routes';
import InvoiceTable from '@/components/AllZons/teamtable/table';
import { useTeamData } from '@/components/AllZons/AllTeams'
import TableLayout from './table-layout1';
import { metaObject } from '@/config/site.config';
import { Empty } from "rizzui";
import Spinner from '@/components/ui/spinner';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'All Teams',
  breadcrumb: [         
   
  ],
};
export default function EnhancedTablePage() {
  const { data: invoiceData, loading, error } = useTeamData();

  if (loading) {
    return <div className="flex h-[70vh] items-center justify-center"><Spinner size="xl" /></div>;
  }

  if (error) {
    return <div className="flex h-[70vh] items-center justify-center"><Empty text={error} textClassName="mt-2" /></div>;
  }
 
  if (invoiceData.length === 0) {
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




