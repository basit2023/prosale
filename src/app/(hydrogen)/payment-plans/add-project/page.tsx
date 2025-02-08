
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import PaymentPlanProject from '@/components/Projects/PaymentPlain/Addproject/PymentPlanProject';

export const metadata = {
  ...metaObject('Add PaymentPlan project'),
};

const pageHeader = {
  title: 'Payment Plan Parameters',
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
      <PaymentPlanProject/>
    </>
  );
}
export default NewEmployeePage