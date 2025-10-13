import AnalyticsDashboard from '@/app/shared/analytics-dashboard';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import AddNewProject from '@/components/Projects/NewProject';
import NewRealtorsForm from '@/components/Realtors/NewRealtors';

export const metadata = {
  ...metaObject('New Employee'),
};

const pageHeader = {
  title: 'Add Realtors',
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
      <NewRealtorsForm/>
    </>
  );
}
export default NewEmployeePage