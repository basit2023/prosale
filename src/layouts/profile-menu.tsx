'use client';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover } from '@/components/ui/popover';
import { Title, Text } from '@/components/ui/text';
import { routes } from '@/config/routes';
import apiService from '@/utils/apiService';
import cn from '@/utils/class-names';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AES, enc } from 'crypto-js';
import { usePathname, useRouter } from 'next/navigation';
import { decryptData } from '@/components/encriptdycriptdata';
const menuItems = [
  {
    name: 'My Profile',
    href: routes.forms.personalInformation,
  },
  // {
  //   name: 'Account Settings',
  //   href: routes.forms.profileSettings,
  // },
  {
    name: 'Activity Log',
    href:'/activitylogs',
  },
];
function DropdownMenu() {
  const { data: session } = useSession();
  const router = useRouter();

  const encryptedData:any = localStorage.getItem('userData');
  const decryptedData = AES.decrypt(encryptedData, 'encryptionSecret');
  const decData = JSON.parse(decryptedData.toString(enc.Utf8));
  
  const ncryptedData = localStorage.getItem('uData');
  const value: any =decryptData(ncryptedData)
  
  const displayName = value ? `${value.user.first_name} ${value.user.last_name}` : 'User';
  const base64Image = value ? `${value.user.img}` : '';
  const designation=value ? `${value.user.role}` : '';
      //console.log('Base64 Image Data:', base64Image);

      const parts = base64Image.split(';base64,');
      const mimeType = parts[0].split(':')[1];
      const imageData = parts[1];

      const imageBuffer = imageData ? Buffer.from(imageData, 'base64') : undefined;
      
  return (
    <div className="w-64 text-left rtl:text-right">
      <div className="flex items-center border-b border-gray-300 px-6 pb-5 pt-6">
        <Avatar
          //src=imageBuffer?imageBuffer:"https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-11.webp"
          // src={imageBuffer ? `data:${mimeType};base64,${imageData}` : 'fallback_url'}base64Image
          src={base64Image ? base64Image : 'fallback_url'}
          name="Albert Flores"
          color="invert"
        />
        <div className="ms-3">
          <Title as="h6" className="font-semibold">
          {displayName}
          </Title>
          <Text className="text-gray-600">{designation}</Text>
        </div>
      </div>
      <div className="grid px-3.5 py-3.5 font-medium text-gray-700">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-50/50"
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="border-t border-gray-300 px-6 pb-6 pt-5">
        <Button
          className="h-auto w-full justify-start p-0 font-medium text-gray-700 outline-none focus-within:text-gray-600 hover:text-gray-900 focus-visible:ring-0"
          variant="text"
          onClick={() => {
            // Save the current URL to localStorage
            const currentUrl = window.location.href;
            localStorage.setItem('lastVisited', currentUrl);

            signOut(
              {
              callbackUrl: routes.signIn, // Ensure the user is redirected to the sign-in page after sign-out
            }
            ).then(() => {
              toast.success('Sign Out Successful');
              // No need for router.push here, it will be handled by signOut
            });
          }}
          // onClick={() => {
          //   const currentUrl:any = window.location.href;
          //   localStorage.setItem('lastVisited', currentUrl);
          //   signOut();
          //   toast.success('Sign Out Successful'); // Show success toast
          //   router.push(routes.signIn)
            
          // }}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function ProfileMenu({
  buttonClassName,
  avatarClassName,
}: {
  buttonClassName?: string;
  avatarClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  const { data: session } = useSession();
  const encryptedData = localStorage.getItem('userData');
  const ncryptedData = localStorage.getItem('uData');
  const value: any =decryptData(ncryptedData)


  const base64Image = value ? `${value.user.img}` : '';
      // console.log('Base64 Image Data:', base64Image);

      const parts = base64Image.split(';base64,');
      const mimeType = parts[0].split(':')[1];
      const imageData = parts[1];

      // Create a buffer from the Base64 data
      // const imageBuffer = Buffer.from(imageData, 'base64');
      const imageBuffer = imageData ? Buffer.from(imageData, 'base64') : undefined;

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      content={() => <DropdownMenu />}
      shadow="sm"
      placement="bottom-end"
      className="z-50 p-0 dark:bg-gray-100 [&>svg]:dark:fill-gray-100"
    >
      <button
        className={cn(
          'w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10',
          buttonClassName
        )}
      >
        <Avatar
          src={imageBuffer ? `data:${mimeType};base64,${imageData}` : 'fallback_url'}
          name="User"
          color="invert"
          className={cn('!h-9 w-9 sm:!h-10 sm:w-10', avatarClassName)}
        />
      </button>
    </Popover>
  );
}
