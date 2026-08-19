"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { deduplicatedGet } from '@/utils/apiService';
import { encryptData, decryptData } from '@/components/encriptdycriptdata';
import toast from 'react-hot-toast';

const UserContext = createContext<any>(undefined);

export const UserProvider = ({
  children,
  initialUserData = null,
}: {
  children: React.ReactNode;
  initialUserData?: any;
}) => {
  const { data: session } = useSession();
  const sessionEmail = session?.user?.email;
  const [userData, setUserData] = useState(initialUserData);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userData && sessionEmail) {
          const response = await deduplicatedGet(`/personalinfo/${sessionEmail}`);
          const data = response.data;
          const encryptedUserData = encryptData(data);
          localStorage.setItem('uData', encryptedUserData);
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }
    };

    fetchUserData();
  }, [sessionEmail, userData]);

  return (
    <UserContext.Provider value={{ userData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
