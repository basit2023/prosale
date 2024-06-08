"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import apiService from '@/utils/apiService';
import { encryptData, decryptData } from '@/components/encriptdycriptdata';
import toast from 'react-hot-toast';

const UserContext = createContext();

export const UserProvider = ({ children, initialUserData }) => {
  const { data: session } = useSession();
  const [userData, setUserData] = useState(initialUserData);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userData && session) {
          const response = await apiService.get(`/personalinfo/${session.user.email}`);
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
  }, [session]);

  return (
    <UserContext.Provider value={{ userData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
