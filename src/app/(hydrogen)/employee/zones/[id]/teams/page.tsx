



'use client'
import { routes } from '@/config/routes';
import InvoiceTable from '@/components/AllZons/teamtable/table';
import { ZoneTeamData } from '@/components/AllZons/zone-teams'
import TableLayout from './table-layout'
import { metaObject } from '@/config/site.config';
import { Empty } from "rizzui";
type Props = {
  params: { id: string };
};

const pageHeader = {
  title: 'Teams in Zones',
  breadcrumb: [],
};

export default function EnhancedTablePage({ params }: Props) {
  
  const invoiceData = ZoneTeamData({ id: params.id });
  
  if (invoiceData.length === 0) {
    setTimeout(() => {
      renderComponents();
    }, 1000);

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        
        
        <Empty text="No Team found" textClassName="mt-2" />;
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
        <InvoiceTable data={invoiceData} />
      </TableLayout>
    );
  }

}








