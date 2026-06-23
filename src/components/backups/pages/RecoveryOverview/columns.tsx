import { Link } from '@sds-eng/base';
import { createDataGridColumnMenuFilter } from '@src/components/backups/FilterControls/ColumnMenuFilter';
import { createLastBackupColumnMenuFilter } from '@src/components/backups/FilterControls/LastBackupColumnMenuFilter';
import { GenerateColumnsFn } from '@src/components/backups/GenericBackupsTable';
import * as React from 'react';

import { IS_SAVEPOINTS_FEATURE_ENABLED } from '../../../shared/constants';
import { IIndexRecovery } from '../../types';
import { findFilterDefinition, getCellWithCorruptedColor, getCellWithLastBackupColor } from '../../utils';

export const RECOVERY_OVERVIEW_DEFAULT_VISIBILITY = {
  projectShortName: false,
  taskName: false,
  collectionName: true,
  zoneId: true,
  lastBackup: true,
  status: true,
  isHot: true,
  backupCount: true,
};

export const RECOVERY_OVERVIEW_DEFAULT_COLUMN_SIZES: Record<string, number> = {
  projectShortName: 250,
  taskName: 250,
  collectionName: 610,
  zoneId: 140,
  lastBackup: 210,
  status: 180,
  isHot: 120,
  backupCount: 90,
};

export const RECOVERY_OVERVIEW_FILTER_MAPPING: Record<string, string> = {
  projectFilter: 'projectShortName',
  indexFilter: 'taskName',
  collectionsFilter: 'collectionName',
  backupFilter: 'lastBackup',
  date: 'lastBackup',
  corrupted: 'status',
  isHotFilter: 'isHot',
};

export const getColumns = (
  redirectHandler: (type: 'BACKUP' | 'SAVEPOINT' | 'LIST', data: IIndexRecovery) => void,
): GenerateColumnsFn<IIndexRecovery> => {
  return (filterDefinitions, filterSelectedValues, setFilterSelectedValues) => {
    return [
      {
        header: 'Проект',
        accessorKey: 'projectShortName',
        Filter: ({ closeFilterPopover }) =>
          createDataGridColumnMenuFilter(
            findFilterDefinition(filterDefinitions, 'projectFilter'),
            filterSelectedValues,
            setFilterSelectedValues,
            closeFilterPopover,
          ),
      },
      {
        header: 'Индекс',
        accessorKey: 'taskName',
        Filter: ({ closeFilterPopover }) =>
          createDataGridColumnMenuFilter(
            findFilterDefinition(filterDefinitions, 'indexFilter'),
            filterSelectedValues,
            setFilterSelectedValues,
            closeFilterPopover,
          ),
      },
      {
        header: 'Коллекция',
        accessorKey: 'collectionName',
        Filter: ({ closeFilterPopover }) =>
          createDataGridColumnMenuFilter(
            findFilterDefinition(filterDefinitions, 'collectionsFilter'),
            filterSelectedValues,
            setFilterSelectedValues,
            closeFilterPopover,
          ),
      },
      {
        header: 'Зона',
        accessorKey: 'zoneId',
        enableColumnFilter: false,
      },
      {
        header: 'Дата последнего бэкапа',
        accessorKey: 'lastBackup',
        Cell: ({ row }: any) => getCellWithLastBackupColor(row.original.lastBackupStatus, row.original.lastBackup),
        Filter: ({ closeFilterPopover }) =>
          createLastBackupColumnMenuFilter(
            findFilterDefinition(filterDefinitions, 'backupFilter'),
            findFilterDefinition(filterDefinitions, 'date'),
            filterSelectedValues,
            setFilterSelectedValues,
            closeFilterPopover,
          ),
      },
      {
        header: 'Статус',
        accessorKey: 'status',
        Cell: ({ row }: any) => {
          return getCellWithCorruptedColor(row.original.status);
        },
        Filter: ({ closeFilterPopover }) =>
          createDataGridColumnMenuFilter(
            findFilterDefinition(filterDefinitions, 'corrupted'),
            filterSelectedValues,
            setFilterSelectedValues,
            closeFilterPopover,
          ),
      },
      {
        header: 'Горячая',
        accessorKey: 'isHot',
        Cell: ({ row }: any) => (row.original.isHot ? 'Да' : 'Нет'),
        Filter: ({ closeFilterPopover }) =>
          createDataGridColumnMenuFilter(
            findFilterDefinition(filterDefinitions, 'isHotFilter'),
            filterSelectedValues,
            setFilterSelectedValues,
            closeFilterPopover,
          ),
      },
      {
        header: 'Бэкапы',
        accessorKey: 'backupCount',
        enableColumnFilter: false,
        Cell: ({ row }: any) => (
          <Link
            onClick={() =>
              redirectHandler('LIST', {
                ...row.original,
                collection: row.original.collectionName,
              })
            }
          >
            {row.original.backupCount}
          </Link>
        ),
      },
      ...(IS_SAVEPOINTS_FEATURE_ENABLED
        ? [
            {
              header: 'Savepoint',
              accessorKey: 'savepointCount',
              Cell: ({ row }: any) => <Link onClick={() => redirectHandler('SAVEPOINT', row.original)}>{row.original.savepointCount}</Link>,
            },
          ]
        : []),
    ];
  };
};
