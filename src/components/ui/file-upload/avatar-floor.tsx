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
interface AvatarUploadProps {
  name: string;
  setValue: (name: string, value: any) => void;
  error?: string;
  onImageSelected?: (selected: boolean) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  name, 
  setValue, 
  error,
  onImageSelected 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      try {
        setIsLoading(true);
        const reader = new FileReader();

        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          
          // Update form value
          setValue(name, base64String);
          
          // Update local state for preview
          setSelectedImage(base64String);
          
          // Notify parent about image selection
          if (onImageSelected) {
            onImageSelected(true);
          }
        };

        reader.onerror = () => {
          toast.error('Error reading file');
          setIsLoading(false);
        };

        reader.onloadend = () => {
          setIsLoading(false);
        };

        reader.readAsDataURL(selectedFile);
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Error processing image');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={cn('grid gap-5')}>
      <div
        className={cn(
          'relative grid h-40 w-40 place-content-center rounded-full border overflow-hidden',
          { 'border-red-500': error }
        )}
      >
        <input
          type="file"
          id="avatarInput"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
        <label
          htmlFor="avatarInput"
          className={cn(
            'absolute inset-0 z-10 grid cursor-pointer place-content-center',
            { 'pointer-events-none': isLoading }
          )}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <LoadingSpinner className="h-8 w-8 text-white" />
            </div>
          )}
          
          {selectedImage ? (
            <>
              <img
                src={selectedImage}
                alt="Selected Avatar"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <PiPencilSimple className="h-6 w-6 text-white" />
                <Text className="font-medium text-white mt-2">Change Image</Text>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <UploadIcon className="h-12 w-12 text-gray-500" />
              <Text className="font-medium text-gray-600">Upload Floor Map</Text>
            </div>
          )}
        </label>
      </div>
      {error && (
        <FieldError error={error} className="text-center" />
      )}
    </div>
  );
};

export default AvatarUpload;