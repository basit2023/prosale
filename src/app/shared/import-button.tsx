'use client';


import { Button } from '@/components/ui/button';

import cn from '@/utils/class-names';

import { routes } from '@/config/routes';
import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';



type ImportButtonProps = {
  title?: string;
  className?: string;
  buttonLabel?: string;
};

export default function ImportButton({
  title,
  className,
  buttonLabel = 'New Employee',
}: React.PropsWithChildren<ImportButtonProps>) {
  return (
    <Link href={routes.employee.newemployee} passHref>
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
