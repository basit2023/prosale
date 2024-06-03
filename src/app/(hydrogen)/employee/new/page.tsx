import AnalyticsDashboard from '@/app/shared/analytics-dashboard';
import { metaObject } from '@/config/site.config';
import CreateNewEmployee from '@/app/shared/AddnewEmployee/AddNewEmployee';
import PageHeader from '@/app/shared/page-header';
export const metadata = {
  ...metaObject('New Employee'),
};

const pageHeader = {
  title: 'Add New Employee',
  breadcrumb: [
    
    // {
      
    //   name: 'Employee',
    // },
    // {
    //   name: 'Add',
    // },
  ],
};

export default function NewEmployeePage() {
  return (
    <>
     <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
     </PageHeader>
      <CreateNewEmployee/>
    </>
  );
}
