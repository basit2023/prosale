'use client';

import PageHeader, { PageHeaderTypes } from '@/app/shared/page-header';

import ImportActivityButton from '@/app/shared/import-button-activity-report';
import { useMemo } from 'react';
import { useSession } from 'next-auth/react';

type TableLayoutProps = {
  data: unknown[];
  header: string;
  fileName: string;
} & PageHeaderTypes;

export default function TableLayout({
  data,
  header,
  fileName,
  children,
  ...props
}: React.PropsWithChildren<TableLayoutProps>) {
   const { data: session } = useSession();
  const memoizedSession=useMemo(()=>session,[session])

  return (
    <>
      <PageHeader {...props}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          
        { memoizedSession?.user?.permission>=9 && (<ImportActivityButton title={'Import File'} />)}
        </div>
      </PageHeader>

      {children}
    </>
  );
}
