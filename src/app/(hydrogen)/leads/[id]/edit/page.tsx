"use client"
import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import CreateInvoice from '@/app/shared/invoice/create-invoice';
import { PiArrowLineUpBold } from 'react-icons/pi';
import ImportButton from '@/app/shared/import-button';
import { InvoiceDetails, CustomerDetails } from '@/components/LeadManagement/CustomerDetails';
import CustomerComments from '@/components/LeadManagement/comments';
import DeliveryDetails from '@/components/LeadManagement/table2';
import ShowComments from '@/components/LeadManagement/ShowComments';
import ChangeStatus from '@/components/LeadManagement/ChangeStatus';
import { useEffect, useState } from 'react';
import { generateMetadata } from './metadata'; // Import generateMetadata function

type Props = {
  params: { id: any };
};

const pageHeader = {
  title: 'Leads View',
  breadcrumb: [
    {
      href: routes.invoice.home,
      name: 'Lead',
    },
    {
      name: 'Edit',
    },
  ],
};

export default function InvoiceEditPage({ params }: any) {
  const [update, setUpdate] = useState();

  // Generate metadata using the generateMetadata function
  useEffect(() => {
    generateMetadata({ params });
  }, [params]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {/* <ImportButton title="Upload File" className="mt-4 @lg:mt-0" /> */}
        <ChangeStatus id={params.id} />
        {/* <StChangeButton id={params.id}/> */}
      </PageHeader>

      <div className="grid grid-cols-12 gap-2 z-[-999]">
        <div className="col-span-12 sm:col-span-4 pt-0 mb-4">
          <CustomerDetails id={params.id} />
        </div>
        <div className="col-span-12 sm:col-span-8 z-[-999]">
          <div className="mt-3 flex gap-2 gap-y-6 @container sm:gap-y-10 col-span-8">
            <InvoiceDetails id={params.id} />
          </div>
        </div>
      </div>

      <DeliveryDetails id={params.id} />
      <CustomerComments  onComment={setUpdate} id={params.id} />
      <ShowComments id={params.id} update={update}/>

    </>
  );
}
