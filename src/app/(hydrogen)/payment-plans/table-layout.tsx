'use client';

import PageHeader, { PageHeaderTypes } from '@/app/shared/page-header';

import PaymentHeader from '@/components/Projects/PaymentPlain/PaymentHeader';

type TableLayoutProps = {
  data: unknown[];
  header: string;
  fileName: string;
 
  
} & PageHeaderTypes;

export default function TableLayout({
  data,
  header,
  fileName,
  title,
  breadcrumb,
  children,
  ...props
}: React.PropsWithChildren<TableLayoutProps>) {
  return (
    <>
      <PageHeader title={title} breadcrumb={breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0 z-100">
          {/* <ExportButton data={data} fileName={fileName} header={header} /> */}
          <PaymentHeader/>
        </div>
      </PageHeader>

      {children}
    </>
  );
}
