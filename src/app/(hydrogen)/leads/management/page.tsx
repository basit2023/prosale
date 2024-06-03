'use client';
import AnalyticsDashboard from '@/app/shared/analytics-dashboard';
// import { metaObject } from '@/config/site.config';
import CreateNewEmployee from '@/app/shared/AddnewEmployee/AddNewEmployee';
import PageHeader from '@/app/shared/page-header-leads';
import Vaultinformation from '@/components/LeadManagement/LeadManagCard';
import ChangeCompanyButton from '@/components/LeadManagement/Change-button';
import React, { useState } from 'react';
// export const metadata = {
//   ...metaObject('Lead Management'),
// };

const pageHeader = {
  title: 'All',
  breadcrumb: [
    
    // {
      
    //   name: 'Empoyee',
    // },
    // {
    //   name: 'Add',
    // },
  ],
};

export default function NewEmployeePage() {
  const [companyId, setCompanyId] = useState(undefined);
  if(companyId){
    pageHeader.title=companyId;
  }
  return (
    <>
        <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
          <ChangeCompanyButton onCompanyIdChange={setCompanyId} company={companyId}/>
        </PageHeader>
        <Vaultinformation id={companyId} onCompanyIdChange={setCompanyId} style={{ zIndex: -40 }}/>
      </>
    );
}
