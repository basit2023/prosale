
'use client';
import { logs, logsCreate } from '@/app/shared/account-settings/logs'; 
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useEffect, useState, useMemo, useCallback } from 'react';
import apiService from '@/utils/apiService';                                          
import { PaymentplanFormSchema,PaymentplanFormTypes,defaultValues } from '@/utils/validators/payment-plans.schema';
import { useRouter } from 'next/navigation';
import { decryptData } from '@/components/encriptdycriptdata';
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Checkbox } from "rizzui";
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

interface SelectOption {
  label: string;
  value: string;
}

export default function EditPaymentPlan({id}:any) {
  const { data: session } = useSession();
  const [payment, setPayment] = useState<any>([]);
  const [company, setCompany] = useState<any>();
  const [isLoading, setIsLoading] = useState(false); 
  const { back } = useRouter();
  const [value, setUserData]=useState<any>();
  const [state, setState] = useState<any[]>([]);
  const [isChecked, setIsChecked] = useState<boolean>(false);
const [isChecked1, setIsChecked1] = useState<boolean>(false);
const [isChecked2, setIsChecked2] = useState<boolean>(false);
const [isChecked3, setIsChecked3] = useState<boolean>(false);
const [isChecked4, setIsChecked4] = useState<boolean>(false);
const [monthlyChecked, setMonthlyChecked] = useState<boolean>(false);
const [halfYearlyChecked, setHalfYearlyChecked] = useState<boolean>(false);
const [yearlyChecked, setYearlyChecked] = useState<boolean>(false);

// console.log("The result of the booking is:", isChecked);
// console.log("The result of the transfer is:", isChecked3);
     // State for all input values
  const [presetYear, setPresetYear] = useState<any>(null);
  const [monthlyInstallments, setMonthlyInstallments] = useState<any>(0);
  const [halfYearlyInstallments, setHalfYearlyInstallments] = useState<any>(0);
  const [yearlyInstallments, setYearlyInstallments] = useState<any>(0);
  const [bookingTotal, setBookingTotal] = useState<any>(0 );
  const [confirmationTotal, setConfirmationTotal] = useState<any>(0);
  const [allocationPr, setAllocationPr] = useState<any>(0);
  const [possessionPr, setPossessionPr] = useState<any>(0);
  const [transferPr, setTransferPr] = useState<any>(0);
  // Calculated totals
 
const totalMonths = useMemo(() => {
  const months = (parseFloat(presetYear) * 12) - 1;
  return months < 0 ? 0 : months;
}, [presetYear]);

const totalHalfYearly = useMemo(() => {
  const halfYears = (parseFloat(presetYear) * 2) - 1;
  return halfYears < 0 ? 0 : halfYears;
}, [presetYear]);

const totalYearly = useMemo(() => {
  const years = parseFloat(presetYear) - 1;
  return years < 0 ? 0 : years;
}, [presetYear]);

// Calculated payments
const monthlyTotal = useMemo(() => totalMonths * monthlyInstallments, [totalMonths, monthlyInstallments]);
const halfYearlyTotal = useMemo(() => totalHalfYearly * halfYearlyInstallments, [totalHalfYearly, halfYearlyInstallments]);
const yearlyTotal = useMemo(() => totalYearly * yearlyInstallments, [totalYearly, yearlyInstallments]);

// Final percentage total
const finalTotal = useMemo(() => {
  return (
    Number(bookingTotal) +
    Number(confirmationTotal) +
    Number(monthlyTotal) +
    Number(halfYearlyTotal) +
    Number(yearlyTotal) +
    Number(allocationPr) +
    Number(possessionPr) +
    Number(transferPr) || 0
  );
}, [
  bookingTotal,
  confirmationTotal,
  monthlyTotal,
  halfYearlyTotal,
  yearlyTotal,
  allocationPr,
  possessionPr,
  transferPr,
]);
  

  //*****************************For Extra part *********************** */

  const [rows, setRows] = useState<number>(1);

  // State to track checked status for each row
  const [extraChecks, setExtraChecks] = useState<boolean[]>([false]);

  // State to track the extra values for each row
  const [extras, setExtras] = useState<number[]>([0]);
  const [extrasinstall, setExtrasInstall] = useState<number[]>([0]);
  const [finalTotal1, setFinalTotal] = useState<number>(finalTotal);
  // Function to handle adding a new row
  const addRow = () => {
    setRows((prevRows) => prevRows + 1);
    setExtraChecks((prevChecks) => [...prevChecks, false]); // Add new check state
    setExtras((prevExtras) => [...prevExtras, 0]);
    setExtrasInstall((prevExtras) => [...prevExtras, 0]);
  };
  

  const handleCheckChange = (index: number) => {
    const updatedChecks = [...extraChecks];
    updatedChecks[index] = !updatedChecks[index];
    setExtraChecks(updatedChecks);
  
    // Reset values if the checkbox is unchecked
    if (!updatedChecks[index]) {
      handleinstallment(index, 0);
      handleExtraChange(index, 0);
    }
  };
  
  // Function to handle extra value change (Percentage Installment) and update total
  const handleExtraChange = (index: number, value: any) => {
    const updatedExtras = [...extras];
    updatedExtras[index] = value;
    setExtras(updatedExtras);
  
    // Recalculate total
    calculateTotal(updatedExtras, extrasinstall);
  };
  
  // Function to handle Number of Installments change and update total
  const handleinstallment = (index: number, value: any) => {
    const updatedInstallments = [...extrasinstall];
    updatedInstallments[index] = value;
    setExtrasInstall(updatedInstallments);
  
    // Recalculate total
    calculateTotal(extras, updatedInstallments);
  };
  
  // Function to calculate total based on extras and installments
  const calculateTotal = (updatedExtras: number[], updatedInstallments: number[]) => {
    let total = 0;
    for (let i = 0; i < updatedExtras.length; i++) {
      total += (updatedExtras[i] || 0) * (updatedInstallments[i] || 0);
    }
  
    setFinalTotal(total); // Set the new total
  };
  
  const convertToArray = (data: any) => {
    const extrasArray = [];
    for (let i = 1; i <= 5; i++) {
      const extra = {
        [`extraname${i}`]: data[`extraname${i}`],
        [`extrapr${i}`]: data[`extrapr${i}`],
        [`extrainstall${i}`]: data[`extrainstall${i}`],
      };
  
      if (data[`extraname${i}`] || data[`extrapr${i}`] || data[`extrainstall${i}`]) {
        extrasArray.push(extra);
  
        setExtraChecks((prevChecks) => {
          const updatedChecks = [...prevChecks];
          updatedChecks[i - 1] = true;
          return updatedChecks;
        });
  
        handleinstallment(i - 1, data[`extrainstall${i}`] || 0);
        handleExtraChange(i - 1, data[`extrapr${i}`] || 0);
      }
    }
    return extrasArray;
  };
  //*****************************For Extra part *********************** */
  const fetchUserData = useCallback(async () => {
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
  }, []);
  
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  
  const fetchData = useCallback(async () => {
    try {
      const response = await apiService.get(`/supper-admin/${session?.user?.email}`);
      const userData = response.data;
      setCompany(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error fetching user data. Please try again.');
    }
  
    try {
      const response = await apiService.get(`/specific-payment?id=${id}`);
      const userData = response.data.payment[0];
      // console.log("the payment plan is----->:", userData);
      setPayment(userData);
    } catch (error) {
      console.error('Error fetching department data:', error);
      toast.error('Error fetching departments data. Please try again.');
    }
  }, [id, session]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    if (payment) {
      setIsChecked(payment.Add_Booking === 1);
      setIsChecked1(payment.add_confirmation === 1);
      setIsChecked2(payment.add_allocation === 1);
      setIsChecked3(Number(payment.possession) === 1);
      setIsChecked4(Number(payment.transfer) === 1);
      setMonthlyChecked(Number(payment.monthly) === 1);
      setHalfYearlyChecked(Number(payment.halfyearly) === 1);
      setYearlyChecked(Number(payment.yearly) === 1);
      setPresetYear(Number(payment.preset_year) || 0);
      setMonthlyInstallments(Number(payment.monthly_Installmentspr) || 0);
      setHalfYearlyInstallments(Number(payment.half_yearly_Installmentspr) || 0);
      setYearlyInstallments(Number(payment.yearly_Installmentspr) || 0);
      setBookingTotal(Number(payment.booking_pr) || 0);
      setConfirmationTotal(Number(payment.confirmation_Pr) || 0);
      setAllocationPr(Number(payment.allocation_pr) || 0);
      setPossessionPr(Number(payment.possessionpr) || 0);
      setTransferPr(Number(payment.transferpr) || 0);
      
      // Get the array of extra fields
      convertToArray(payment);
    }
  }, [payment]);
  
  
  
  const onSubmit: SubmitHandler<PaymentplanFormTypes> = async (data) => {
    setIsLoading(true); 
    try {
      
      if(company?.user_data?.number<=1){
        data.company_id=company?.user_data?.company_id;
     }
     if((finalTotal+finalTotal1)!==100){
      toast.error("The total percentage must equal 100");
      return;
     }
        data.Add_Booking=isChecked;
        data.add_confirmation=isChecked1;
        data.add_allocation=isChecked2;
        data.monthly=monthlyChecked;
        data.halfyearly=halfYearlyChecked;
        data.yearly=yearlyChecked;
        data.possession=isChecked3;
        data.transfer=isChecked4;
        data.final=finalTotal+finalTotal1;
        data.monthly_Installments=totalMonths;
        data.half_yearly_Installments=totalHalfYearly;
        data.yearly_Installments=totalYearly;
        console.log("the data is at the sending form:",data)
        const result = await apiService.put(`/edit-payment-plan`, {
          ...data,user: value?.user?.name, extra:extraChecks,id:id,
        });
        toast.success(result.data.message);
        if (result.data.success) {
          logsCreate({ user: value?.user?.name, desc: 'Add new project' });
          back()
        } 
        
    
    } catch (error:any) {
      console.error('Error updating profile:', error);
      toast.error(error.response.data.message);
    }finally {
      setIsLoading(false);
    }
  };

  const status_value = [
    { name: "Yes", value: "Y" },
    { name: "No", value: "N" }
  ];

 return  (
    <Form<PaymentplanFormTypes>
      // validationSchema={PaymentplanFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors } }:any) => {
        return (
          <>
            <FormGroup
              title="Payment Plan"
              description={`Edit Payment Plan for ${payment?.preset_name}`}
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid grid-cols-1 gap-4 divide-y divide-dashed divide-gray-200 pb-3 @2xl:gap-9 @3xl:gap-11">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2">

              <Input
                label="Preset Name"
                type="text"
                defaultValue={payment?.preset_name}
                placeholder="Enter Preset Name"
                {...register('preset_name')}
              />

              <Input
                label="Preset Years"
                type="text"
                defaultValue={payment?.preset_year}
                placeholder="Enter Number of Years"
                {...register('preset_year')}
                
                value={payment?.preset_year}
                onChange={(e)=>setPresetYear(e.target.value)}
              />

              {/* Leave the third column empty */}

              <Input
                label="Total Percentage"
                type="number"
                placeholder={finalTotal+finalTotal1}
                {...register('final')}
                
                value={finalTotal+finalTotal1}
                readOnly
                className="md:col-start-4" // This is for positioning
                inputClassName={`${
                  (finalTotal+finalTotal1) < 100 ||( finalTotal+finalTotal1) > 100 ? 'bg-red-200' : 'bg-green-500'
                }`} 
              />


              </div>

              {/* show status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2">
              <Controller
                  control={control}
                  name="Category"
                  render={({ field: { value, onChange } }:any) => (
                    <SelectBox
                      label="Show Category"
                      placeholder="Select Status"
                      options={status_value}
                      onChange={onChange}
                      value={value}
                      defaultValue={payment?.Category}
                      getOptionValue={(option:any) => option.value}
                      displayValue={(selected:any) =>
                        status_value?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="Unit"
                  render={({ field: { value, onChange } }:any) => (
                    <SelectBox
                    label="Show Unit Number"
                      placeholder="Select Status"
                      options={status_value}
                      onChange={onChange}
                      value={value}
                      defaultValue={payment?.Unit}
                     
                      getOptionValue={(option:any) => option.value}
                      displayValue={(selected:any) =>
                        status_value?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="Size"
                  render={({ field: { value, onChange } }:any) => (
                    <SelectBox
                    label="Show Unit Size"
                      placeholder="Select Status"
                      options={status_value}
                      onChange={onChange}
                      value={value}
                      defaultValue={payment?.Size}
                      
                      getOptionValue={(option:any) => option.value}
                      displayValue={(selected:any) =>
                        status_value?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="Price_Sqft"
                  render={({ field: { value, onChange } }:any) => (
                    <SelectBox
                    label="Show Price Per Sqft"
                      placeholder="Select Status"
                      options={status_value}
                      onChange={onChange}
                      value={value}
                      defaultValue={payment?.Price_Sqft}
                     
                      getOptionValue={(option:any) => option.value}
                      displayValue={(selected:any) =>
                        status_value?.find((r:any) => r.value === selected)?.name ?? ''
                      }
                    />
                  )}
                />
              </div>
              {/* 3 columns */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2">
                {/* First input - taking one column */}
                <Input
                  type="text"
                  placeholder="Add Booking"
                  label='Add Booking'
              
                
                   readOnly
                  
                  suffix={
                    <Checkbox
                      className="m-2"
                      rounded="sm"
                      checked={isChecked}
                      
                      onChange={() => {
                          setIsChecked(!isChecked);
                          isChecked && setBookingTotal(0);
                        }}
                    />
                  }
                />

                {/* Second input - Booking Percentage, enabled only if checkbox is checked */}
                <Input
                  label="Booking Percentage"
                  type="number"
                {...register('booking_pr')}

                  min={0}
                  step={1}
                  value={bookingTotal ?? ''} // Show an empty string when bookingTotal is null or undefined
                  onChange={(e) => {
                    const value = e.target.value;
                    setBookingTotal(value === '' ? null : Number(value)); // Allow the input to be cleared
                  }}
                  className="col-span-2"
                  disabled={!isChecked} // Disable until checkbox is checked
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => isChecked && setBookingTotal((prevState:any) => (prevState || 0) + 1)} // Handle null/undefined cases
                        disabled={!isChecked} // Disable button until checkbox is checked
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => isChecked && setBookingTotal((prevState:any) => Math.max(0, (prevState || 0) - 1))} // Prevent negative values
                        disabled={!isChecked} // Disable button until checkbox is checked
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />


                {/* Third input - taking one column */}
                <Input
                  type="number"
                  label="Booking Total"
                  placeholder={bookingTotal}
                  // defaultValue={bookingTotal}
                  disabled
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2">
                {/* First input - taking one column */}
                <Input
                  type="text"
                  placeholder="Add Confirmation"
                  label='Add Confirmation'
                   readOnly
                // {...register('add_confirmation')}
               
                  suffix={
                    <Checkbox
                      className="m-2"
                      rounded="sm"
                      checked={isChecked1}
                      
                      onChange={() => {setIsChecked1(!isChecked1);
                        isChecked1 && setConfirmationTotal(0)
                      }} // Toggle checkbox
                    />
                  }
                />

                {/* Second input - Booking Percentage, enabled only if checkbox is checked */}
                <Input
                  label="Confirmation Percentage"
                  type="number"
                  {...register('confirmation_Pr')}
                  min={0}
                  step={1}
                  value={confirmationTotal ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirmationTotal(value === '' ? null : Number(value))}}
                  className="col-span-2"
                  disabled={!isChecked1} // Disable until checkbox is checked
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => isChecked1 && setConfirmationTotal((prevState:any) => prevState + 1)} // Only work if enabled
                        disabled={!isChecked1} // Disable button until checkbox is checked
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => isChecked1 && setConfirmationTotal((prevState:any) => prevState - 1)} // Only work if enabled
                        disabled={!isChecked1} // Disable button until checkbox is checked
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />

                {/* Third input - taking one column */}
                <Input
                  type="number"
                  label="Confirmation Total"
                  placeholder={confirmationTotal}
                  // defaultValue={confirmationTotal}
                  disabled
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2">
                {/* First input - taking one column */}
                <Input
                  type="text"
                  placeholder="Add Allocation"
                  label='Add Allocation'
                   readOnly
                // {...register('add_allocation')}
                
                  suffix={
                    <Checkbox
                      className="m-2"
                      rounded="sm"
                      checked={isChecked2}
                      
                      onChange={() => {setIsChecked2(!isChecked2);
                        isChecked2 && setAllocationPr(0)
                      }} // Toggle checkbox
                    />
                  }
                />

                {/* Second input - Booking Percentage, enabled only if checkbox is checked */}
                <Input
                  label="Allocation Percentage"
                  type="number"
                {...register('allocation_pr')}

                  min={0}
                  step={1}
                  value={allocationPr ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAllocationPr(value === '' ? null : Number(value))}}
                  className="col-span-2"
                  disabled={!isChecked2} // Disable until checkbox is checked
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => isChecked2 && setAllocationPr((prevState:any) => prevState + 1)} // Only work if enabled
                        disabled={!isChecked2} // Disable button until checkbox is checked
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => isChecked2 && setAllocationPr((prevState:any) => prevState - 1)} // Only work if enabled
                        disabled={!isChecked2} // Disable button until checkbox is checked
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />

                {/* Third input - taking one column */}
                <Input
                  type="number"
                  label="Allocation Total"
                  placeholder={allocationPr}
                  // defaultValue={allocationPr}
                  disabled
                />
              </div>
              {/* 4 columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2">
                <Input
                  type="text"
                  label="Add Monthly Installments"
                  placeholder="Add Monthly Installments"
                // {...register('monthly')}
               
                  readOnly
                  suffix={
                    <Checkbox
                      className="m-2"
                      rounded="sm"
                      checked={monthlyChecked}
                      onChange={() => {setMonthlyChecked(!monthlyChecked);
                        monthlyChecked && setMonthlyInstallments(0)
                      }}
                    />
                  }
                />
                <Input
                  type="number"
                  label="Number of Installments"
                  placeholder={totalMonths}
                 {...register('monthly_Installments')}
                  value={totalMonths}
                  disabled
                />
                <Input
                  label="Percentage of Each Installment"
                  type="number"
                {...register('monthly_Installmentspr')}

                  min={0}
                  step={1}
                  value={monthlyInstallments ?? ''}
                  onChange={(e) => {
                  const value = e.target.value;
                  setMonthlyInstallments(value === '' ? null : Number(value))}}
                  disabled={!monthlyChecked}
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => setMonthlyInstallments((prevState:any) => prevState + 1)}
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => setMonthlyInstallments((prevState:any) => prevState - 1)}
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />
                <Input
                  type="text"
                  label="Monthly Percentage"
                  placeholder={monthlyTotal}
                  // defaultValue={monthlyTotal}
                  disabled
                />
              </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2">
                <Input
                  type="text"
                  label="Add Half Yearly Installments"
                  placeholder="Add Half Yearly Installments"
                // {...register('halfyearly')}
                
                  readOnly
                  suffix={
                    <Checkbox
                      className="m-2"
                      rounded="sm"
                      checked={halfYearlyChecked}
                      onChange={() => {setHalfYearlyChecked(!halfYearlyChecked);
                        halfYearlyChecked && setHalfYearlyInstallments(0)
                      }}
                    />
                  }
                />
                <Input
                  type="text"
                  label="Number of Installments"
                  placeholder={totalHalfYearly}
                   value={totalHalfYearly}
                {...register('half_yearly_Installments')}

                  disabled
                />
                <Input
                  label="Percentage of Each Installment"
                  type="number"
                {...register('half_yearly_Installmentspr')}

                  min={0}
                  step={1}
                  value={halfYearlyInstallments ?? ''}
                  onChange={(e) => {
                  const value = e.target.value;
                  setHalfYearlyInstallments(value === '' ? null : Number(value))}}
                  disabled={!halfYearlyChecked}
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => setHalfYearlyInstallments((prevState:any) => prevState + 1)}
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => setHalfYearlyInstallments((prevState:any) => prevState - 1)}
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />
                <Input
                  type="text"
                  label="Half Yearly Total Percentage"
                  placeholder={halfYearlyTotal}
                  // defaultValue={halfYearlyTotal}
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2">
                <Input
                  type="text"
                  label="Add Yearly Installments"
                  placeholder="Add Yearly Installments"
                // {...register('yearly')}
                
                  readOnly
                  suffix={
                    <Checkbox
                      className="m-2"
                      rounded="sm"
                      checked={yearlyChecked}
                      onChange={() => {setYearlyChecked(!yearlyChecked);
                        yearlyChecked && setYearlyInstallments(0)
                      }}
                    />
                  }
                />
                <Input
                  type="number"
                  label="Number of Installments"
                   placeholder={totalYearly}
                  {...register('yearly_Installments')}
                  value={totalYearly}
                  
                  
                  disabled
                />
                <Input
                  label="Percentage of Each Installment"
                  type="number"
                {...register('yearly_Installmentspr')}

                  min={0}
                  step={1}
                  value={yearlyInstallments ?? ''}
                  onChange={(e) => {
                  const value = e.target.value;
                  setYearlyInstallments(value === '' ? null :Number(value))}}
                  disabled={!yearlyChecked}
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => setYearlyInstallments((prevState:any) => prevState + 1)}
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => setYearlyInstallments((prevState:any) => prevState - 1)}
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />
                <Input
                  type="text"
                  label="Yearly Total Percentage"
                  placeholder={yearlyTotal}
                  // defaultValue={yearlyTotal}
                  disabled
                />
              </div>      
              {/* three columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2">
                {/* First input - taking one column */}
                <Input
                  type="text"
                  placeholder="Add Possession"
                  label='Add Possession'
                   readOnly
                // {...register('possession')}
                  
                  suffix={
                    <Checkbox
                      className="m-2"
                      rounded="sm"
                      checked={isChecked3}
                      
                      onChange={() => {setIsChecked3(!isChecked3)
                        isChecked3 && setPossessionPr(0)
                      }} // Toggle checkbox
                    />
                  }
                />

                {/* Second input - Booking Percentage, enabled only if checkbox is checked */}
                <Input
                  label="Possession Percentage"
                  type="number"
                {...register('possessionpr')}

                  min={0}
                  step={1}
                  value={possessionPr ?? ''}
                  
                  
                  onChange={(e) => {
                  const value = e.target.value;
                  setPossessionPr(value === '' ? null : Number(value))}}
                  className="col-span-2"
                  disabled={!isChecked3} // Disable until checkbox is checked
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => isChecked3 && setPossessionPr((prevState:any) => prevState + 1)} // Only work if enabled
                        disabled={!isChecked3} // Disable button until checkbox is checked
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => isChecked3 && setPossessionPr((prevState:any) => prevState - 1)} // Only work if enabled
                        disabled={!isChecked3} // Disable button until checkbox is checked
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />

                {/* Third input - taking one column */}
                <Input
                  type="number"
                  label="Possession Total"
                  placeholder={possessionPr}
                  // defaultValue={possessionPr}
                  disabled
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2">
                {/* First input - taking one column */}
                <Input
                  type="text"
                  placeholder="Add Transfer"
                  label='Add Transfer'
                // {...register('transfer')}
                 
                  
                   readOnly
                  
                  suffix={
                    <Checkbox
                      className="m-2"
                      rounded="sm"
                      checked={isChecked4}
                      
                      onChange={() => {setIsChecked4(!isChecked4)
                        isChecked4 && setTransferPr(0)
                      }} // Toggle checkbox
               
                    />
                  }
                />

                {/* Second input - Booking Percentage, enabled only if checkbox is checked */}
                <Input
                  label="Transfer Percentage"
                  type="number"
                {...register('Transferpr')}

                  min={0}
                  step={1}
                  value={transferPr ?? ''}
                  onChange={(e) => {
                  const value = e.target.value;
                  
                  setTransferPr(value === '' ? null : Number(value))}}
                  className="col-span-2"
                  disabled={!isChecked4} // Disable until checkbox is checked
                  suffix={
                    <div className="-mr-3.5 grid gap-[2px] p-0.5 rtl:-ml-3.5 rtl:-mr-0">
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => isChecked4 && setTransferPr((prevState:any) => prevState + 1)} // Only work if enabled
                        disabled={!isChecked4} // Disable button until checkbox is checked
                      >
                        <ChevronUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded-[3px] bg-gray-100 py-0.5 px-1.5 hover:bg-gray-200 focus:bg-gray-200"
                        onClick={() => isChecked4 && setTransferPr((prevState:any) => prevState - 1)} // Only work if enabled
                        disabled={!isChecked4} 
                      >
                        <ChevronDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />

                {/* Third input - taking one column */}
                <Input
                  type="number"
                  label="Transfer Total"
                  placeholder={transferPr}
                  // defaultValue={transferPr}
                  disabled
                />
              </div>
              {/* Add more inputs in similar grid layouts if needed */}
              
            
 {payment?.extras?.filter((extra: any, index: number) => extra[`extrainstall${index + 1}`]?.trim())
  .map((extra: any, index: number) => (
    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-2">
      {/* Checkbox */}
      <Input
        type="text"
        placeholder={`Extra Installment ${index + 1}`}
        label={`Extra Installment ${index + 1}`}
        {...register(`extra${index + 1}`)}
        readOnly
        suffix={
          <Checkbox
            className="m-2"
            rounded="sm"
            checked={extraChecks[index] || !!extra[`extra${index + 1}`] || false}
            onChange={() => handleCheckChange(index)}
          />
        }
      />

      {/* Extra name */}
      <Input
        type="text"
        placeholder="Installment Name"
        label="Installment Name"
        defaultValue={extra[`extraname${index + 1}`] || ''}
        {...register(`extraname${index + 1}`)}
        className="col-span-2"
        disabled={!extraChecks[index]}
      />

      {/* Number of Installments */}
      <Input
        type="number"
        label="Number of Installments"
        defaultValue={extra[`extrainstall${index + 1}`] || ''}
        {...register(`extrainstall${index + 1}`)}
        value={extrasinstall[index] ?? ''}
        onChange={(e) => {
          const value = e.target.value;
          handleinstallment(index, value === '' ? null : Number(value));
        }}
        disabled={!extraChecks[index]}
      />

      {/* Percentage Installment */}
      <Input
  label="Percentage Installment"
  type="number"
  min={0}
  step={1}
  value={extras[index] ?? extra[`extrapr${index + 1}`] ?? ''} // Fallback to backend value if extras state is empty
  onChange={(e) => {
    const value = e.target.value;
    handleExtraChange(index, value === '' ? 0 : Number(value)); // Call your handler to update the state
  }}
  className="col-span-1"
  disabled={!extraChecks[index]} // Disable if not checked
/>


      {/* Total percentage */}
      <Input
        type="number"
        label="Total Percentage"
        value={(extras[index] || 0) * (extrasinstall[index] || 0)}
        disabled
      />
    </div>
  ))}

            {/* Button to add a new row */}
            {/* <button type="button" onClick={addRow} className="mt-5 p-2 bg-blue-500 text-white">
              Add Row
            </button>  */}

            </div>

            <FormFooter altBtnText="Cancel" altBtnOnClick={() => back()} submitBtnText="Generate" isLoading={isLoading}/>
          </>
        );
      }}
    </Form>
  );
}

