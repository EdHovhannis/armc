import { useUnit } from 'effector-react';
import { FC } from 'react';

import ConfirmDeleteModal from '@src/Shared/ui/ConfirmDeleteModal';

import { $restrictionDeleteRow, onCloseRestrictionDelete } from './model';

type Props = {
  onConfirm: (index: number) => void;
};

const DeleteRestrictionModal: FC<Props> = ({ onConfirm }) => {
  const [deleteRow, onClose] = useUnit([$restrictionDeleteRow, onCloseRestrictionDelete]);

  const handleConfirm = () => {
    if (deleteRow) {
      onConfirm(deleteRow.index);
    }
    onClose();
  };

  return (
    <ConfirmDeleteModal
      open={!!deleteRow}
      title="Удаление ограничения"
      description={`Удалить ограничение${deleteRow?.label ? ` для «${deleteRow.label}»` : ''}?`}
      onClose={onClose}
      onConfirm={handleConfirm}
    />
  );
};

export default DeleteRestrictionModal;
