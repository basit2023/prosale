'use client'
import { routes } from '@/config/routes';
import InvoiceTable from '@/components/AllZons/TeamMembers/table';
import { AllTeamMembers } from '@/components/AllZons/TeamMembers/AllMembers'; 
import ManagerInfo from '@/components/AllZons/TeamMembers/ManagerTable'
import TableLayout from '../../table-layout';
import { metaObject } from '@/config/site.config';

type Props = {
  params: { id: string };
};
const pageHeader = ({ params }: Props) => ({
  title: params.id,
  breadcrumb: [         
   
  ],
});
export default function EnhancedTablePage({ params }: Props) {
  const invoiceData = AllTeamMembers({ id: params.id });
  // eslint-disable-next-line react-hooks/rules-of-hooks

  if (invoiceData.length === 0) {
    // If empty, wait for a second and then render the components
    setTimeout(() => {
      renderComponents();
    }, 1000);

    return null; 
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
        <ManagerInfo id={params.id}/>
        <InvoiceTable data={invoiceData} />
      </TableLayout>
    );
  }

}
