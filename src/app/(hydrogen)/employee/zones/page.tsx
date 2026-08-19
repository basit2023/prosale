



'use client'
import { routes } from '@/config/routes';
import InvoiceTable from '@/components/AllZons/zonetable/table';
import { useZoneData } from '@/components/AllZons/AllZons'
import TableLayout from './table-layout';
import { metaObject } from '@/config/site.config';
import { Empty } from "rizzui";
import Spinner from '@/components/ui/spinner';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'All Zones',
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
  const { data: invoiceData, loading, error } = useZoneData();

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
        // fileName="invoice_data"
        // header="ID,Name,Email, Mobile,CNIC,Designation,Department,Assigned Office,Status"
      >
        <InvoiceTable data={invoiceData} />
      </TableLayout>
    );
  }

}




