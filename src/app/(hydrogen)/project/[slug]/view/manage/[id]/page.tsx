"use client";
 import { useManageUnits } from '@/components/Projects/FloorManage/managefloor';
import InvoiceTable from '@/components/Projects/FloorManage/table';
import TableLayout from './table-layout';
import { Empty } from "rizzui";
import {decodeId} from '@/components/encriptdycriptdata';
// import RouteProtect from '@/RouteProtect';
type Props = {
  params: { slug: string,id:any};
  
};

function EnhancedTablePage({ params }: Props) {
   const invoiceData = useManageUnits(params.slug, decodeId(params.id));
  const formattedTitle = params.slug.replace(/_/g, ' ');
  const pageHeader = {
    title: formattedTitle, 
    breadcrumb: [],
  };

  if (invoiceData.length === 0) {
    // If empty, return null
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        <Empty text="No Data found" textClassName="mt-2" />
      </div>
    );
  }

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={params.id}
      id={params.id}
      slug={params.slug}
      fileName="invoice_data"
      header="ID,Name,Email,Mobile,CNIC,Designation,Department,Assigned Office,Status"
    >
      <InvoiceTable data={invoiceData}/>
    </TableLayout>
  );
}

export default EnhancedTablePage;