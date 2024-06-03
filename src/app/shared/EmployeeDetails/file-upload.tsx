
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
import Spinner from '@/components/ui/spinner';

type AcceptedFiles = 'img' | 'pdf' | 'csv' | 'imgAndPdf' | 'all';
export default function FileUpload({
  accept = 'all',
  id,
}: {
  accept?: AcceptedFiles;
  id?: string;
}) {
  let label = 'Upload Files';
  let btnLabel = 'Upload';
  let multiple = true;

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { closeModal } = useModal();
  const imageRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async () => {
    if (!files.length) {
      toast.error(<Text as="b">Please drop your file</Text>);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append(file.name, file));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const data = await response.json();
      console.log('Server response:', data);

      setFiles([]);
      toast.success(<Text as="b">Files successfully added</Text>);
      closeModal();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error(<Text as="b">Error uploading files</Text>);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    const newFiles = Array.from(uploadedFiles as FileList);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleImageDelete = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  const handleReset = () => {
    setFiles([]);
    if (imageRef.current) {
      imageRef.current.value = '';
    }
  };

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
      {loading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : (
        <FileInput
          accept={accept}
          multiple={multiple}
          btnLabel={btnLabel}
          handleFileUpload={handleFileUpload}
          files={files}
          imageRef={imageRef}
          handleFileDrop={handleFileDrop}
          handleImageDelete={handleImageDelete}
          handleReset={handleReset}
        />
      )}
    </div>
  );
}

const fileType = {
  'application/pdf': <PiFilePdf className="h-5 w-5" />,
  'text/csv': <PiFileCsv className="h-5 w-5" />,
  'text/plain': <PiFile className="h-5 w-5" />,
  'application/xml': <PiFileXls className="h-5 w-5" />,
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
  handleFileUpload,
  files,
  imageRef,
  handleFileDrop,
  handleImageDelete,
  handleReset,
}: {
  className?: string;
  label?: React.ReactNode;
  multiple?: boolean;
  btnLabel?: string;
  accept?: AcceptedFiles;
  handleFileUpload: () => void;
  files: File[];
  imageRef: React.RefObject<HTMLInputElement>;
  handleFileDrop: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageDelete: (index: number) => void;
  handleReset: () => void;
}) => {
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
      {files.length > 1 && (
        <Text className="mb-2 text-gray-500">{files.length} files</Text>
      )}
      {files.length > 0 && (
        <SimpleBar className="max-h-[280px]">
          <div className="grid grid-cols-1 gap-4">
            {files.map((file: File, index: number) => (
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
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button className="w-full" onClick={handleFileUpload}>
          <PiArrowLineDownBold className="me-1.5 h-[17px] w-[17px]" />
          {btnLabel}
        </Button>
      </div>
    </div>
  );
};
