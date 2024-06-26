'use client';

import FolderIcon from '@/components/icons/folder-solid';
import { Title, Text } from '@/components/ui/text';
import cn from '@/utils/class-names';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PiCaretLeftBold, PiCaretRightBold } from 'react-icons/pi';
import { useScrollableSlider } from '@/hooks/use-scrollable-slider';
import { decryptData } from '@/components/encriptdycriptdata';
import { useEffect, useState } from 'react';

const mockdata = [
  {
    id: 1,
    file: {
      name: 'Employee Sheet',
      image: FolderIcon,
    },
    link: '/employee/list',
  },
  {
    id: 2,
    file: {
      name: 'Lead Customer',
      image: FolderIcon,
    },
    link: '/leads/customers',
  },
  {
    id: 3,
    file: {
      name: 'Lead Management',
      image: FolderIcon,
    },
    link: '/leads/management',
  },
  {
    id: 4,
    file: {
      name: 'Project List',
      image: FolderIcon,
    },
    link: '/project/list',
  },
  {
    id: 5,
    file: {
      name: 'New Employee',
      image: FolderIcon,
    },
    link: '/employee/new',
  },
];

export function QuickAccessCard({
  item,
  className,
  userPermissions,
}: {
  item: any;
  className?: string;
  userPermissions: number;
}) {
  // Retrieve sidebar items from localStorage
  const transformedItemsString = localStorage.getItem('sidebar');
  let transformedItems;

  try {
    const decryptedString = decryptData(transformedItemsString);
    transformedItems = transformedItemsString ? (decryptedString) : [];
  } catch (error) {
    console.error('Error decrypting or parsing sidebar data:', error);
    transformedItems = [];
  }

  // Check if the item or its dropdownItems match the permissions
  const hasPermission = transformedItems.some((transformedItem: any) => {
    if (transformedItem.href === item.link && (userPermissions >= transformedItem.permission_level || userPermissions >= transformedItem.permission)) {
      return true;
    }
    if (transformedItem.dropdownItems) {
      return transformedItem.dropdownItems.some((dropdownItem: any) => {
        return dropdownItem.href === item.link && userPermissions >= dropdownItem.permission_level;
      });
    }
    return false;
  });

  // Show only if the user has the required permissions
  if (!hasPermission) return null;

  return (
    <Link
      href={item.link}
      className={cn(
        className,
        'relative flex flex-col items-center justify-center rounded-lg bg-gray-50 p-7 dark:bg-gray-100/50'
      )}
    >
      {item?.file?.image && (
        <div className="w-14">
          <item.file.image />
        </div>
      )}
      <Text className="mt-5 w-full truncate text-center text-sm font-medium text-gray-700">
        {item?.file?.name}
      </Text>
    </Link>
  );
}

export default function QuickAccess({ className }: { className?: string }) {
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  // Retrieve encrypted permission data from localStorage
  const encryptedPermission = localStorage.getItem('permission');

  let permissionData;
  try {
    permissionData = encryptedPermission ? decryptData(encryptedPermission) : null;
  } catch (error) {
    console.error('Error decrypting permission data:', error);
    permissionData = null;
  }

  // Initialize state for user permissions
  const [perm_d, setPerm_d] = useState<any>(permissionData);
  const userPermissions = perm_d ? perm_d[0].permission_level : null;

  return (
    <div className={className}>
      <div className="col-span-full mb-3 flex items-center justify-between 2xl:mb-5">
        <Title as="h3" className="text-lg font-semibold xl:text-xl">
          Quick Access
        </Title>
      </div>
      <div className="relative">
        <Button
          title="Prev"
          variant="text"
          ref={sliderPrevBtn}
          onClick={() => scrollToTheLeft()}
          className="!absolute left-0 top-0 z-10 !h-full w-8 !justify-start rounded-none bg-gradient-to-r from-white via-white to-transparent px-0 text-gray-500 hover:text-black dark:from-gray-50/80 dark:via-gray-50/80 3xl:hidden"
        >
          <PiCaretLeftBold className="h-5 w-5" />
        </Button>
        <div className="w-full overflow-hidden">
          <div
            ref={sliderEl}
            className="custom-scrollbar-x grid grid-flow-col gap-5 overflow-x-auto scroll-smooth"
          >
            {mockdata
              .filter((item) => {
                const transformedItemsString = localStorage.getItem('sidebar');
                let transformedItems;

                try {
                  const decryptedString = decryptData(transformedItemsString);
                  transformedItems = transformedItemsString ? (decryptedString) : [];
                } catch (error) {
                  console.error('Error decrypting or parsing sidebar data:', error);
                  transformedItems = [];
                }

                const hasPermission = transformedItems.some((transformedItem: any) => {
                  if (transformedItem.href === item.link && (userPermissions >= transformedItem.permission_level || userPermissions >= transformedItem.permission)) {
                    return true;
                  }
                  // Check dropdownItems
                  if (transformedItem.dropdownItems) {
                    return transformedItem.dropdownItems.some((dropdownItem: any) => {
                      return dropdownItem.href === item.link && userPermissions >= dropdownItem.permission_level;
                    });
                  }
                  return false;
                });

                return hasPermission;
              })
              .map((item) => (
                <QuickAccessCard
                  key={item.id}
                  item={item}
                  userPermissions={userPermissions}
                />
              ))}
          </div>
        </div>
        <Button
          title="Next"
          variant="text"
          ref={sliderNextBtn}
          onClick={() => scrollToTheRight()}
          className="!absolute right-0 top-0 z-10 !h-full w-8 !justify-end rounded-none bg-gradient-to-l from-white via-white to-transparent px-0 text-gray-500 hover:text-black dark:from-gray-50/80 dark:via-gray-50/80 3xl:hidden"
        >
          <PiCaretRightBold className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
