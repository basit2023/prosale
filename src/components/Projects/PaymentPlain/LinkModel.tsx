import { useModal } from '@/app/shared/modal-views/use-modal';

import React from 'react';
import { Title } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { PiXBold } from 'react-icons/pi';

import LinkProjects from './Linksprojects';
const useModalHook = () => {
  const { openModal } = useModal();

  const handleViewInvoice = (rowId: string) => {
    openModal({
      view: <VaultInformationModalView id={rowId}  />, // Pass rowId to the modal
      customSize: '520px',
    });
  };

  return { handleViewInvoice };
};


// VaultInformationModalView.js




function VaultInformationModalView({id}:any) {

  
  const { closeModal } = useModal();

  return (
    <div className="m-auto px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7">
      <div className="mb-7 flex items-center justify-between">
        <Title as="h4" className="font-semibold">
        Are you sure want to Link this Project?
        </Title>
        <ActionIcon size="sm" variant="text" onClick={() => closeModal()}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>
      <LinkProjects id={id}/>
    </div>
  );
}
export {useModalHook,VaultInformationModalView}