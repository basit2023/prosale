'use client';

import { Button } from '@/components/ui/button';
import cn from '@/utils/class-names';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { PiUploadSimpleLight } from "react-icons/pi";

type ImportButtonProps = {
  title?: string;
  className?: string;
  buttonLabel?: string;
  id: string; 
  slug: string; 
};

export default function ImportButton({
  id,
  slug,
  title,
  className,
  buttonLabel = 'Bulk Upload',
  children,
}: React.PropsWithChildren<ImportButtonProps>) {
  console.log("the id and the slug at button are:", id, slug, buttonLabel);

  return (
    <Link href={routes.project.addbulkunit(slug, id)} passHref>
      <Button
        className={cn(
          'w-full @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100',
          className
        )}
      >
        <PiUploadSimpleLight className="me-1.5 h-4 w-4" />
        {buttonLabel}
      </Button>
    </Link>
  );
}
