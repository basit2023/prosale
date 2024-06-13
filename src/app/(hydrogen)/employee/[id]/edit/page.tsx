import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';
import PersonalInfoView from '@/app/shared/EmployeeDetails/personalDetail';
import EmployeeDetails from '@/app/shared/EmployeeDetails/EmployeeDetails';
import EmployeeJobInfo from '@/app/shared/EmployeeDetails/EmployeeJobinfo';
import EmployeeContectInfo from '@/app/shared/EmployeeDetails/EmployeeContectInfo';
import EmployeeSalaryInfo from '@/app/shared/EmployeeDetails/EmployeeSalaryInfo';
import Vaultinformation from '@/app/shared/EmployeeDetails/VaultInformation';
import AssignedTeam from '@/app/shared/EmployeeDetails/AssignedTeam';
export const dynamic = 'force-dynamic';
import { generateMetadata } from './metadata';

type Props = {
  params: { id: string };
};
export { generateMetadata }
/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-r eference/functions/generate-metadata#generatemetadata-function
 */
// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//     const id = params.id;
//     try {
      
  
//     return metaObject(`Edit Employee with ${id}`);
//     } catch (error) {
//       console.error('Error in generateMetadata:', error);
//       throw new Error('Failed to generate metadata');
//     }
//   }
  

const pageHeader = {
  title: 'Edit Employee Details',
  breadcrumb: [
    
    {
      href: '#',
      name: 'Empoyee',
    },
    {
      href: '#',
      name: 'Edit',
    },
  ],
};

export default function InvoiceEditPage({ params }: any) {
 
  
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {/* <ImportButton title="Upload File" className="mt-4 @lg:mt-0" /> */}
      </PageHeader>

      {/* <CreateInvoice id={params.id} record={invoiceData} /> */}
      <PersonalInfoView id={params.id}/>
      <div style={{ marginBottom: '20px' }}></div> 
      <Vaultinformation id={params.id}/>
      <div style={{ marginBottom: '20px' }}></div>
      <EmployeeDetails id={params.id}/>
      <div style={{ marginBottom: '20px' }}></div>
      <EmployeeContectInfo id={params.id}/>
      
      <div style={{ marginBottom: '20px' }}></div>
      <EmployeeJobInfo id={params.id}/>
      <div style={{ marginBottom: '20px' }}></div> 
      <EmployeeSalaryInfo id={params.id}/>
      <div style={{ marginBottom: '20px' }}></div> 
      <AssignedTeam id={params.id}/>
      
    </>
  );
}
