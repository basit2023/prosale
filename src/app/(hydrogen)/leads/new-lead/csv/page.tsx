import { metaObject } from '@/config/site.config';
import CSVLeadUploader from '@/components/LeadManagement/NewLeads/CSVLeadUploader';
// import CreateNewLeads from '@/components/LeadManagement/NewLeads/CreateLeads';
import PageHeader from '@/app/shared/page-header';
export const metadata = {
  ...metaObject('New Leads'),
};

const pageHeader = {
  title: 'CSV Leads',
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
      <CSVLeadUploader/>
    </>
  );
}
