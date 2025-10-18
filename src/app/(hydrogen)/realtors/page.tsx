// page.tsx
"use client"
import { ProjectData } from '@/components/Projects/project';
import InvoiceTable from '@/components/Realtors/Realtors-list/table';
import TableLayout from './table-layout';
import { Empty } from "rizzui";
import Spinner from '@/components/ui/spinner';
import { Realtors } from '@/components/Realtors/Realtors';
// import RouteProtect from '@/RouteProtect';
const pageHeader = {
  title: 'Realtors List ',
  breadcrumb: [
    {
      name: 'All Realtors',
    },
    {
      name: 'Table',
    },
  ],
};

 function EnhancedTablePage() {
 const { data, loading, error } = Realtors();
    
  
    // Initial load: show spinner
    if (loading || data === null) {
      return (
        <div className="flex h-[70vh] items-center justify-center gap-3">
          <Spinner size="xl" />
        </div>
      );
    }
  
    // Error state
    if (error) {
      return (
        <div className="flex h-[70vh] items-center justify-center">
          <Empty text="Failed to load Realtor. Please try again." textClassName="mt-2" />
        </div>
      );
    }
  
    // Empty state
    if (data.length === 0) {
      return (
        <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={data}
      fileName="invoice_data"
      header="ID,Name,Email,Mobile,CNIC,Designation,Department,Assigned Office,Status"
    >
        <div className="flex h-[70vh] items-center justify-center">
          <Empty text="No Realtor found" textClassName="mt-2" />
        </div>
    </TableLayout>
      );
    }


  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={data}
      fileName="invoice_data"
      header="ID,Name,Email,Mobile,CNIC,Designation,Department,Assigned Office,Status"
    >
      <InvoiceTable data={data} />
    </TableLayout>
  );
}

export default EnhancedTablePage;