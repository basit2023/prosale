




'use client';
import { useSession } from 'next-auth/react';
import { useEffect,useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Switch } from "rizzui";
import FormGroup from '@/app/shared/form-group';

import apiService from '@/utils/apiService';



export default function SmsPlugins() {
  const { data: session } = useSession();
  // const [value, setValue] = useState<any>();
  const [isEditing, setIsEditing] = useState(true);
//   const [value, setUserData]=useState<any>();
  
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const encryptedData = localStorage.getItem('uData');
//         if (encryptedData) {
//           const data = decryptData(encryptedData);
//           setUserData(data);
//         } 
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         toast.error('Error fetching user data. Please try again.');
//       }
//     };

//     fetchUserData();
//   }, [session]);





//   const displayName = value ? `${value.user.first_name} ${value.user.last_name}` : 'User';
const [isSmsDisabled, setIsSmsDisabled] = useState(false);

  const handleToggle = async () => {
    const newState = !isSmsDisabled;
    setIsSmsDisabled(newState);

    // Send the state to the backend
    try {
      await axios.post('/api/sms-toggle', { isSmsDisabled: newState });
    } catch (error) {
      console.error('Error sending request to backend:', error);
    }
  };

  return (
    <>
      
      <>
      <FormGroup
        title="Telenor SMS"
        className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
      >
        <div className="col-span-full flex justify-between items-center">
          <p>Disable sending message</p>
          <Switch
            variant="outline"
            label="Outline"
            // checked={}
            // onChange={}
          />
        </div>
      </FormGroup>
    </>
                
      </>
  );
}