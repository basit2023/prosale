import { useModal } from '@/app/shared/modal-views/use-modal';
import { decryptData } from '@/components/encriptdycriptdata';
import { Title } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { PiXBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import Spinner from '@/components/ui/spinner';
import FormFooter from '@/components/form-footer';
import { useEffect, useState, useCallback, useMemo } from 'react';
import apiService from '@/utils/apiService';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import FormGroup from '@/app/shared/form-group';
import AvatarUpload from '@/components/ui/file-upload/avatar-floor';
import { PaymentFormTypes } from '@/utils/validators/paymentplansid.schema';

// Modal Hook
const useModalHookImage = () => {
  const { openModal } = useModal();

  const handleUploadImage = (slug: string, rowId: string, floor: string, SqFtRate: any) => {
    openModal({
      view: <ImageModalView slug={slug} id={rowId} floor={floor} SqFtRate={SqFtRate} />,
      customSize: '520px',
    });
  };

  return { handleUploadImage };
};

// Image Modal Component
function ImageModalView({ slug, id, floor, SqFtRate }: { slug: string; id: string; floor: string; SqFtRate: any }) {
  const { closeModal } = useModal();

  return (
    <div className="m-auto px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7">
      <div className="mb-7 flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          Upload Floor Plan Image
        </Title>
        <ActionIcon size="sm" variant="text" onClick={() => closeModal()}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>
      <ImageUploadForm slug={slug} id={id} floor={floor} />
    </div>
  );
}

// Image Upload Form Component
// Image Upload Form Component
function ImageUploadForm({ slug, id, floor }: { slug: string; id: string; floor: string }) {
  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [isImageSelected, setIsImageSelected] = useState(false);

 
const onSubmit: SubmitHandler<PaymentFormTypes> = async (data) => {
  try {
    setIsLoading(true);
    
    // Send as JSON instead of FormData
    const payload = {
      image: data.image, // base64 string
      slug,
      id
    };

    const response = await apiService.put('/upload-floor-image', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      toast.success('Image uploaded successfully!');
      closeModal();
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Failed to upload image. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
  return (
    <Form<PaymentFormTypes>
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
      }}
    >
      {({ setValue, formState: { errors }, watch }) => {
        const imageValue = watch('image');
        return (
          <>
            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              <FormGroup
                title="Upload Floor Plan Image"
                description="This image will be used for floor mapping."
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="flex flex-col gap-6 @container @3xl:col-span-2 items-center">
                  <AvatarUpload
                    name="image"
                    setValue={setValue}
                    error={errors?.image?.message as string}
                    onImageSelected={(selected:any) => setIsImageSelected(selected)}
                  />
                </div>
              </FormGroup>
            </div>
            <div className="mb-10 w-720px border border-dashed border-gray-200 pl-4 pr-4">
              <FormFooter
                altBtnText="Cancel"
                submitBtnText={imageValue ? "Upload Image" : "Please Select Image"}
                submitBtnDisabled={!imageValue}
                className="border-t border-dashed border-gray-200 pt-2 pb-0"
                onCancel={() => closeModal()}
                isLoading={isLoading}
              />
            </div>
          </>
        );
      }}
    </Form>
  );
}

export { useModalHookImage, ImageModalView };