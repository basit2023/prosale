'use client';

import StorageReport from '@/app/shared/file/dashboard/storage-report';
import FileStats from '@/app/shared/file/dashboard/file-stats';
import StorageSummary from '@/app/shared/file/dashboard/storage-summary';
import RecentFiles from '@/app/shared/file/dashboard/recent-files';
import QuickAccess from '@/app/shared/file/dashboard/quick-access';
import ActivityReport from '@/app/shared/file/dashboard/activity-report';
import Members from '@/app/shared/file/dashboard/members';
import FileListTable from '@/app/shared/file/dashboard/file-list/table';
import UpgradeStorage from '@/app/shared/file/dashboard/upgrade-storage';
import RecentActivities from '@/app/shared/file/dashboard/recent-activities';
import { allFilesData } from '@/data/all-files';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { encryptData } from '@/components/encriptdycriptdata';
import { decryptData } from '@/components/encriptdycriptdata';
interface UserType {
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  mobile: string;
  isp: string;
  cnic: string;
  img: string;
  gender: string;
}

interface ValueType {
  user: UserType;
}


export default function FileDashboard() {

  const { data: session } = useSession();
  const encryptedData = localStorage.getItem('uData');
  const userData: any =decryptData(encryptedData)

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userData && session) {
          const response = await apiService.get(`/personalinfo/${session.user.email}`);
          const userData = response.data;
          const encryptedUserData = encryptData(userData);
          localStorage.setItem('uData', encryptedUserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
    };

    fetchData();
  }, [session, userData]);


  return (
    <div className="mt-2 @container">
      <FileStats className="mb-5 2xl:mb-8" />
      <div className="mb-6 grid grid-cols-1 gap-6 @4xl:grid-cols-12 2xl:mb-8 2xl:gap-8">
      <div className="@container @4xl:col-span-8 @[96.937rem]:col-span-9 flex flex-col">
        <StorageReport className="w-full flex-box" />
      </div>
      <div className="@4xl:col-span-4 @[96.937rem]:col-span-3 flex flex-col">
        <StorageSummary className="w-full" />
      </div>
    </div>


      <div className="grid grid-cols-1 gap-6 @container lg:grid-cols-12 2xl:gap-8 ">
        <div className="col-span-full flex flex-col gap-6 @6xl:col-span-8 2xl:gap-8 3xl:col-span-12">
          {/* <QuickAccess /> */}
          <RecentFiles />
          <ActivityReport />
          <FileListTable data={allFilesData} />
        </div>

        <div className="col-span-full flex flex-col gap-6 @5xl:col-span-4 2xl:gap-8 3xl:col-span-3">
          <RecentActivities />
          <Members />
          <UpgradeStorage />
        </div>
      </div>
    </div>
  );
}
