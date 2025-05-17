'use client';
import { logs, logsCreate } from '@/app/shared/account-settings/logs'; 
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { DatePicker } from '@/components/ui/datepicker';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@/components/form-footer';
import { useEffect, useMemo, useState, useRef } from 'react';
import apiService from '@/utils/apiService';                                          
import { NewProjectInfoFormSchema, NewProjectInfoFormTypes, defaultValues } from '@/utils/validators/new-project.schema';
import AvatarUpload from '@/components/ui/file-upload/avatar-project';
import { useRouter } from 'next/navigation';
import { decryptData } from '@/components/encriptdycriptdata';
import { useManageUnits } from '@/components/Projects/FloorManage/managefloor';
import { Modal, Button, Text, ActionIcon } from "rizzui";

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

export default function Unitscard({ slug, id }: any) {
  const prevValuesRef = useRef<{ slug: string; id: string } | null>(null);
  const [shouldFetch, setShouldFetch] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  // Prevent re-fetching if same values
  useEffect(() => {
    if (
      prevValuesRef.current?.slug === slug &&
      prevValuesRef.current?.id === id &&
      slug === id
    ) {
      setShouldFetch(false);
    } else {
      prevValuesRef.current = { slug, id };
      setShouldFetch(true);
    }
  }, [slug, id]);

  // Call useManageUnits only when needed
  const fetchedItems = useManageUnits(slug, id);
  useEffect(() => {
    if (shouldFetch) {
      setItems(fetchedItems);
    }
  }, [fetchedItems, shouldFetch]);

  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false); 
  const { back } = useRouter();
  const [value, setUserData] = useState<any>();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const sessionRef = useRef(session);
  useEffect(() => {
    if (sessionRef.current === session) return;
    sessionRef.current = session;
  }, [session]);

  const onSubmit: SubmitHandler<NewProjectInfoFormTypes> = async (data) => {
    setIsLoading(true); 
    try {
      const result = await apiService.post(`/create-n-project`, {
        ...data,
        user: sessionRef?.current?.user?.username
      });
      toast.success(result.data.message);
      if (result.data.success) {
        logsCreate({ user: sessionRef?.current?.user?.username, desc: 'Add new project' });
        back();
      } 
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const status_value = [
    { name: "Active", value: "available" },
    { name: "Sold", value: "sold" },
    { name: "Put On Hold", value: "hold" },
  ];

  const [modalState, setModalState] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleModalSubmit = async () => {
    try {
      const result = await apiService.put('/floor-status-update', {
        id: selectedItem.id,
        status: selectedStatus,
        remarks,
      });
      toast.success(result.data.message);
      setModalState(false);
    } catch (error) {
      console.error('Error updating unit status:', error);
      toast.error('Error updating unit status. Please try again.');
    }
  };

  const handleCardClick = (item: any) => {
    setSelectedItem(item);
    setSelectedStatus(item.status);
    setModalState(true);
  };

  const getCardColorClass = (status: string) => {
    switch (status) {
      case 'available': // ✅ fixed from 'active' to 'available'
        return 'bg-green-100 hover:bg-green-200 border-green-300';
      case 'sold':
        return 'bg-red-100 hover:bg-red-200 border-red-300';
      case 'hold':
        return 'bg-orange-100 hover:bg-orange-200 border-orange-300';
      default:
        return 'bg-white hover:bg-gray-100 border-gray-300';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "available":
        return 'text-green-600';
      case 'sold':
        return 'text-red-600';
      case 'hold':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Form<NewProjectInfoFormTypes>
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
            <FormGroup
              title="Projects"
              description="Add Projects here"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleCardClick(item)}
                    className={`cursor-pointer shadow-lg rounded-lg p-4 border-2 ${getCardColorClass(item.status)}`}
                  >
                    <h3 className="text-lg font-bold mb-2">{item.Label}</h3>
                    <p className="text-sm font-semibold mb-1">{item.Size} SQFT.</p>
                    <span className={`text-sm uppercase font-bold ${getStatusTextColor(item.status)}`}>
                      {item.status === "hold"
                        ? "On Hold"
                        : item.status === "sold"
                        ? "Sold"
                        : item.status === "available"
                        ? "Available"
                        : "Unknown"}
                    </span>
                    {(item.status === "hold" || item.status === "sold") && (
                      <p className="text-sm font-semibold mb-1">by {item.user}</p>
                    )}
                  </div>
                ))}
              </div>

              {selectedItem && (
                <Modal isOpen={modalState} onClose={() => setModalState(false)}>
                  <div className="m-auto px-7 pt-6 pb-8">
                    <div className="mb-7 flex items-center justify-between">
                      <Text as="h3">Change Status for {selectedItem.name}?</Text>
                      <ActionIcon
                        size="sm"
                        variant="text"
                        className="text-xl font-bold"
                        onClick={() => setModalState(false)}
                      >
                        X
                      </ActionIcon>
                    </div>

                    <Controller
                      control={control}
                      name="status"
                      render={({ field: { onChange } }) => (
                        <SelectBox
                          placeholder="Select Status"
                          options={status_value}
                          onChange={(value) => {
                            onChange(value);
                            setSelectedStatus(value);
                          }}
                          value={selectedStatus}
                          className="col-span-full w-full"
                          getOptionValue={(option) => option.value}
                          displayValue={(selected) =>
                            status_value.find((r: any) => r.value === selected)?.name ?? ''
                          }
                        />
                      )}
                    />

                    <Input 
                      label="Remarks / Note" 
                      inputClassName="border-2" 
                      size="lg" 
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />

                    <Button
                      type="button"
                      size="lg"
                      className="col-span-2 mt-2 mr-3"
                      onClick={() => setModalState(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      className="col-span-2 mt-2 ml-3"
                      onClick={handleModalSubmit}
                    >
                      Confirm Changes
                    </Button>
                  </div>
                </Modal>
              )}
            </div>
          </>
        );
      }}
    </Form>
  );
}
