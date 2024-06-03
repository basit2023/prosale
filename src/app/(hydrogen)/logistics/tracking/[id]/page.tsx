import { useMemo } from 'react';
import PageHeader from '@/app/shared/page-header';
import ShippingInfo from '@/app/shared/logistics/tracking/shipping-info'; // Assuming correct import path
import TrackingOverview from '@/app/shared/logistics/tracking/tracking-overview';
import TrackingHistory from '@/app/shared/logistics/tracking/tracking-history';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  return metaObject(`Logs ${id}`);
}

export default function TrackingPage({ params }: any) {
  const pageHeader = useMemo(() => {
    return {
      title: 'Logs Details',
      breadcrumb: [],
    };
  }, [params.id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <TrackingOverview className="mb-10" />
      {/* <ShippingInfo /> */}
      {/* <TrackingHistory /> */}
    </>
  );
}
