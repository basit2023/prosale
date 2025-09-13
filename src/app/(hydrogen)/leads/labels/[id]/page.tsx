'use client';
import { Empty } from 'rizzui';
import Spinner from '@/components/ui/spinner';
import TableLayout from './table-layout';
import InvoiceTable from '@/components/LeadManagement/employee-data/Highly_Interested/table';
import { useEmployeeData } from '@/components/LeadManagement/employee-data/Leads';
import { useSearchParams } from "next/navigation";
export default function EnhancedTablePage({ params }: { params: { id: string } }) {
  const sp:any = useSearchParams();
  const { data, loading, error } = useEmployeeData({ id: params.id,sp:sp });

  if (loading || data === null) {
    return (
      <div className="flex h-[70vh] items-center justify-center gap-3">
        <Spinner size="xl" />
   
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Empty text="Failed to load leads. Please try again." textClassName="mt-2" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Empty text="No Leads found" textClassName="mt-2" />
      </div>
    );
  }

  return (
    <TableLayout
      title={params.id}
      breadcrumb={[]}
      data={data}
      fileName="invoice_data"
      header="ID,Name,Email, Mobile,CNIC,Designation,Department,Assigned Office,Status"
    >
      <InvoiceTable data={data} />
    </TableLayout>
  );
}
