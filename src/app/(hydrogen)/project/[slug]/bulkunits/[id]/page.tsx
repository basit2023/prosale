import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';
import BulkUnits from '@/components/Projects/FloorManage/BulkUnits';
import { decodeId } from '@/components/encriptdycriptdata';
import ImportButton from '@/app/shared/import-button-units';

type Props = {
  params: { id: string, slug: string };
};

/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const id = params.id;
  const slug = params.slug;

  return metaObject(`Edit floor ${slug}`);
}

const pageHeader = {
  title: 'Add Bulk Unit',
  breadcrumb: [
    {
      name: 'Floor',
    },
  ],
};

export default function InvoiceEditPage({ params }: Props) {
  const id = params.id;
  const slug = params.slug;

  console.log("the slug and id at the page.ts", id, slug); 

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
      
      </PageHeader>
 
      <BulkUnits id={decodeId(id)} slug={slug} />
      

    </>
  );
}

