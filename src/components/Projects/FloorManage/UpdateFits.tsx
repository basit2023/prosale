import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import Spinner from '@/components/ui/spinner';
import apiService from '@/utils/apiService';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { defaultValues, LabelSchema, LabelSchemaFormTypes } from '@/utils/validators/label.schema';
import { Input } from "rizzui";
import { useRouter } from "next/navigation";
const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => (
    <div className="grid h-10 place-content-center">
      <Spinner />
    </div>
  ),
});

export default function UpdateAllunits({ slug, id }: any) {
  const { data: session } = useSession();
  const [inputValue, setInputValue] = useState<number | string>(''); // State to hold the input value
  const router = useRouter();
  const { handleSubmit } = useForm<LabelSchemaFormTypes>({
    mode: 'onChange',
    defaultValues,
  });

  // Form submission handler
  const onSubmit: SubmitHandler<LabelSchemaFormTypes> = async () => {
    try {
      console.log("the input value is:",inputValue, id)
      const response = await apiService.put(`/floor-status-update`, { inputValue:inputValue,id:id }); // Sending the input value to the backend
      toast.success(response.data.message);
      router.refresh();
    } catch (error:any) {
      toast.error(response.data.message);
    }
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row justify-end relative">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="mb-1">
          <div className="flex items-center justify-between gap-4 w-full pr-3">
            Price Per Sqft:
            <Input
              type="number"
            //   value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="input-class w-[120px]"
            />

            <button
              type="submit"
              className="bg-black hover:bg-deep-black text-white font-bold py-2 px-4 rounded relative z-20"
            >
              Update All
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
