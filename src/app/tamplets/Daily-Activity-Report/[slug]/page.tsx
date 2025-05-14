
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';

import SingleReport from '@/components/DailyActivity/single-report';
type Props = {
  params: { slug:string};
};

/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
 
  const slug=params.slug

  
  return metaObject(`Daily Activity Report`);
}

const pageHeader = {
  // title: 'Edit Floor',
  breadcrumb: [
    
    {
      href: routes.invoice.home,
      name: 'Floor',
    },
    {
      name: 'Edit',
    },
  ],
};

export default function InvoiceEditPage({ params }: any) {

  return (
    <>

    
      <SingleReport slug={params.slug}/>
     
      
    </>
  );
}
 