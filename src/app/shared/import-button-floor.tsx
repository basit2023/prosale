'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { PiArrowLineDownBold } from 'react-icons/pi';

import cn from '@/utils/class-names';

import { routes } from '@/config/routes';
import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import { PiPencilSimpleLight } from "react-icons/pi";


type ImportButtonProps = {
  title?: string;
  className?: string;
  buttonLabel?: string;
  id?:any;
  slug?:any;
};

export default function ImportButton({
  title,
  id,
  slug,
  className,
  buttonLabel = 'Manage Units',
}: React.PropsWithChildren<ImportButtonProps>) {
  return (
    <Link href={routes.project.managefloor(slug,id)} passHref>
      <Button
         // Use "as" prop to specify the rendered element
        className={cn(
          'w-full @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100',
          className
        )}
      >
        <PiPencilSimpleLight className="me-1.5 h-4 w-4" />
        {buttonLabel}
      </Button>
    </Link>
  );
}
