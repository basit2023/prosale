import { PiDownloadSimpleBold } from 'react-icons/pi';
import InvoiceDetails from '@/app/shared/invoice/invoice-details';
import PrintButton from '@/app/shared/print-button';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import ShowFollowup from '@/components/LeadManagement/followup';
// import ActivityReport from '@/app/shared/file/dashboard/activity-report';
// import ActivityReport from '@/components/LeadManagement/Activity-report';
import ActivityReport from '@/components/DailyActivity/full-report';
export const metadata = {
  ...metaObject('Activity Summary Report'),
};

const pageHeader = {
  title: 'Print Activity Summary Report',
  breadcrumb: [
    {
      href:"#",
      name: '',
    },
    
    {
    //   name: 'Details',
    },
  ],
};

export default function InvoiceDetailsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {/* <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <PrintButton />
          <Button className="w-full @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100">
            <PiDownloadSimpleBold className="me-1.5 h-[17px] w-[17px]" />
            Download
          </Button>
        </div> */}
      </PageHeader>

      {/* <InvoiceDetails /> */}
      <ActivityReport/>

    </>
  );
}
