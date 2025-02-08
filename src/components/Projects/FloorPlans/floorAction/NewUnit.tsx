// 'use client';
// import { logsCreate } from '@/app/shared/account-settings/logs'; 
// import dynamic from 'next/dynamic';
// import toast from 'react-hot-toast';
// import { useSession } from 'next-auth/react';
// import { SubmitHandler } from 'react-hook-form';
// import { Form, useFormContext, Controller } from '@/components/ui/form';
// import Spinner from '@/components/ui/spinner';
// import { useEffect, useState } from 'react';
// import apiService from '@/utils/apiService';                                          
// import { FloorFormSchema, FloorFormTypes, defaultValues } from '@/utils/validators/floor-unit.schema';
// import { useRouter } from 'next/navigation';
// import { decryptData } from '@/components/encriptdycriptdata';

// const SelectBox = dynamic(() => import('@/components/ui/select'), {
//   ssr: false,
//   loading: () => (
//     <div className="grid h-10 place-content-center">
//       <Spinner />
//     </div>
//   ),
// });
// const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
//   ssr: false,
// });

// export default function AddUnites() {
//   const { data: session } = useSession();
//   const [department, setDepartment] = useState<any>([]);
//   const [company, setCompany] = useState<any>();
//   const [isLoading, setIsLoading] = useState(false); 
//   const { back } = useRouter();
//   const [userData, setUserData] = useState<any>();
//   const [rows, setRows] = useState([{ unit_type: "", unit: "", size: "", price: "", status: "available", descp: "N/A" }]);

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

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await apiService.get(`/supper-admin/${session?.user?.email}`);
//         const userData = response.data;
//         setCompany(userData);
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         toast.error('Error fetching user data. Please try again.');
//       }

//       try {
//         const response = await apiService.get(`/project-status`);
//         const departmentData = response.data;
//         setDepartment(departmentData.data);
//       } catch (error) {
//         console.error('Error fetching department data:', error);
//         toast.error('Error fetching department data. Please try again.');
//       }
//     };

//     if (session) {
//       fetchData();
//     }
//   }, [session]);

//   const handleAddRow = () => {
//     setRows([...rows, { unit_type: "", unit: "", size: "", price: "", status: "available", descp: "N/A" }]);
//   };

//   const onSubmit: SubmitHandler<FloorFormTypes> = async (data) => {
//     setIsLoading(true); 
//     try {
//       const projectData = {
//         ...data,
//         units: rows,  // sending the rows array directly
//         user: userData?.user?.name,
//       };
//       console.log("the data ot back end:",projectData)

//       const result = await apiService.post(`/cre`, projectData);

//       toast.success(result.data.message);

