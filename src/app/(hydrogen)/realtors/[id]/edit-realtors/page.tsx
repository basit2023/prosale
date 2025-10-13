import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';
import { routes } from '@/config/routes';
import PersonalInfoView from '@/app/shared/EmployeeDetails/personalDetail';
import EditRealtorsForm from '@/components/Realtors/EditRealtors';
export const dynamic = 'force-dynamic';


type Props = {
  params: { id: string };
};

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
  title: 'Edit Realtors Details',
  breadcrumb: [
    
    {
      href: routes.,
      name: 'Realtors',
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
      <EditRealtorsForm id={params.id}/>
      
      
    </>
  );
}
