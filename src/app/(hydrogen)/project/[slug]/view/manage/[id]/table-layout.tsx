'use client';

import PageHeader, { PageHeaderTypes } from '@/app/shared/page-header';
import UpdateAllunits from '@/components/Projects/FloorManage/UpdateFits';
import {decodeId} from '@/components/encriptdycriptdata';
type TableLayoutProps = {
  data: unknown[];
  header: string;
  fileName: string;
  id:any;
  slug:string;
} & PageHeaderTypes;

export default function TableLayout({
  data,
  header,
  fileName,
  title,
  breadcrumb,
  id,
  slug,
  children,
  ...props
}: React.PropsWithChildren<TableLayoutProps>) {
  return (
    <>
      <PageHeader title={title} breadcrumb={breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0 z-100">
          {/* <ExportButton data={data} fileName={fileName} header={header} /> */}
          {/* <ImportButton/> */}
          <UpdateAllunits id={decodeId(id)} slug={slug}/>
        </div>
      </PageHeader>

      {children}
    </>
  );
}
