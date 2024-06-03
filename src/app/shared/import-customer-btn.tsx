'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { PiArrowLineDownBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import cn from '@/utils/class-names';
import Mydetails from './account-settings/Mydetails';
import { routes } from '@/config/routes';
import Link from 'next/link';

const FileUpload = dynamic(() => import('@/app/shared/file-upload'), {
  ssr: false,
});

type ImportButtonProps = {
  title?: string;
  className?: string;
  buttonLabel?: string;
};

export default function ImportButton({
  title,
  className,
  buttonLabel = 'Create Customer',
}: React.PropsWithChildren<ImportButtonProps>) {
  return (
    <Link href={routes.leads.newcustomer} passHref>
      <Button
         // Use "as" prop to specify the rendered element
        className={cn(
          'w-full @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100',
          className
        )}
      >
        {buttonLabel}
      </Button>
    </Link>
  );
}
