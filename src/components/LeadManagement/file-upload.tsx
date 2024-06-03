
'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import cn from '@/utils/class-names';
import {
  PiArrowLineDownBold,
  PiFile,
  PiFileCsv,
  PiFileDoc,
  PiFilePdf,
  PiFileXls,
  PiFileZip,
  PiTrashBold,
  PiXBold,
} from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import Upload from '@/components/ui/upload';
import { useModal } from '@/app/shared/modal-views/use-modal';
import SimpleBar from '@/components/ui/simplebar';
import { toast } from 'react-hot-toast';
import Spinner from '@/components/ui/spinner'; // Import the Spinner component


type AcceptedFiles = 'img' | 'pdf' | 'csv' | 'imgAndPdf' | 'all';

export default function FileUpload({
  label = 'Upload Files',
  btnLabel = 'Upload',
  fieldLabel,
  multiple = true,
  accept = 'all',
  
  setValue, // Add this line
  // getValues, // Add this line
  
}: {
  label?: string;
  fieldLabel?: string;
  btnLabel?: string;
  multiple?: boolean;
  accept?: AcceptedFiles;
  name: string; // Add this line
  setValue: (name: string, value: any) => void;
  // getValues: (name?: string) => any;
}) {
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false); // Add loading state

  return (
    <div className="m-auto px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7">
      <div className="mb-6 flex items-center justify-between">
        <Title as="h3" className="text-lg">
          {label}
        </Title>
        <ActionIcon
          size="sm"
          variant="text"
          onClick={() => closeModal()}
          className="p-0 text-gray-500 hover:!text-gray-900"
        >
          <PiXBold className="h-[18px] w-[18px]" />
        </ActionIcon>
      </div>

      {/* Conditionally render the spinner */}
      {loading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : (
        <FileInput
          accept={accept}
          multiple={multiple}
          label={fieldLabel}
          btnLabel={btnLabel}   
          setValue={setValue}
          // @ts-ignore
          id={id}
          setLoading={setLoading} // Pass setLoading function
        />
      )}
    </div>
  );
}

const fileType = {
  'application/pdf': <PiFilePdf className="h-5 w-5" />,
  'text/csv': <PiFileCsv className="h-5 w-5" />,
  'text/plain': <PiFile className="h-5 w-5" />,
  'application/xml': <PiFileXls className="h-5 w-5" />, // This is for XML files, not PDF
  'application/zip': <PiFileZip className="h-5 w-5" />,
  'application/gzip': <PiFileZip className="h-5 w-5" />,
  'application/msword': <PiFileDoc className="h-5 w-5" />,
} as { [key: string]: React.ReactElement };

export const FileInput = ({
  label,
  btnLabel = 'Upload',
  multiple = true,
  accept = 'img',
  className,
  id,
  setValue, // Add this line
  // getValues, // Add this line
  setLoading, // Add this line
}: {
  className?: string;
  label?: React.ReactNode;
  multiple?: boolean;
  btnLabel?: string;
  accept?: AcceptedFiles;
  id?:string;
  setValue: (name: string, value: any,) => any;
  // getValues: (name?: string | string[]) => any;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>; // Add this line
}) => {
  const { closeModal } = useModal();
  const [files, setFiles] = useState<Array<File>>([]);
  const imageRef = useRef<HTMLInputElement>(null);
  
  function handleFileDrop(event: React.ChangeEvent<HTMLInputElement>) {
    const uploadedFiles = (event.target as HTMLInputElement).files;
    const newFiles = Object.entries(uploadedFiles as object)
      .map((file) => {
        if (file[1]) return file[1];
      })
      .filter((file) => file !== undefined);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }

  function handleImageDelete(index: number) {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    (imageRef.current as HTMLInputElement).value = '';
  }

  function handleFileUpload() {
    if (files.length) {
      setLoading(true); // Set loading to true when starting file upload
      
      // console.log('uploaded files:', files);
      const fileNames = files.map(file => `${id}_${file.name}`);
      setValue("fileName", fileNames);
      // getValues(fileNames)
      
      const formData = new FormData();
  
      files.forEach((file) => {
        formData.append(file.name, file); // Append file with its original name
      });
  
      fetch('/api/bookingfile', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log('Server response:', data);
          setFiles([]);
          toast.success(<Text as="b">Files successfully added</Text>);
        })
        .catch((error) => {
          console.error('Error uploading files:', error);
          toast.error(<Text as="b">Error uploading files</Text>);
        })
        .finally(() => {
          setLoading(false); // Set loading to false when upload completes
        });
    } else {
      toast.error(<Text as="b">Please drop your file</Text>);
    }
  }

  return (
    <div className={className}>
      <Upload
        label={label}
        ref={imageRef}
        accept={accept}
        multiple={multiple}
        onChange={(event) => handleFileDrop(event)}
        className="mb-6 min-h-[280px] justify-center border-dashed bg-gray-50 dark:bg-transparent"
      />

      {files.length > 1 ? (
        <Text className="mb-2 text-gray-500">{files.length} files</Text>
      ) : null}

      {files.length > 0 && (
        <SimpleBar className="max-h-[280px]">
          <div className="grid grid-cols-1 gap-4">
            {files?.map((file: File, index: number) => (
              <div
                className="flex min-h-[58px] w-full items-center rounded-xl border border-gray-200 px-3 dark:border-gray-300"
                key={file.name}
              >
                <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 object-cover px-2 py-1.5 dark:bg-transparent">
                  {file.type.includes('image') ? (
                    <Image
                      src={URL.createObjectURL(file)}
                      fill
                      className=" object-contain"
                      priority
                      alt={file.name}
                      sizes="(max-width: 768px) 100vw"
                    />
                  ) : (
                    <>{fileType[file.type]}</>
                  )}
                </div>
                <div className="truncate px-2.5">{file.name}</div>
                <ActionIcon
                  onClick={() => handleImageDelete(index)}
                  size="sm"
                  variant="flat"
                  color="danger"
                  className="ms-auto flex-shrink-0 p-0 dark:bg-red-dark/20"
                >
                  <PiTrashBold className="w-6" />
                </ActionIcon>
              </div>
            ))}
          </div>
        </SimpleBar>
      )}
      <div className="mt-4 flex justify-end gap-3">
        <Button
          variant="outline"
          className={cn(!files.length && 'hidden', 'w-full')}
          onClick={() => setFiles([])}
        >
          Reset
        </Button>
        <Button className="w-full" onClick={() => handleFileUpload()}>
          <PiArrowLineDownBold className="me-1.5 h-[17px] w-[17px]" />
          {btnLabel}
        </Button>
      </div>
    </div>
  );
};



function setValue(name: void, fileNames: string[]) {
    throw new Error('Function not implemented.');
}

// function getValues(fileName: any) {
//     throw new Error('Function not implemented.');
// }

