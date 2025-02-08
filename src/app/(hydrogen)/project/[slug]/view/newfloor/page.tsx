import AnalyticsDashboard from '@/app/shared/analytics-dashboard';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import AddNewProjectfloor from '@/components/Projects/FloorPlans/NewFloor';
// import RouteProtect from '@/RouteProtect';
export const metadata = {
  ...metaObject('New Floor'),
};
type Props = {
    params: { slug: string };
  };



 function NewEmployeePage({params}:any) {
  const formattedTitle = params.slug.replace(/_/g, ' ');
  const pageHeader = {
    title: 'Add New Floor to ' + formattedTitle,
    breadcrumb: [
      
      // {
        
      //   name: 'Employee',
      // },
      // {
      //   name: 'Add',
      // },
    ],
  };
  return (
    <>
     <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
     </PageHeader>
      <AddNewProjectfloor slug={params.slug}/>
    </>
  );
}
export default NewEmployeePage