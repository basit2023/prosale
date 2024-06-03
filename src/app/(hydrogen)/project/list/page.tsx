// page.tsx
"use client"
import { ProjectData } from '@/components/Projects/project';
import InvoiceTable from '@/components/Projects/projectData/table';
import TableLayout from '../table-layout';
import { Empty } from "rizzui";
// import RouteProtect from '@/RouteProtect';
const pageHeader = {
  title: 'Project List ',
  breadcrumb: [
    {
      name: 'All Projects',
    },
    {
      name: 'Table',
    },
  ],
};

 function EnhancedTablePage() {
  const invoiceData = ProjectData();
  
  
  if (invoiceData.length === 0) {
    // If empty, return null
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        
        
        <Empty text="No Data found" textClassName="mt-2" />;
      </div>
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