//       if (result.data.success) {
//         logsCreate({ user: userData?.user?.name, desc: 'New project' });
//         back();
//       }
//     } catch (error: any) {
//       console.error('Error creating project:', error);
//       toast.error(error.response?.data?.message || 'Error creating project.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Form<FloorFormTypes>
//       validationSchema={FloorFormSchema}
//       onSubmit={onSubmit}
//       className="@container"
//       useFormProps={{
//         mode: 'onChange',
//         defaultValues,
//       }}
//     >
//       {({ register, control, setValue, getValues, formState: { errors } }: any) => {
//         return (
//           <>
//             <div className="flex flex-col w-full">
//               <div className="bg-transparent p-4 shadow-md rounded-lg">
//                 {rows.map((row, index) => (
//                   <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
//                     <div className="col-span-1">
//                       <label className="block text-sm font-medium text-gray-700">Unit Type<span className="text-red-500">*</span></label>
//                       <select 
//                         required 
//                         className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-transparent rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
//                         value={row.unit_type}
//                         onChange={(e) => {
//                           const updatedRows = [...rows];
//                           updatedRows[index].unit_type = e.target.value;
//                           setRows(updatedRows);
//                         }}
//                       >
//                         <option value>Select Unit Type</option>
//                         <option value={0}>N/A</option>
//                         <option value={1}>Apartment</option>
//                         <option value={2}>Shop</option>
//                         <option value={3}>Plot</option>
//                         <option value={4}>Office</option>
//                         <option value={5}>House</option>
//                         <option value={6}>Villa</option>
//                         <option value={7}>Farm House</option>
//                         <option value={8}>Flat</option>
//                       </select>
//                     </div>
//                     <div className="col-span-1">
//                       <label className="block text-sm font-medium text-gray-700">Unit Number<span className="text-red-500">*</span></label>
//                       <input 
//                         type="text" 
//                         required 
//                         className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
//                         value={row.unit}
//                         onChange={(e) => {
//                           const updatedRows = [...rows];
//                           updatedRows[index].unit = e.target.value;
//                           setRows(updatedRows);
//                         }}
//                         placeholder="Unit Number e.g S-12" 
//                       />
//                     </div>
//                     <div className="col-span-1">
//                       <label className="block text-sm font-medium text-gray-700">Unit Size<span className="text-red-500">*</span></label>
//                       <input 
//                         type="text" 
//                         required 
//                         className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
//                         value={row.size}
//                         onChange={(e) => {
//                           const updatedRows = [...rows];
//                           updatedRows[index].size = e.target.value;
//                           setRows(updatedRows);
//                         }}
//                         placeholder="Sq.Ft" 
//                       />
//                     </div>
//                     <div className="col-span-1">
//                       <label className="block text-sm font-medium text-gray-700">Unit Price<span className="text-red-500">*</span></label>
//                       <input 
//                         type="number" 
//                         required 
//                         className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
//                         value={row.price}
//                         onChange={(e) => {
//                           const updatedRows = [...rows];
//                           updatedRows[index].price = e.target.value;
//                           setRows(updatedRows);
//                         }}
//                         min={0} 
//                       />
//                     </div>
//                     <div className="col-span-1">
//                       <label className="block text-sm font-medium text-gray-700">Status<span className="text-red-500">*</span></label>
//                       <select 
//                         required 
//                         className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-transparent rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
//                         value={row.status}
//                         onChange={(e) => {
//                           const updatedRows = [...rows];
//                           updatedRows[index].status = e.target.value;
//                           setRows(updatedRows);
//                         }}
//                       >
//                         <option value="available">Available</option>
//                         <option value="sold">Sold</option>
//                         <option value="hold">On Hold</option>
//                       </select>
//                     </div>
//                     <div className="col-span-1">
//                       <label className="block text-sm font-medium text-gray-700">Remarks<span className="text-red-500">*</span></label>
//                       <input 
//                         type="text" 
//                         required 
//                         className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
//                         value={row.descp}
//                         onChange={(e) => {
//                           const updatedRows = [...rows];
//                           updatedRows[index].descp = e.target.value;
//                           setRows(updatedRows);
//                         }}
//                         placeholder="N/A" 
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="w-full flex justify-between">
//               <button 
//                 type="button" 
//                 className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md shadow-md"
//                 onClick={handleAddRow}
//               >
//                 Add Row
//               </button>
//               <button 
//                 type="submit" 
//                 className="px-4 py-2 text-sm bg-green-600 text-white rounded-md shadow-md"
//               >
//                 Submit
//               </button>
//             </div>
//           </>
//         );
//       }}
//     </Form>
//   );
// }







