import AnalyticsDashboard from '@/app/shared/analytics-dashboard';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import AddNewProject from '@/components/Projects/NewProject';
// import RouteProtect from '@/RouteProtect';
export const metadata = {
  ...metaObject('New Employee'),
};

const pageHeader = {
  title: 'Add Projects',
  breadcrumb: [
    
    // {
      
    //   name: 'Employee',
    // },
    // {
    //   name: 'Add',
    // },
  ],
};

 function NewEmployeePage() {
  return (
    <>
     <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
     </PageHeader>
      <AddNewProject/>
    </>
  );
}
export default NewEmployeePage