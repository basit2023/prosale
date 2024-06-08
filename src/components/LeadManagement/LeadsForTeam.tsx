// PersonalInfoView.js

'use client';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import Spinner from '@/components/ui/spinner';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';                                           
import { LeadSmsFormSchema,LeadSmsFormTypes,defaultValues } from '@/utils/validators/sms-lead.schema';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { decryptData } from '@/components/encriptdycriptdata';
const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,

  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});


export default function LeadForTeamMember({id}:any) {


  const { data: session } = useSession();
  const [allLabel, setAllLabel] = useState<any>([]);
  const [userType, setUserType] = useState<any>();
  const [leads,setLeades]=useState<any>();
  
const [value, setUserData]=useState<any>();
useEffect(() => {
  const fetchUserData = async () => {
    try {
      const encryptedData = localStorage.getItem('uData');
      if (encryptedData) {
        const data = decryptData(encryptedData);
        setUserData(data);
      } 
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error fetching user data. Please try again.');
    }
  };

  fetchUserData();
}, [session]);

  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const response = await apiService.get(`/lables-member/${id}`);
        
        const userData = response.data.allLabels;
     
        setAllLabel(userData);
      } catch (error:any) {
        console.error('Error fetching label data:', error);
        toast.error(error.response.data.message);
      }
      try {
        const result = await apiService.get(`/leads/?email=${session?.user?.email}`);
        
        const userData = result ;
        setLeades(userData);
      } catch (error:any) {
        console.error('Error fetching label data:', error);
        toast.error(error.response.data.message);
      }
      try {
          const response = await apiService.get(`/userpermission/${session?.user?.email}`);
          const userData = response.data;
          
          if (userData && userData.permission && userData.permission.length > 0) {
           const permissionNumber:any = userData.permission[0].split('.')[0];
            setUserType(parseFloat(permissionNumber));
          }
        } catch (error) {
        console.error('Error user permission:', error);
        toast.error('Error user permission. Please try again.');
      }
     
    };
    

    if (session) {
      fetchData();
    }
  }, [session]);




  const onSubmit: SubmitHandler<LeadSmsFormTypes> = async (data) => {
    
   
  };

         
    const sortedData = allLabel?.sort((a:any, b:any) => parseFloat(a.sort) - parseFloat(b.sort));
    //key={data.id} from permisson card


 return (
    <Form<LeadSmsFormTypes>
      validationSchema={LeadSmsFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors } }) => {
        return (
          <>
            
            <div className="content">
              <div className="container mx-auto px-10">
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4">
                {
                  userType >= 9 && sortedData?.map(data => {
                    const meetsPermissionCondition = parseFloat(data.permission.toString()) >= 9;
                    return meetsPermissionCondition && (
                      <Link href={routes.leads.show_label(data.id)} className="col-span-1">
                        <div className="bg-white rounded border border-gray-300 w-full pb-10 mb-5 mt-4">
                          <h3 className="text-black text-lg bg-gray-200 font-semibold p-4 mb-4" style={{ backgroundColor: `#${data.bg.split(',')[0]}` }}>{data.label}</h3>
                          <div className="flex flex-col items-center text-center">
                            <div className="text-theme text-7xl font-bold mb-2 text-gray-200" style={{ color: `#${data.bg.split(',')[0]}` }}>{data.label === 'Un Assigned' ? leads?.data?.total_unsigned : leads?.data?.total}</div>
                            <div className="text-2xl text-gray-200 ">Leads</div>
                          </div>
                          <div className="text-muted ml-3 mt-2">Closed: <strong>0</strong></div>
                        </div>
                      </Link>
                    );
                  })
                }

               
                 
                  
                </div> */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 pt-3">
                  {sortedData?.map((data:any)=>parseFloat(((data.permission as any))) <= 8 &&(
                     <Link key={data.id} href={routes.leads.show_specific_label(data.id,id)} className="col-span-1">
                     <div className="bg-white rounded border border-gray-300 w-full mb-5">
                       <h3 className="text-black text-lg bg-badc58 font-semibold p-4 mb-4" style={{ backgroundColor: `#${data.bg.split(',')[0]}` }}>{data.label}</h3>
                       <div className="flex flex-col items-center text-center">
                       <div className="text-theme text-7xl font-bold mb-2" style={{ color: `#${data.bg.split(',')[0]}` }}>{data.totalLeads}</div>
                       <div className="text-2xl bg-badc58 pb-4">Leads</div>
                     </div>
                       <div className="text-muted pb-3 pl-2">Closed: <strong>0</strong></div>
                     </div>
                   </Link>)
                    )}

                  </div>
              </div>
            </div> 
          </>
        );
      }}
    </Form>
  );
}