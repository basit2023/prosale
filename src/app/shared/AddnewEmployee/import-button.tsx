'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { PiArrowLineDownBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import cn from '@/utils/class-names';
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
  buttonLabel = 'Create Employee',
}: React.PropsWithChildren<ImportButtonProps>) {
  return (
    <Link href={routes.employee.newemployee} passHref>
      <Button
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
