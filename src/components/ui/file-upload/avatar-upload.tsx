import React, { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Text } from '@/components/ui/text';
import cn from '@/utils/class-names';
import UploadIcon from '@/components/shape/upload';
import { Loader } from '@/components/ui/loader';
import { FieldError } from '@/components/ui/field-error';
import { PiPencilSimple } from 'react-icons/pi';
import { LoadingSpinner } from '@/components/ui/file-upload/upload-zone';

interface AvatarUploadProps {
  name: any;
  // setValue: (name: string, value: any,) => any;
  // getValues:(name: string, value: any,) => any;
  defaultValue: string;
  error?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ name, error }:any) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      try {
        // Convert the image file to base64
        const reader = new FileReader();

        reader.onload = (event) => {
          const base64String:any = event.target?.result?.toString()?.split(',')[1];

          localStorage.removeItem('img');
          // Store the base64 image data in local storage with a specific key (e.g., 'avatarImage')
          localStorage.setItem('img', base64String || '');

          // Set the base64-encoded data in the form state
          // setValue(name, base64String || '');

          // Set the selected image for display
          setSelectedImage(base64String);
        };

        reader.readAsDataURL(selectedFile);
      } catch (error) {
        console.error('Error storing image in local storage:', error);
      }
    }
  };

  return (
    <div className={cn('grid gap-5')}>
      <div
        className={cn(
          'relative grid h-40 w-40 place-content-center rounded-full border overflow-hidden'
        )}
      >
        <div
          className={cn(
            'absolute inset-0 z-10 grid cursor-pointer place-content-center'
          )}
        >
          <input
            type="file"
            id="avatarInput"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="avatarInput"
            className={cn(
              'absolute inset-0 z-10 grid cursor-pointer place-content-center'
            )}
          >
            {error && <FieldError error={error} />}
            {!error && (
              <>
                {selectedImage && (
                  <img
                    src={`data:image;base64,${selectedImage}`}
                    alt="Selected Avatar"
                    className="rounded-full h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <UploadIcon className="h-12 w-12 text-black" />
                  <Text className="font-medium">Change Profile</Text>
                </div>
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;


