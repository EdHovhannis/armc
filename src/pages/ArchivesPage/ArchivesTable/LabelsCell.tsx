import { Tag } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useCallback } from 'react';

import { ArchiveConfigView } from '@src/Entities/Archives/types';

import { onOpenLabelsModal } from '../LabelsModal/model';

import * as styles from './styles.module.css';

const LabelsCell: FC<{ row: ArchiveConfigView }> = ({ row }) => {
  const onOpenLabels = useUnit(onOpenLabelsModal);

  const handleOpenLabels = useCallback(() => {
    onOpenLabels(row);
  }, [onOpenLabels, row]);

  const labels = row.labels ?? [];
  if (!labels.length) {
    return null;
  }

  return (
    <div className={styles.labelsCell}>
      {labels.map((label) => (
        <Tag key={label} as="span" className={`${styles.labelTag} ${styles.labelTagClickable}`} onClick={handleOpenLabels}>
          {label}
        </Tag>
      ))}
    </div>
  );
};

export default LabelsCell;
