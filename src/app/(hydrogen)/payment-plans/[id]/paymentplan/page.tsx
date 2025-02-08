// page.tsx
"use client";

import { viewPaymentPlan } from '@/components/Projects/PaymentPlain/Generatepayment/viewpaymentplain';
import InvoiceTable from '@/components/Projects/PaymentPlain/Generatepayment/table';
import TableLayout from './table-layout';
import { Empty } from "rizzui";
import {decodeId} from '@/components/encriptdycriptdata';

// import RouteProtect from '@/RouteProtect';
type Props = {
  params: { id: string };
};

function EnhancedTablePage({ params }: Props) {
  const invoiceData = viewPaymentPlan(decodeId(params.id));
  // const formattedTitle = params.slug.replace(/_/g, ' ');
  const pageHeader = {
    title: "Payment Plan", 
    breadcrumb: [],
  };

  if (invoiceData.length === 0) {
    // If empty, return null
    
    return (
      <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={invoiceData}
      fileName="invoice_data"
      header="ID,Name,Email,Mobile,CNIC,Designation,Department,Assigned Office,Status"
    >
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        <Empty text="No Data found" textClassName="mt-2" />
      </div>
    </TableLayout>
     
    );
  }

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={invoiceData}
      fileName="invoice_data"
      header="ID,Name,Email,Mobile,CNIC,Designation,Department,Assigned Office,Status"
    >
      <InvoiceTable data={invoiceData} />
    </TableLayout>
  );
}

export default EnhancedTablePage;
