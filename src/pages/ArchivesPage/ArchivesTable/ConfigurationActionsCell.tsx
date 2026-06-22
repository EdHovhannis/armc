import { Button, Divider, DropdownMenu, DropdownMenuItem, Icon, Tooltip } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useCallback } from 'react';
import { createSearchParams, useNavigate } from 'react-router';

import routes from '@src/Shared/constants/routes';
import { downloadJson } from '@src/Shared/lib/downloadJson';

import { exportArchiveConfigFx } from '@src/Entities/Archives/api';
import { ArchiveConfigView } from '@src/Entities/Archives/types';

import { onOpenRestrictionDrawerForConfig } from '@src/Widgets/Header/model';

import { onOpenAddInstanceModal } from '../AddInstanceModal/model';
import { onOpenDeleteConfigModal } from '../DeleteConfigModal/model';
import { onOpenLabelsModal } from '../LabelsModal/model';

import * as styles from './styles.module.css';

// Меню действий над конфигурацией (kebab в таблице Конфигураций).
// Состав строго по макету: Редактировать | Метки, Ограничения | Экспорт | + экземпляр.
const ConfigurationActionsCell: FC<{ row: ArchiveConfigView }> = ({ row }) => {
  const navigate = useNavigate();
  const [onOpenRestrictionDrawer, onOpenLabels, onOpenAddInstance, onOpenDelete] = useUnit([
    onOpenRestrictionDrawerForConfig,
    onOpenLabelsModal,
    onOpenAddInstanceModal,
    onOpenDeleteConfigModal,
  ]);

  const handleEdit = useCallback(() => {
    // пробрасываем конфигурацию в query, чтобы edit-страница знала, что редактируем
    // TODO(archives-edit): на /archives/edit читать project/name из search-параметров и грузить конфигурацию
    const search = `?${createSearchParams({ project: row.projectKey, name: row.configuration })}`;
    navigate({ pathname: routes.ARCHIVES_EDIT, search });
  }, [navigate, row.projectKey, row.configuration]);

  const handleRestrictions = useCallback(() => {
    // открываем дравер на вкладке "По индексу" с преселектом этой конфигурации (id)
    onOpenRestrictionDrawer(String(row.id));
  }, [onOpenRestrictionDrawer, row.id]);

  const handleLabels = useCallback(() => {
    onOpenLabels(row);
  }, [onOpenLabels, row]);

  const handleExport = useCallback(() => {
    // GET конфигурации и скачивание ответа файлом {taskName}.json (как в abyss)
    exportArchiveConfigFx({ project: row.projectKey, taskName: row.configuration })
      .then((response) => downloadJson(`${row.configuration}.json`, response.data))
      .catch(() => undefined); // ошибку покажет handleErrorFx
  }, [row.projectKey, row.configuration]);

  const handleAddInstance = useCallback(() => {
    onOpenAddInstance(row);
  }, [onOpenAddInstance, row]);

  const handleDelete = useCallback(() => {
    onOpenDelete(row);
  }, [onOpenDelete, row]);

  return (
    <DropdownMenu
      action="click"
      placement="bottom-end"
      content={
        <>
          <DropdownMenuItem closeMenuOnClick onClick={handleEdit}>
            Редактировать
          </DropdownMenuItem>

          <Divider className={styles.configurationActionsDivider} />

          <DropdownMenuItem closeMenuOnClick onClick={handleLabels}>
            Метки
          </DropdownMenuItem>
          <DropdownMenuItem closeMenuOnClick onClick={handleRestrictions}>
            Ограничения
          </DropdownMenuItem>

          <Divider className={styles.configurationActionsDivider} />

          <DropdownMenuItem closeMenuOnClick onClick={handleExport}>
            Экспорт
          </DropdownMenuItem>

          <Divider className={styles.configurationActionsDivider} />

          <DropdownMenuItem closeMenuOnClick prefix={<Icon.Add />} onClick={handleAddInstance}>
            экземпляр
          </DropdownMenuItem>

          <Divider className={styles.configurationActionsDivider} />

          {/* Удалить доступно только у конфигураций без экземпляров. с инстансами - дизейблим */}
          {row.instancesCount === 0 ? (
            <DropdownMenuItem closeMenuOnClick prefix={<Icon.Delete />} onClick={handleDelete}>
              Удалить
            </DropdownMenuItem>
          ) : (
            <Tooltip title="Нельзя удалить конфигурацию, пока у неё есть экземпляры">
              <DropdownMenuItem disabled prefix={<Icon.Delete />}>
                Удалить
              </DropdownMenuItem>
            </Tooltip>
          )}
        </>
      }
    >
      <Button.Icon size="sm" view="secondary" icon={<Icon.MenuKebab />} aria-label="Действия" />
    </DropdownMenu>
  );
};

export default ConfigurationActionsCell;
