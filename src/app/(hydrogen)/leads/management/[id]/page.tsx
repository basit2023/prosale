'use client'
import AnalyticsDashboard from '@/app/shared/analytics-dashboard';
import { metaObject } from '@/config/site.config';
import CreateNewEmployee from '@/app/shared/AddnewEmployee/AddNewEmployee';
import PageHeader from '@/app/shared/page-header-member';
import LeadForTeamMember from '@/components/LeadManagement/LeadsForTeam';

// export const metadata = {
//   ...metaObject(`Leads`),
// };

type Props = {
  params: { id: string };
};

const pageHeader = ({ id }: any) => ({
  title: id,
  breadcrumb: [],
});

export default function NewEmployeePage({ params }: any) {
  const { id } = params; // Extract the id from params

  return (
    <>
      <PageHeader
        title={pageHeader({ id }).title}
        breadcrumb={pageHeader({ id }).breadcrumb}
      />
      <LeadForTeamMember id={id} />
    </>
  );
}
