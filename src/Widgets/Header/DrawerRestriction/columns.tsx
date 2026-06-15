import { Button, Icon } from '@sds-eng/base';
import { DataGridColumnDef } from '@sds-eng/data-grid';
import { FieldArrayWithId } from 'react-hook-form';

import { EntitySelectCell, IntervalCell } from './RestrictionCells';
import * as styles from './styles.module.css';
import { RestrictionListName, RestrictionsFormValues } from './types';

type Option = { value: string; label: string };

export type RestrictionGridRow = FieldArrayWithId<RestrictionsFormValues, RestrictionListName, 'id'>;

type BuildColumnsParams = {
  name: RestrictionListName;
  entityHeader: string;
  entityPlaceholder: string;
  options: Option[];
  loadingOptions: boolean;
  onDelete: (index: number, label: string) => void;
};

export const buildRestrictionColumns = ({
  name,
  entityHeader,
  entityPlaceholder,
  options,
  loadingOptions,
  onDelete,
}: BuildColumnsParams): DataGridColumnDef<RestrictionGridRow>[] => [
  {
    id: 'entity',
    header: entityHeader,
    size: 380,
    minSize: 240,
    tableBodyCellProps: { className: styles.drawerRestrictionStretchCell },
    Cell: ({ row }) => <EntitySelectCell name={name} index={row.index} placeholder={entityPlaceholder} options={options} loading={loadingOptions} />,
  },
  {
    id: 'interval',
    header: 'Макс. временной интервал поиска',
    size: 280,
    minSize: 220,
    tableBodyCellProps: { className: styles.drawerRestrictionStretchCell },
    Cell: ({ row }) => (
      <div className={styles.drawerRestrictionIntervalCell}>
        <IntervalCell name={name} index={row.index} />
      </div>
    ),
  },
  {
    id: 'delete',
    header: '',
    size: 56,
    minSize: 56,
    enableResizing: false,
    Cell: ({ row }) => (
      <Button.Icon
        icon={<Icon.Delete />}
        view="secondary"
        size="sm"
        aria-label="Удалить ограничение"
        onClick={() => onDelete(row.index, row.original.entity)}
      />
    ),
  },
];
