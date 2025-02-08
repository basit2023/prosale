import { useModal } from '@/app/shared/modal-views/use-modal';

import React from 'react';
import { Title } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { PiXBold } from 'react-icons/pi';

import UpdateRates from './UpdateRates';
const useModalHook = () => {
  const { openModal } = useModal();

  const handleViewInvoice = (slug:string,rowId: string, floor:string, SqFtRate:any) => {
    openModal({
      view: <VaultInformationModalView slug={slug} id={rowId} floor={floor} SqFtRate={SqFtRate}/>, // Pass rowId to the modal
      customSize: '520px',
    });
  };

  return { handleViewInvoice };
};


// VaultInformationModalView.js




function VaultInformationModalView({slug, id,floor,SqFtRate}:any) {

  const formattedTitle = slug.replace(/_/g, ' ');
  const { closeModal } = useModal();

  return (
    <div className="m-auto px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7">
      <div className="mb-7 flex items-center justify-between">
        <Title as="h4" className="font-semibold">
        Are you sure you want to update the rates of {formattedTitle} - {floor} {SqFtRate}?
        </Title>
        <ActionIcon size="sm" variant="text" onClick={() => closeModal()}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>
      <UpdateRates slug={slug} id={id}  SqFtRate={SqFtRate}/>
    </div>
  );
}
export {useModalHook,VaultInformationModalView}