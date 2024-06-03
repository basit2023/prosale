'use client';

import PageHeader, { PageHeaderTypes } from '@/app/shared/page-header';
// import ImportButton from '@/app/shared/import-button';
import ImportButton from '@/app/shared/import-customer-btn';
import ExportButton from '@/app/shared/export-button';
import TeamSettingsView from '@/app/shared/account-settings/team-settings';
import { useModal } from '@/app/shared/modal-views/use-modal';
import AddTeamMemberModalView from '@/app/shared/account-settings/modal/add-team-manager';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
type TableLayoutProps = {
  data: unknown[];
  header: string;
  fileName: string;
} & PageHeaderTypes;

export default function TableLayout({
  data,
  header,
  fileName,
  children,
  ...props
}: React.PropsWithChildren<TableLayoutProps>) {
  const { openModal } = useModal();
  const { data: session } = useSession<any>();
  const [userValue, setUserValue] = useState<any>();
  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const response = await apiService.get(`/all-permission/${session?.user?.email}`);
        const userData = response?.data?.permission[0]        ;
    
        setUserValue(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        
      }
    
     
    };

    if (session) {
      fetchData();
    }
  }, [session]);
  return (
    <>
      <PageHeader {...props}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
        {userValue && userValue.Create_permission >= 9 && (
         <div className="col-span-2 flex justify-end gap-4">
          <Button
            type="button"
            className="dark:bg-gray-100 dark:text-white"
            onClick={() =>
              openModal({
                view: <AddTeamMemberModalView />,
              })
            }
          >
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Add Team
          </Button>
        </div>
         )}
        </div>
      </PageHeader>

      {children}
    </>
  );
}
