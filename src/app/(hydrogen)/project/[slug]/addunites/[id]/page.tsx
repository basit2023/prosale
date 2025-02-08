
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';
import AddUnites from '@/components/Projects/FloorPlans/floorAction/NewUnit';
import {decodeId} from '@/components/encriptdycriptdata';
import ImportButton from '@/app/shared/import-button-units';
type Props = {
  params: { id: string , slug:string};
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
  title: 'Add New Unit',
  breadcrumb: [
    
    {
      // href: routes.invoice.home,
      name: 'Floor',
    },
    {
      
    },
  ],
};

export default function InvoiceEditPage({ params }: any) {

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
       <ImportButton slug={params.slug} id={params.id}/>
      </PageHeader>
    
      <AddUnites id={decodeId(params.id)} slug={params.slug}/>
     
      
    </>
  );
}
