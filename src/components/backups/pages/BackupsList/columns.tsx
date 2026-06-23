import { Icon } from '@sds-eng/base';
import { createDataGridColumnMenuFilter } from '@src/components/backups/FilterControls/ColumnMenuFilter';
import { GenerateColumnsFn } from '@src/components/backups/GenericBackupsTable';
import { IIndexBackup } from '@src/components/backups/types';
import moment from 'moment';

import { findFilterDefinition, getCellWithStatusColor, getCellWithSubStatusColor } from '../../utils';
const Copy = Icon.Copy;

export const BACKUP_DEFAULT_VISIBILITY = {
  id: true,
  projectShortName: false,
  taskName: false,
  backupName: true,
  backupTime: true,
  status: true,
  subStatus: false,
  collectionName: true,
  zoneId: false,
  backupPath: true,
  createdAt: false,
  lastUpdatedAt: false,
};

export const BACKUP_DEFAULT_COLUMN_SIZES: Record<string, number> = {
  id: 80,
  projectShortName: 250,
  taskName: 250,
  backupName: 330,
  backupTime: 210,
  status: 180,
  subStatus: 200,
  collectionName: 610,
  zoneId: 140,
  backupPath: 120,
  createdAt: 210,
  lastUpdatedAt: 210,
};

export const BACKUP_FILTER_MAPPING: Record<string, string> = {
  projectFilter: 'projectShortName',
  indexFilter: 'taskName',
  namesFilter: 'backupName',
  date: 'backupTime',
  statusFilter: 'status',
  collectionsFilter: 'collectionName',
};

export const getColumns = (displaySuccess: (message: string) => void, displayError: (err: string) => void): GenerateColumnsFn<IIndexBackup> => {
  return (filterDefinitions, filterSelectedValues, setFilterSelectedValues) => {
    return [
      {
        header: 'ID',
        accessorKey: 'id',
        enableColumnFilter: false,
      },
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
        header: 'Дата снятия копии',
        accessorKey: 'backupTime',
        Cell: ({ row }: any) => row.original.backupTime && moment(row.original.backupTime).format('DD.MM.YYYY HH:mm:ss'),
        Filter: ({ closeFilterPopover }) =>
          createDataGridColumnMenuFilter(
            findFilterDefinition(filterDefinitions, 'date'),
            filterSelectedValues,
            setFilterSelectedValues,
            closeFilterPopover,
          ),
      },
      {
        header: 'Cтатус',
        accessorKey: 'status',
        Cell: ({ row }: any) => {
          return getCellWithStatusColor(row.original.status);
        },
        Filter: ({ closeFilterPopover }) =>
          createDataGridColumnMenuFilter(
            findFilterDefinition(filterDefinitions, 'statusFilter'),
            filterSelectedValues,
            setFilterSelectedValues,
            closeFilterPopover,
          ),
      },
      {
        header: 'Субстатус',
        accessorKey: 'subStatus',
        enableColumnFilter: false,
        Cell: ({ row }: any) => {
          return row.original.subStatus && getCellWithSubStatusColor(row.original.subStatus);
        },
      },
      {
        header: 'Имя копии',
        accessorKey: 'backupName',
        Filter: ({ closeFilterPopover }) =>
          createDataGridColumnMenuFilter(
            findFilterDefinition(filterDefinitions, 'namesFilter'),
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
        header: 'Путь к HDFS',
        enableColumnFilter: false,
        accessorKey: 'backupPath',
        Cell: ({ row }) => {
          return (
            <Copy
              style={{ cursor: 'pointer' }}
              onClick={() => {
                try {
                  navigator.clipboard.writeText(row.original.backupPath);
                  displaySuccess('Путь скопирован успешно');
                } catch (err: any) {
                  displayError(err.message || 'Не получилось скопировать');
                }
              }}
            />
          );
        },
      },
      {
        header: 'Время запуска задачи',
        accessorKey: 'createdAt',
        enableColumnFilter: false,
        Cell: ({ row }: any) => row.original.createdAt && moment(row.original.createdAt).format('DD.MM.YYYY HH:mm:ss'),
      },
      {
        header: 'Время последнего обновления',
        accessorKey: 'lastUpdatedAt',
        enableColumnFilter: false,
        Cell: ({ row }: any) => row.original.lastUpdatedAt && moment(row.original.lastUpdatedAt).format('DD.MM.YYYY HH:mm:ss'),
      },
    ];
  };
};
