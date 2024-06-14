import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';
import DeliveryDetails from '@/components/LeadManagement/table2';
import EditCustomer from '@/components/LeadManagement/AllCustomers/EditCustomer';

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

  return metaObject(`Edit ${id}`);
}

const pageHeader = {
  title: 'Edit Customer',
  breadcrumb: [
    
    {
      // href: routes.invoice.home,
      name: '',
    },
    {
      name: '',
    },
  ],
};

export default function InvoiceEditPage({ params }: any) {
 
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
       
      </PageHeader>
    
      <EditCustomer id={params.id}/>
     
      
    </>
  );
}
