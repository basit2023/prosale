'use client';

import { PiArrowLineDownBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Button } from '@/components/ui/button';

type UploadButtonProps = {
  modalView: React.ReactNode;
  name?: string; // You can add more specific props if needed
  onClick?: () => void;
  value?: string;
};

export default function UploadButton({ modalView, name, onClick, value }: UploadButtonProps) {
  const { openModal } = useModal();

  return (
    <Button
      className="mt-4 w-full @lg:mt-0 @lg:w-auto dark:bg-gray-200 dark:text-white"
      onClick={() => {
        openModal({
          view: modalView,
        });
        
        // Call the provided onClick function if it exists
        if (onClick) {
          onClick();
        }
      }}
      // Pass the name and value props to the button
      name={name}
      value={value}
    >
      <PiArrowLineDownBold className="me-1.5 h-[17px] w-[17px]" />
      Upload Offer Letter
    </Button>
  );
}
