
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';
import Unitscard from '@/components/Projects/FloorPlans/floorAction/Unitscard';
import {decodeId} from '@/components/encriptdycriptdata';
import ImportButton from '@/app/shared/import-button-floor';
type Props = {
  params: { id: any , slug:string};
};

/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const id = params.id;
  const slug=params.slug
  
  return metaObject(`Edit floor ${slug}`);
}

const pageHeader = {
  title: 'Edit Floor',
  breadcrumb: [
    
    {
      // href: routes.invoice.home,
      name: 'Floor',
    },
    {
      // name: 'Edit',
    },
  ],
};

export default function InvoiceEditPage({ params }: any) {
  
  return (
    <>

      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
       <ImportButton slug={params.slug} id={params.id}/>
      </PageHeader>
    
      <Unitscard slug={params.slug} id={decodeId(params.id)}/>
     
      
    </>
  );
}
