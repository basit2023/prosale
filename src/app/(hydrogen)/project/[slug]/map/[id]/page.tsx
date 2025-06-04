import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';

import MapImag from '@/components/Projects/FloorPlans/floorAction/MapImag';

import { decodeId } from '@/components/encriptdycriptdata';
import ImportButton from '@/app/shared/import-button-units';

type Props = {
  params: { id: string; slug: string };
};

/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = params; // Ensure params are correctly accessed
  return metaObject(`Draw Units for Floor`);
}

export default function InvoiceEditPage({ params }: Props) {
  const { id, slug } = params; // Destructure params correctly

  const formattedTitle = slug.replace(/_/g, ' ');
  const pageHeader = {
    title: 'Map Floor ' + formattedTitle,
    breadcrumb: [
      {
        name: 'Map',
      },
    ],
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      <MapImag id={decodeId(id)} slug={slug} />
    </>
  );
}
