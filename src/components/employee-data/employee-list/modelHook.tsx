import { useModal } from '@/app/shared/modal-views/use-modal';
import VaultInformationModalView from '@/app/shared/VaultInformationModalView';
const useModalHook = () => {
  const { openModal } = useModal();

  const handleViewInvoice = (rowId: string) => {
    openModal({
      view: <VaultInformationModalView id={rowId} />, // Pass rowId to the modal
      customSize: '420px',
    });
  };

  return { handleViewInvoice };
};

export default useModalHook;
