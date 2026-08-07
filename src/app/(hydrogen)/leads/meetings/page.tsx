import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';
import Meetings from '@/components/LeadManagement/Meetings';

export const metadata = {
  ...metaObject('Meetings'),
};

const pageHeader = {
  title: 'Meetings',
  breadcrumb: [
    {
      href: routes.leads.management,
      name: 'Lead Management',
    },
    {
      name: 'Meetings',
    },
  ],
};

export default function MeetingsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <Meetings />
    </>
  );
}
