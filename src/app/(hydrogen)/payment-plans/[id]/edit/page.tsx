
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';
import EditPaymentPlan from '@/components/Projects/PaymentPlain/Addproject/EditPaymentplan';
import {decodeId} from '@/components/encriptdycriptdata';

type Props = {
  params: { id: any , slug:string};
};

/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const id = params.id;


  return metaObject(`Edit Payment Plan`);
}

const pageHeader = {
  title: 'Edit Payment Plan',
  breadcrumb: [
    
    {
      href: routes.paymentPlans.paymentPlans,
      name: 'Payment Plan Parameters',
    },
    {
      // name: 'Edit',
    },
  ],
};

export default function InvoiceEditPage({ params }: any) {

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
       
      </PageHeader>
    
      <EditPaymentPlan id={decodeId(params.id)}/>
     
      
    </>
  );
}
