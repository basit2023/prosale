'use client';
import { routes } from '@/config/routes';
// import { invoiceData } from '@/data/invoice-data';
import InvoiceTable from '@/components/LeadManagement/AllCustomers/customers/table';
// import InvoiceTable from '@/components/LeadManagement/employee-data/Highly_Interested/table';
import { useEmployeeData } from '@/components/LeadManagement/AllCustomers/AllCustomer';
import TableLayout from './tabel-layout';
// import TableLayout from '../table-layout';
import { metaObject } from '@/config/site.config';
import { useSession } from 'next-auth/react';
import { Empty } from 'rizzui';

const pageHeader = {
  title: 'All Customers',
  breadcrumb: [],
};

export default function EnhancedTablePage() {
  const { data: session } = useSession();
  const invoiceData: [] = useEmployeeData(session?.user?.email);

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
