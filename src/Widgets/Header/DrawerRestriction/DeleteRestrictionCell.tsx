import { Button, Icon } from '@sds-eng/base';
import { FC } from 'react';

import { RestrictionEntityRow } from './types';

type DeleteRestrictionCellProps = {
  row: RestrictionEntityRow;
  rowsCount: number;
  index: number;
  loadedIds: Set<string>;
  onDelete: (index: number) => void;
};

const DeleteRestrictionCell: FC<DeleteRestrictionCellProps> = ({ row, rowsCount, index, loadedIds, onDelete }) => {
  const isOnlyEmptyRow = rowsCount === 1 && !row.entity && row.value === null;

  if (isOnlyEmptyRow) return null;

  const persisted = Boolean(row.entity) && loadedIds.has(row.entity);
  const icon = persisted ? <Icon.Delete /> : <Icon.Close />;
  const label = persisted ? 'Удалить ограничение' : 'Убрать строку';

  return <Button.Icon icon={icon} view="secondary" size="sm" aria-label={label} onClick={() => onDelete(index)} />;
};

export default DeleteRestrictionCell;
