
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';
import Unitscard from '@/components/Projects/FloorPlans/floorAction/Unitscard';
import {decodeId} from '@/components/encriptdycriptdata';
import ImportButton from '@/app/shared/import-button-floor';
import ImportButtonMap from "@/app/shared/import-button-map";
type Props = {
  params: { id: any , slug:string};
};
import { Button } from '@/components/ui/button';
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
      href: "#",
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
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
                  <ImportButton slug={params.slug} id={params.id}/>
                  {/* <Button className="w-full @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100">
                   <ImportButtonMap slug={params.slug} id={params.id}/>
                  </Button> */}
                </div>
       
       
      </PageHeader>
    
      <Unitscard slug={params.slug} id={decodeId(params.id)}/>
     
      
    </>
  );
}
