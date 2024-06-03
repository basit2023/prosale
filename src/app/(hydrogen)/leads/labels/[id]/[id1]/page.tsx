



'use client'
import { routes } from '@/config/routes';
import InvoiceTable from '@/components/LeadManagement/employee-data/Highly_Interested/table';
import { useSpecificTeam  } from '@/components/LeadManagement/ShowpecificTeam';
import TableLayout from '../table-layout';
import { metaObject } from '@/config/site.config';
import { Empty } from "rizzui";
type Props = {
  params: { id: string; id1: string }; // Modify the props type to accept two IDs
};

const pageHeader = ({ params }: Props) => ({
  title: `${params.id}, ${params.id1}`, // Modify the title to include both IDs
  breadcrumb: [],         
});

export default function EnhancedTablePage({ params }: Props) {
  const { id, id1 } = params; // Destructure the IDs from params
  const invoiceData = useSpecificTeam ({ id, id1 }); // Pass the IDs to the function

  // Check if invoiceData is empty
  if (invoiceData.length === 0) {
    // If empty, wait for a second and then render the components
    setTimeout(() => {
      renderComponents();
    }, 1000);

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        
        
        <Empty text="No Data found" textClassName="mt-2" />;
      </div>
    );
  }

  // If not empty, render the components immediately
  return renderComponents();

  function renderComponents() {
    return (
      <TableLayout
        title={pageHeader({ params }).title}
        breadcrumb={pageHeader({ params }).breadcrumb}
        data={invoiceData}
        fileName="invoice_data"
        header="ID,Name,Email, Mobile,CNIC,Designation,Department,Assigned Office,Status"
      >
        <InvoiceTable data={invoiceData} />
      </TableLayout>
    );
  }
}
