'use client';
import InvoiceTable from '@/components/LeadManagement/AllCustomers/customers/table';
import { useEmployeeData } from '@/components/LeadManagement/AllCustomers/AllCustomer';
import TableLayout from './tabel-layout';
import { useSession } from 'next-auth/react';
import { Empty } from 'rizzui';
import Spinner from '@/components/ui/spinner';
const pageHeader = {
  title: 'All Customers',
  breadcrumb: [],
};

export default function EnhancedTablePage() {
  const { data: session, status } = useSession();
  const { data: invoiceData, loading, error } = useEmployeeData(session?.user?.email);

  if (loading || status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        <Spinner/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Empty text={error} textClassName="mt-2" />
      </div>
    );
  }

  if (invoiceData.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Empty text="No Customer found" textClassName="mt-2" />
      </div>
    );
  }

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
