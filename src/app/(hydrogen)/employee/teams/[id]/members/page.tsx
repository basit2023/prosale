'use client'
import { routes } from '@/config/routes';
import InvoiceTable from '@/components/AllZons/TeamMembers/table';
import { AllTeamMembers } from '@/components/AllZons/TeamMembers/AllMembers'; 
import ManagerInfo from '@/components/AllZons/TeamMembers/ManagerTable'
import TableLayout from './table-layout';
import { metaObject } from '@/config/site.config';
import { Empty } from "rizzui";

type Props = {
  params: { id: string };
};

const pageHeader = ({ params }: Props) => ({
  title: params.id,
  breadcrumb: [         
    // Add breadcrumb items here if needed
  ],
});

export default function EnhancedTablePage({ params }: Props) {
  const invoiceData = AllTeamMembers({ id: params.id });

  // If no data is found
  if (invoiceData.length === 0) {
    return (
      <TableLayout
        title={pageHeader({ params }).title}
        breadcrumb={pageHeader({ params }).breadcrumb}
        data={invoiceData}
        id1={params.id}
        fileName="invoice_data"
        header="ID,Name,Email, Mobile,CNIC,Designation,Department,Assigned Office,Status"
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
          <Empty text="No Team Member found" textClassName="mt-2" />
        </div>
      </TableLayout>
    );
  }

  // If data is found
  return (
    <TableLayout
      title={pageHeader({ params }).title}
      breadcrumb={pageHeader({ params }).breadcrumb}
      data={invoiceData}
      id1={params.id}
      fileName="invoice_data"
      header="ID,Name,Email, Mobile,CNIC,Designation,Department,Assigned Office,Status"
    >
      <ManagerInfo id={params.id} />
      <InvoiceTable data={invoiceData} />
    </TableLayout>
  );

}
