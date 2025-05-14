
import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';

import PrintFullReport from '@/components/DailyActivity/print-full-report';
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

  
  return metaObject(`Full Report`);
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
    console.log("the params is at the template is:",params)
  return (
    <>

    
      <PrintFullReport slug={params.slug}/>
     
      
    </>
  );
}
 