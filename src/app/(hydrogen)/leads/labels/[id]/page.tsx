'use client';
import { Empty } from 'rizzui';
import Spinner from '@/components/ui/spinner';
import TableLayout from './table-layout';
import InvoiceTable from '@/components/LeadManagement/employee-data/Highly_Interested/table';
import { useEmployeeData } from '@/components/LeadManagement/employee-data/Leads';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EnhancedTablePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();

  // Treat ?total= as page size
  const pageSizeParam = searchParams.get('total');
  const pageSize = Number(pageSizeParam) > 0 ? Number(pageSizeParam) : 50;

  const [reloadSignal, setReloadSignal] = useState<number>(0);

  useEffect(() => {
    const handler = (e: any) => {
      // increment reload signal to force data hook to refetch
      setReloadSignal(Date.now());
    };
    window.addEventListener('leads:reassigned', handler);
    window.addEventListener('leads:change', handler);
    return () => {
      window.removeEventListener('leads:reassigned', handler);
      window.removeEventListener('leads:change', handler);
    };
  }, []);

  const { data, loading, error, loadMore, totalLeads } = useEmployeeData({ id: params.id, pageSize, reloadSignal });

  if (loading && data.length === 0) {
    return (
      <div className="flex h-[70vh] items-center justify-center gap-3">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Empty text="Failed to load leads. Please try again." textClassName="mt-2" />
      </div>
    );
  }

  if (data.length === 0 && !loading) {
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
      <InvoiceTable 
        data={data} 
        loadMore={loadMore} 
        totalLeads={totalLeads} 
        isLoading={loading}
      />
    </TableLayout>
  );
}
