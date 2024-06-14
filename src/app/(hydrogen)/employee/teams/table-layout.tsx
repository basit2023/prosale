'use client';

import PageHeader, { PageHeaderTypes } from '@/app/shared/page-header-team';


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
  return (
    <>
      <PageHeader {...props}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
    
        </div>
      </PageHeader>

      {children}
    </>
  );
}
