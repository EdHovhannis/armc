import { Button, Icon } from '@sds-eng/base';
import { DataGrid } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { FC, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { DEFAULT_RESTRICTION_UNIT } from '@src/Shared/constants/restrictions';

import DeleteRestrictionModal from './DeleteRestrictionModal';
import { buildRestrictionColumns, RestrictionGridRow } from './columns';
import { onOpenRestrictionDelete } from './model';
import * as styles from './styles.module.css';
import { RestrictionListName, RestrictionsFormValues } from './types';

type Option = { value: string; label: string };

type Props = {
  name: RestrictionListName;
  entityHeader: string;
  entityPlaceholder: string;
  options: Option[];
  loadingOptions: boolean;
  loading: boolean;
};

const RestrictionGrid: FC<Props> = ({ name, entityHeader, entityPlaceholder, options, loadingOptions, loading }) => {
  const { control } = useFormContext<RestrictionsFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name });
  const onOpenDelete = useUnit(onOpenRestrictionDelete);

  const columns = useMemo(
    () =>
      buildRestrictionColumns({
        name,
        entityHeader,
        entityPlaceholder,
        options,
        loadingOptions,
        onDelete: (index, label) => onOpenDelete({ index, label }),
      }),
    [name, entityHeader, entityPlaceholder, options, loadingOptions, onOpenDelete],
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
      <DeleteRestrictionModal onConfirm={remove} />
    </div>
  );
};

export default RestrictionGrid;
