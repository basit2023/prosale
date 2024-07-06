"use client"
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
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
      href: routes.leads.management,
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

      <div className="grid grid-cols-12 gap-2 z-[-999] mb-4">
        <div className="col-span-12 sm:col-span-4 pt-0 ">
          <CustomerDetails id={params.id} />
        </div>
        <div className="col-span-12 sm:col-span-8 z-[-999]">
          <div className="mt-5 flex gap-2 gap-y-6 @container sm:gap-y-10 col-span-8">
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
