'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { PiArrowLineDownBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import cn from '@/utils/class-names';
import Mydetails from './account-settings/Mydetails';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
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
  buttonLabel = 'New Project',
}: React.PropsWithChildren<ImportButtonProps>) {
  return (
    <Link href={routes.project.newproject} passHref>
      <Button
         // Use "as" prop to specify the rendered element
        className={cn(
          'w-full @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100',
          className
        )}
      >
        <PiPlusBold className="me-1.5 h-4 w-4" />
        {buttonLabel}
      </Button>
    </Link>
  );
}
