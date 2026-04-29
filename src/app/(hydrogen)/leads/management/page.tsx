'use client';
import React, { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import PageHeader from '@/app/shared/page-header-leads';
import Vaultinformation from '@/components/LeadManagement/LeadManagCard';
import ImportButton from '@/app/shared/import-button-lead';

const pageHeader = {
  title: 'Elaan Marketing',
  breadcrumb: [],
};

export default function NewEmployeePage() {
  const { data: session } = useSession();
  const memoizedsession = useMemo(() => session, [session]);
  

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
      
          <ImportButton title={'Import File'} csv={memoizedsession?.user?.permission > 8}/>
        
      </PageHeader>
      <Vaultinformation />
    </>
  );
}