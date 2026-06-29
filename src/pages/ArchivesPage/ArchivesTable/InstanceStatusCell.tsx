import { Tooltip } from '@sds-eng/base';
import { FC, KeyboardEvent, MouseEvent } from 'react';

import { ArchiveInstanceView } from '@src/Entities/Archives/types';

import { onOpenInstanceActionModal } from '../InstanceActionModal/model';

import StatusBadge from './StatusBadge';

const InstanceStatusCell: FC<{ row: ArchiveInstanceView }> = ({ row }) => {
  const status = row.instanceStatus;

  // WITHOUT_RESPONSE - статус неизвестен, старт/стоп недоступны (как в кебаб-меню)
  if (status === 'WITHOUT_RESPONSE') return <StatusBadge status={status} />;

  const isRunning = status === 'RUNNING';

  const openAction = () => onOpenInstanceActionModal({ row, action: isRunning ? 'suspend' : 'resume' });

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    openAction();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    e.stopPropagation();
    openAction();
  };

  return (
    <Tooltip title={isRunning ? 'Остановить экземпляр' : 'Запустить экземпляр'} disabledArrow>
      <StatusBadge status={status} clickable role="button" tabIndex={0} onClick={handleClick} onKeyDown={handleKeyDown} />
    </Tooltip>
  );
};

export default InstanceStatusCell;
