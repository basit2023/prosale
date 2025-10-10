"use client"
import { useRouter, useSearchParams } from 'next/navigation';  // Import useSearchParams for query params
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import UpdateTarget from '@/components/RevenueTargets/UpdateTrget';

export const dynamic = 'force-dynamic';

type Props = {
  params: { id: string };
};

const pageHeader = {
  breadcrumb: [
    {
      href: routes.RevenueTargets.RevenueTargets,
      name: 'Targets List',
    },
    {
      href: '#',
      name: 'Update',
    },
  ],
};

export default function InvoiceEditPage({ params }: Props) {
  const { id } = params;  // Route param: /update/:id
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the 'full_name' from the query string using next/navigation
  const fullName = searchParams?.get('name') || '';  // Use useSearchParams to access query params

  const pageHeaderWithEmployeeName = {
    ...pageHeader,
    title: `Update Leads for ${fullName}`,  // Dynamic title with employee name
  };

  return (
    <>
      <PageHeader title={pageHeaderWithEmployeeName.title} breadcrumb={pageHeaderWithEmployeeName.breadcrumb} />
      <UpdateTarget id={id} />
    </>
  );
}
