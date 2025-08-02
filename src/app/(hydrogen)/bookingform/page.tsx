import { metaObject } from '@/config/site.config';
import CreateNewLeads from '@/components/LeadManagement/NewLeads/CreateLeads';
import PageHeader from '@/app/shared/page-header';
import BookingForm from '@/components/BookingForm/BookingForm';
export const metadata = {
  ...metaObject('New Leads'),
};

const pageHeader = {
  title: 'Booking Application Form',
  breadcrumb: [
    
    {
      
      name: 'Leads',
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
      <BookingForm/>
    </>
  );
}