'use client';
import { logsCreate } from '@/app/shared/account-settings/logs'; 
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { SubmitHandler } from 'react-hook-form';
import { Form} from '@/components/ui/form';
import Spinner from '@/components/ui/spinner';
import { useEffect, useState } from 'react';
import apiService from '@/utils/apiService';                                          
import { FloorFormSchema, FloorFormTypes, defaultValues } from '@/utils/validators/floor-unit.schema';
import { useRouter } from 'next/navigation';
import { decryptData } from '@/components/encriptdycriptdata';
import { Tooltip } from '@/components/ui/tooltip';
import { ActionIcon } from '@/components/ui/action-icon';
import { LiaEditSolid } from "react-icons/lia";
import DeletePopover from '@/app/shared/delete-popover1';
import { Input } from "rizzui";
const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});
const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
});
export default function AddUnites({id ,slug}:any) {
 
  const { data: session } = useSession();
  const [department, setDepartment] = useState<any>([]);
  const [company, setCompany] = useState<any>();
  const [isLoading, setIsLoading] = useState(false); 
  const { back } = useRouter();
  const [userData, setUserData] = useState<any>();
  const [rows, setRows] = useState([{ Type: "", Unit: "", Size: "", SqFtRate: "", status: "available", Category: "N/A" }]);

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
        const response = await apiService.get(`/supper-admin/${session?.user?.email}`);
        const userData = response.data;
        setCompany(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data. Please try again.');
      }

      try {
        const response = await apiService.get(`/project-status`);
        const departmentData = response.data;
        setDepartment(departmentData.data);
      } catch (error) {
        console.error('Error fetching department data:', error);
        toast.error('Error fetching department data. Please try again.');
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const handleAddRow = () => {
    setRows([...rows, { Type: "", Unit: "", Size: "", SqFtRate: "", status: "available", Category: "N/A" }]);
  };

  const onSubmit: SubmitHandler<FloorFormTypes> = async (data) => {
    setIsLoading(true); 
    try {
      const { ...row } = { ...rows };

// Create the final data object to send to the backend
const projectData = {
  ...rows,        
  id: id,            
  slug: slug,      
  user: userData?.user?.name, 
};
  console.log("the data at the backend is:",projectData)
      const result = await apiService.post(`/floor-units`, projectData);

      toast.success(result.data.message);

      if (result.data.success) {
        logsCreate({ user: userData?.user?.name, desc: 'New Units' });
        back();
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error?.response?.data?.message || 'Error creating Units.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form<FloorFormTypes>
      validationSchema={FloorFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors } }: any) => {
        return (
          <>
            <div className="flex flex-col w-full">
              <div className="bg-transparent p-4 shadow-md rounded-lg">
                <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 border border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>

                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-gray-200">
                    {rows.map((row, index) => (
                      <tr key={index}>
                        <td className="px-2 py-2 whitespace-nowrap border border-gray-300">
                          <select 
                            required 
                            className="block w-[100px] py-2 px-3 border border-gray-300 bg-transparent rounded-md shadow-sm focus:outline-none focus:ring-gray-200 focus:border-gray-1000 hover:border-gray-1000 sm:text-sm" 
                            value={row.Type}
                            onChange={(e) => {
                              const updatedRows = [...rows];
                              updatedRows[index].Type = e.target.value;
                              setRows(updatedRows);
                            }}
                          >
                            <option value=''>Select Unit Type</option>
                            <option value="N/A">N/A</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Shop">Shop</option>
                            <option value="Plot">Plot</option>
                            <option value="Office">Office</option>
                            <option value="House">House</option>
                            <option value="Villa">Villa</option>
                            <option value="Farm House">Farm House</option>
                            <option value="Flat">Flat</option>
                          </select>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap border border-gray-300">
                          <Input 
                            type="number" 
                            required 
                            className="input-class w-100"
                            value={row.Unit}
                            onChange={(e) => {
                              const updatedRows = [...rows];
                              updatedRows[index].Unit = e.target.value;
                              setRows(updatedRows);
                            }}
                            placeholder="Unit Number e.g S-12" 
                          />
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap border border-gray-300">
                          <Input 
                            type="text" 
                            required 
                             className="input-class w-100"
                             value={row.Size}
                            onChange={(e) => {
                              const updatedRows = [...rows];
                              updatedRows[index].Size = e.target.value;
                              setRows(updatedRows);
                            }}
                            placeholder="Sq.Ft" 
                          />
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap border border-gray-300">
                          <Input 
                            type="number" 
                            required 
                             className="input-class w-100"
                            value={row.SqFtRate}
                            onChange={(e) => {
                              const updatedRows = [...rows];
                              updatedRows[index].SqFtRate = e.target.value;
                              setRows(updatedRows);
                            }}
                            min={0} 
                          />
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap border border-gray-300">
                          <select 
                            required 
                            className="block w-[100px] py-2 px-3 border border-gray-300 bg-transparent rounded-md shadow-sm focus:outline-none focus:ring-gray-200 focus:border-gray-1000 hover:border-gray-1000 sm:text-sm" 
                            value={row.status}
                            onChange={(e) => {
                              const updatedRows = [...rows];
                              updatedRows[index].status = e.target.value;
                              setRows(updatedRows);
                            }}
                          >
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                            <option value="hold">Put On Hold</option>
                          </select>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap border border-gray-300">
                          <Input 
                            type="text" 
                            required 
                             className="input-class w-100"
                             value={row.Category}
                            onChange={(e) => {
                              const updatedRows = [...rows];
                              updatedRows[index].Category = e.target.value;
                              setRows(updatedRows);
                            }}
                            placeholder="Add remarks or description" 
                          />
                        </td>
                       
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-4">
              <button 
                type="button" 
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                onClick={() => back()}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                onClick={handleAddRow}
              >
                Add Row
              </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </>
        );
      }}
    </Form>
  );
}
