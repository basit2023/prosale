import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import CreateInvoice from '@/app/shared/invoice/create-invoice';
import { PiArrowLineUpBold } from 'react-icons/pi';
import ImportButton from '@/app/shared/import-button';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';
import ChangeStatus from '@/components/LeadManagement/ChangeStatus';
import EditTeam from '@/components/AllZons/EditTeam';
type Props = {
  params: { id: string };
};

/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const id = params.id;

  return metaObject(`Edit Team ${id}`);
}

const pageHeader = {
  title: 'Edit team',
  breadcrumb: [
    
   
  ],
};

export default function InvoiceEditPage({ params }: any) {
  console.log('Invoice Edit Page ID', params.id);
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {/* <ImportButton title="Upload File" className="mt-4 @lg:mt-0" /> */}
        {/* <ChangeStatus id={params.id}/> */}
        {/* <StChangeButton id={params.id}/> */}
      </PageHeader>
    

      
      <EditTeam id={params.id}/>
      
    </>
  );
}
