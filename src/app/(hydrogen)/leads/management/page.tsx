'use client';
import AnalyticsDashboard from '@/app/shared/analytics-dashboard';
// import { metaObject } from '@/config/site.config';
import CreateNewEmployee from '@/app/shared/AddnewEmployee/AddNewEmployee';
import PageHeader from '@/app/shared/page-header-leads';
import Vaultinformation from '@/components/LeadManagement/LeadManagCard';
import ChangeCompanyButton from '@/components/LeadManagement/Change-button';
import ImportButton from '@/app/shared/import-button-lead';
import React, { useState } from 'react';
// export const metadata = {
//   ...metaObject('Lead Management'),
// };

const pageHeader = {
  title: 'Elaan Marketing',
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
  
  return (
    <>
        <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
          <ImportButton title={'Import File'} />
          {/* <ChangeCompanyButton onCompanyIdChange={setCompanyId} company={companyId}/> */}
        </PageHeader>
        <Vaultinformation />
      </>
    );
}
