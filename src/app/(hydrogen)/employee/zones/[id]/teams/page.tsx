



'use client'
import { routes } from '@/config/routes';
import InvoiceTable from '@/components/AllZons/teamtable/table';
import { ZoneTeamData } from '@/components/AllZons/zone-teams'
import TableLayout from './table-layout'
import { metaObject } from '@/config/site.config';
import { Empty } from "rizzui";
import Spinner from '@/components/ui/spinner';
type Props = {
  params: { id: string };
};

const pageHeader = {
  title: 'Teams in Zones',
  breadcrumb: [],
};

export default function EnhancedTablePage({ params }: Props) {
  
  const { data: invoiceData, loading, error } = ZoneTeamData({ id: params.id });

  if (loading) {
    return <div className="flex h-[70vh] items-center justify-center"><Spinner size="xl" /></div>;
  }

  if (error) {
    return <div className="flex h-[70vh] items-center justify-center"><Empty text={error} textClassName="mt-2" /></div>;
  }
  
  if (invoiceData.length === 0) {
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








