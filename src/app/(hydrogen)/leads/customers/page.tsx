'use client';
import { routes } from '@/config/routes';
import InvoiceTable from '@/components/LeadManagement/AllCustomers/customers/table';
import { useEmployeeData } from '@/components/LeadManagement/AllCustomers/AllCustomer';
import TableLayout from './tabel-layout';
import { useSession } from 'next-auth/react';
import { Empty } from 'rizzui';
import { useEffect, useState } from 'react';
import Spinner from '@/components/ui/spinner';
const pageHeader = {
  title: 'All Customers',
  breadcrumb: [],
};

export default function EnhancedTablePage() {
  const { data: session, status } = useSession();
  const invoiceData = useEmployeeData(session?.user?.email);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load
    // Wait until data is fetched
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500); // optional slight delay for UX

    return () => clearTimeout(timeout);
  }, [status, invoiceData]);

  if (loading || status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        <Spinner/>
      </div>
    );
  }

  if (!invoiceData || invoiceData.length === 0) {
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
