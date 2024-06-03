'use client';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import CreateInvoice from '@/app/shared/invoice/create-invoice';
import { PiArrowLineUpBold } from 'react-icons/pi';
import ImportButton from '@/app/shared/import-button';
import { CustomerDetails, InvoiceDetails } from '@/components/LeadManagement/AllCustomers/CustomerDetails';
import { Empty } from "rizzui";
import TableLayout from './tabel-layout';
import InvoiceTable from '@/components/LeadManagement/AllCustomers/AssignedLeads/table';
import { useEmployeeData } from '@/components/LeadManagement/AllCustomers/AssignedLeads/AssignedLead';
import { useSession } from 'next-auth/react';

type Props = {
  params: { id: any };
};

let pageHeader = {
  title: 'Leads View',
  breadcrumb: [
    {
      name: 'Lead',
    },
    {
      name: 'Edit',
    },
  ],
};

export default function InvoiceEditPage({ params }: Props) {
  const invoiceData = useEmployeeData({ id: params.id });

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
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
      <EnhancedTable id={params.id} />
    </>
  );
}

export function EnhancedTable({ id }:any) {
  const invoiceData = useEmployeeData({ id });

  if (invoiceData.length === 0) {
    setTimeout(() => {
      renderComponents();
    }, 1000);

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        <Empty text="No Data found" textClassName="mt-2" />
      </div>
    );
  }

  return renderComponents();

  function renderComponents() {
    return (
      <TableLayout
        className="mt-10"
        title="" // "Total Assigned Lead"
        breadcrumb={pageHeader.breadcrumb}
        data={invoiceData}
        fileName="invoice_data"
        header="ID,Name,Email,Mobile,CNIC,Designation,Department,Assigned Office,Status"
      >
        <InvoiceTable data={invoiceData} />
      </TableLayout>
    );
  }
}