import { metaObject } from '@/config/site.config';
import NewTargets from '@/components/RevenueTargets/NewTargets';
import PageHeader from '@/app/shared/page-header';
export const metadata = {
  ...metaObject('New Targets'),
};

const pageHeader = {
  title: 'Add New Targests',
  breadcrumb: [
    
    {
      
      name: 'Targets',
    },
    // {
    //   name: 'Add',
    // },
  ],
};

export default function NewLeadsPage() {
  return (
    <>
     <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
     </PageHeader>
      <NewTargets/>
    </>
  );
}
