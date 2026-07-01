import { Button, Divider, DropdownMenu, DropdownMenuItem, Icon } from '@sds-eng/base';
import { FC } from 'react';

import { ArchiveInstanceView } from '@src/Entities/Archives/types';
import { fetchInstanceStatusFx } from '@src/Entities/Instance/api';

import { onOpenDeleteInstanceModal } from '../DeleteInstanceModal/model';
import { onOpenInstanceActionModal } from '../InstanceActionModal/model';
import { onOpenInstanceOverdraftModal } from '../InstanceOverdraftModal/model';
import { onOpenInstanceQuotasModal } from '../InstanceQuotasModal/model';
import { onOpenResetOffsetModal } from '../ResetOffsetModal/model';
import { onOpenSetOffsetModal } from '../SetOffsetModal/model';

import * as styles from './styles.module.css';

const InstanceActionsCell: FC<{ row: ArchiveInstanceView }> = ({ row }) => {
  const isRunning = row.instanceStatus === 'RUNNING';
  const isStatusKnown = row.instanceStatus !== 'WITHOUT_RESPONSE';
  const isOverdraftAvailable = row.metadata.maxAvailableOverdraft !== 0;

  const handleStateChange = (open: boolean) => {
    if (!open) return;
    fetchInstanceStatusFx({
      project: row.projectName,
      taskName: row.configName,
      zoneId: row.zoneId,
      instanceId: row.id,
      fallbackStatus: row.instanceStatus,
    });
  };

  return (
    <DropdownMenu
      action="click"
      placement="bottom-end"
      onStateChange={handleStateChange}
      content={
        <>
          {isStatusKnown && (
            <>
              <DropdownMenuItem
                closeMenuOnClick
                prefix={isRunning ? <Icon.Pause /> : <Icon.Play />}
                onClick={() => onOpenInstanceActionModal({ row, action: isRunning ? 'suspend' : 'resume' })}
              >
                {isRunning ? 'Стоп' : 'Старт'}
              </DropdownMenuItem>

              <Divider className={styles.configurationActionsDivider} />
            </>
          )}

          <DropdownMenuItem closeMenuOnClick onClick={() => onOpenSetOffsetModal(row)}>
            Установить offset
          </DropdownMenuItem>
          <DropdownMenuItem closeMenuOnClick onClick={() => onOpenResetOffsetModal(row)}>
            Сбросить offset
          </DropdownMenuItem>

          <Divider className={styles.configurationActionsDivider} />

          <DropdownMenuItem closeMenuOnClick disabled={!isOverdraftAvailable} onClick={() => onOpenInstanceOverdraftModal(row)}>
            Овердрафт
          </DropdownMenuItem>

          <Divider className={styles.configurationActionsDivider} />

          <DropdownMenuItem closeMenuOnClick onClick={() => onOpenInstanceQuotasModal(row)}>
            Переопределить квоты
          </DropdownMenuItem>

          <Divider className={styles.configurationActionsDivider} />

          <DropdownMenuItem closeMenuOnClick prefix={<Icon.Delete />} onClick={() => onOpenDeleteInstanceModal(row)}>
            Удалить
          </DropdownMenuItem>
        </>
      }
    >
      <Button.Icon size="sm" view="secondary" icon={<Icon.MenuKebab />} aria-label="Действия" />
    </DropdownMenu>
  );
};

export default InstanceActionsCell;
