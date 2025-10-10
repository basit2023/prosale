"use client"
import { useTargetRevenue } from '@/components/RevenueTargets/TargetList';
import InvoiceTable from '@/components/RevenueTargets/TargetRevenueList/table';
import TableLayout from './table-layout';
import { Empty } from "rizzui";

const pageHeader = {
  title: 'Monthly Revenue Targets',
  breadcrumb: [
    {
      name: 'Revenue Targets',
    },
    {
      name: 'Table',
    },
  ],
};

export default function EnhancedTablePage() {
  const invoiceData = useTargetRevenue();

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={invoiceData || []}
      fileName="invoice_data"
      header="ID,Name,Email,Mobile,CNIC,Designation,Department,Assigned Office,Status"
    >
      {invoiceData && invoiceData.length > 0 ? (
        <InvoiceTable data={invoiceData} />
      ) : (
        <div className="flex justify-center items-center py-10">
          <Empty text="No Daily Activity Report" />
        </div>
      )}
    </TableLayout>
  );
}