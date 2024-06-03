import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';
import NewLeadCustomer from '@/components/LeadManagement/AllCustomers/NewCustomer';

/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */

export async function generateMetadata(): Promise<Metadata> {
  

  return metaObject(`New Customer`);
}

const pageHeader = {
  title: 'New Customer',
  breadcrumb: [
    
    {
      // href: routes.invoice.home,
      name: 'New',
    },
    {
      name: 'Customer',
    },
  ],
};

export default function InvoiceEditPage() {
  
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
       
      </PageHeader>
    
      <NewLeadCustomer/>
     
      
    </>
  );
}
