import { Button, Icon } from '@sds-eng/base';
import { FC } from 'react';

import * as styles from './styles.module.css';

interface ActiveCellProps {
  edit: boolean;
  canSave: boolean;
  onEdit: () => void;
  onClose: () => void;
  onRemove?: () => void;
  onSave: () => void;
}

const ActiveCell: FC<ActiveCellProps> = ({ canSave, edit, onEdit, onClose, onRemove, onSave }) => {
  return (
    <div className={styles.archiveActiveCell}>
      {edit ? (
        <>
          <Button kind="ghost" view="secondary" size="sm" icon={<Icon.Checkmark />} contentType="Icon" disabled={!canSave} onClick={onSave} />
          <Button kind="ghost" view="secondary" size="sm" icon={<Icon.CloseNano />} contentType="Icon" onClick={onClose} />
        </>
      ) : (
        <>
          <Button kind="ghost" view="secondary" size="sm" icon={<Icon.Edit />} contentType="Icon" onClick={onEdit} />
          {onRemove && <Button kind="ghost" view="secondary" size="sm" icon={<Icon.Delete />} contentType="Icon" onClick={onRemove} />}
        </>
      )}
    </div>
  );
};

export default ActiveCell;
