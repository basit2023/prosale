
 import { useManageUnits } from '@/components/Projects/FloorManage/managefloor';
import InvoiceTable from '@/components/Projects/FloorManage/table';
import PageHeader from '@/app/shared/page-header';
import { Empty } from "rizzui";
import {decodeId} from '@/components/encriptdycriptdata';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';
import ImportButton from '@/app/shared/import-button-floor';
import FloorPlanMap from '@/components/Projects/FloorManage/FloorPlanMap';
// import RouteProtect from '@/RouteProtect';
type Props = {
  params: { slug: string,id:any};
  
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const id = params.id;
  const slug=params.slug
  
  return metaObject(`Map for ${slug}`);
}

const pageHeader = {
  title: `Floor Map`,
  breadcrumb: [
    
    {
      href: "#",
      name: 'Complete Floor Map',
    },
    {
      // name: 'Edit',
    },
  ],
};
function EnhancedTablePage({ params }: Props) {
   

  
    return (
      <>
  
        <PageHeader title={`${params.slug} ${pageHeader.title}`} breadcrumb={pageHeader.breadcrumb}>
          <div className="mt-4 flex items-center gap-3 @lg:mt-0">
                    <ImportButton slug={params.slug} id={params.id}/>
                    
                  </div>
         
         
        </PageHeader>
      
        <FloorPlanMap slug={params.slug} id={decodeId(params.id)}/>
       
        
      </>
    );
}

export default EnhancedTablePage;