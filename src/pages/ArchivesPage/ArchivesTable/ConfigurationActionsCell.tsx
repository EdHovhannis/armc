import { Button, Divider, DropdownMenu, DropdownMenuItem, Icon } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useCallback } from 'react';
import { createSearchParams, useNavigate } from 'react-router';

import routes from '@src/Shared/constants/routes';

import { ArchiveConfigView } from '@src/Entities/Archives/types';

import { onChangeHeaderOpenRestrictionDrawer } from '@src/Widgets/Header/model';

import { onOpenAddInstanceModal } from '../AddInstanceModal/model';
import { onOpenDeleteConfigModal } from '../DeleteConfigModal/model';
import { onOpenLabelsModal } from '../LabelsModal/model';

import * as styles from './styles.module.css';

// Меню действий над конфигурацией (kebab в таблице Конфигураций).
// Состав строго по макету: Редактировать | Метки, Ограничения | Экспорт | + экземпляр.
const ConfigurationActionsCell: FC<{ row: ArchiveConfigView }> = ({ row }) => {
  const navigate = useNavigate();
  const [onOpenRestrictionDrawer, onOpenLabels, onOpenAddInstance, onOpenDelete] = useUnit([
    onChangeHeaderOpenRestrictionDrawer,
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
    // открываем общий Drawer ограничений как есть
    // TODO(restrictions-context): пробросить indexId этой конфигурации и открывать вкладку "По индексу"
    onOpenRestrictionDrawer(true);
  }, [onOpenRestrictionDrawer]);

  const handleLabels = useCallback(() => {
    onOpenLabels(row);
  }, [onOpenLabels, row]);

  const handleExport = useCallback(() => {
    // TODO(configuration-actions): экспорт конфигурации в JSON, бэк пока не готов
    console.log('Экспорт', row);
  }, [row]);

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

          <DropdownMenuItem closeMenuOnClick prefix={<Icon.Delete />} onClick={handleDelete}>
            Удалить
          </DropdownMenuItem>
        </>
      }
    >
      <Button.Icon size="sm" view="secondary" icon={<Icon.MenuKebab />} aria-label="Действия" />
    </DropdownMenu>
  );
};

export default ConfigurationActionsCell;
