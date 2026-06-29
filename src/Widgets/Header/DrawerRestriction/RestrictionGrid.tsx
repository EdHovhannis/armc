import { Button, Icon } from '@sds-eng/base';
import { DataGrid } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { FC, useCallback, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { DEFAULT_RESTRICTION_UNIT } from '@src/Shared/constants/restrictions';

import { deleteRestrictionFx } from '@src/Entities/Restriction/api';
import { RestrictionObjectItem, RestrictionObjectType } from '@src/Entities/Restriction/types';

import { $restrictionPreselectIndexId } from '../model';

import DeleteRestrictionModal from './DeleteRestrictionModal';
import { buildRestrictionColumns, RestrictionGridRow } from './columns';
import { onOpenRestrictionDelete } from './model';
import * as styles from './styles.module.css';
import { RestrictionListName, RestrictionsFormValues } from './types';

type Option = { value: string; label: string };

type Props = {
  name: RestrictionListName;
  objectType: RestrictionObjectType;
  entityHeader: string;
  entityPlaceholder: string;
  options: Option[];
  loadingOptions: boolean;
  loading: boolean;
  loaded: RestrictionObjectItem[];
};

const RestrictionGrid: FC<Props> = ({ name, objectType, entityHeader, entityPlaceholder, options, loadingOptions, loading, loaded }) => {
  const { control, getValues } = useFormContext<RestrictionsFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name });
  const preselectIndexId = useUnit($restrictionPreselectIndexId);

  const removeRow = useCallback(
    (index: number) => {
      remove(index);
      // если убрали последнюю строку - подсеваем пустую, чтобы грид не схлопывался
      if (fields.length <= 1) {
        append({ entity: '', value: null, unit: DEFAULT_RESTRICTION_UNIT });
      }
    },
    [remove, append, fields.length],
  );

  // корзина: персистентную строку (есть в overview) удаляем через подтверждение + реальный DELETE;
  // несохранённую новую - просто убираем из формы, удалять на бэке нечего
  const handleRemove = useCallback(
    (index: number) => {
      const entity = String(getValues(`${name}.${index}.entity`) ?? '');
      const persisted = loaded.find((item) => item.objectId === entity);
      if (persisted) {
        const label = name === 'byIndex' ? `${persisted.projectKey} / ${persisted.objectName}` : persisted.objectName;
        onOpenRestrictionDelete({ index, label });
      } else {
        removeRow(index);
      }
    },
    [getValues, name, loaded, removeRow],
  );

  // подтвердили удаление - шлём DELETE, список перезапросится в модели (рефетч overview)
  const handleConfirmDelete = useCallback(
    (index: number) => {
      const entity = String(getValues(`${name}.${index}.entity`) ?? '');
      if (entity) {
        deleteRestrictionFx({ type: objectType, id: entity });
      }
    },
    [getValues, name, objectType],
  );

  // id уже сохранённых объектов - их значения пришли с overview, префилл по ним не дёргаем
  const loadedIds = useMemo(() => new Set(loaded.map((item) => item.objectId)), [loaded]);

  const columns = useMemo(
    () =>
      buildRestrictionColumns({
        name,
        entityHeader,
        entityPlaceholder,
        options,
        loadingOptions,
        loadedIds,
        preselectIndexId,
        onDelete: handleRemove,
      }),
    [name, entityHeader, entityPlaceholder, options, loadingOptions, loadedIds, preselectIndexId, handleRemove],
  );

  return (
    <div className={styles.drawerRestrictionGridWrapper}>
      <DataGrid
        data={fields as RestrictionGridRow[]}
        columns={columns}
        getRowId={(row) => row.id}
        state={{ isLoading: loading && fields.length === 0 }}
        layoutMode="grid"
        enableSorting={false}
        enableColumnActions={false}
        enableColumnResizing={false}
        enableTopToolbar={false}
        enableBottomToolbar={false}
        enablePagination={false}
        renderEmptyRowsFallback={() => <></>}
        tableBodyRowProps={({ row }) =>
          // подсвечиваем строку, добавленную при переходе из kebab конфигурации (preselect)
          name === 'byIndex' && preselectIndexId && row.original.entity === preselectIndexId
            ? { className: styles.drawerRestrictionHighlightRow }
            : {}
        }
      />
      <Button
        kind="ghost"
        size="md"
        prefixIcon={<Icon.Plus />}
        className={styles.drawerRestrictionAddButton}
        onClick={() => append({ entity: '', value: null, unit: DEFAULT_RESTRICTION_UNIT })}
      >
        ограничение
      </Button>
      <DeleteRestrictionModal onConfirm={handleConfirmDelete} />
    </div>
  );
};

export default RestrictionGrid;
