'use client';

import PageHeader, { PageHeaderTypes } from '@/app/shared/page-header';
import ImportButton from '@/app/shared/import-button-project';
import FloorSelection from '@/components/Projects/FloorPlans/FloorSelection';

type TableLayoutProps = {
  data: unknown[];
  header: string;
  fileName: string;
  id:any;
  slug:any;
} & PageHeaderTypes;

export default function TableLayout({
  data,
  header,
  fileName,
  title,
  breadcrumb,
  slug,
  children,
  ...props
}: React.PropsWithChildren<TableLayoutProps>) {
  return (
    <>
      <PageHeader title={title} breadcrumb={breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0 z-100">
          {/* <ExportButton data={data} fileName={fileName} header={header} /> */}
          <FloorSelection slug={slug}/>
        </div>
      </PageHeader>

      {children}
    </>
  );
}
