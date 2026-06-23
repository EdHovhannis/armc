import { createDataGridColumnMenuFilter } from '@src/components/backups/FilterControls/ColumnMenuFilter';
import { GenerateColumnsFn } from '@src/components/backups/GenericBackupsTable';
import { IIndexRestore } from '@src/components/backups/types';
import moment from 'moment';

import { findFilterDefinition, getCellWithStatusColor, getCellWithSubStatusColor, taskStatusIsInProgress, timeDifferenceToString } from '../../utils';

export const RECOVERY_DEFAULT_VISIBILITY = {
  id: true,
  projectShortName: false,
  taskName: false,
  createdAt: true,
  status: true,
  subStatus: false,
  timePassed: true,
  collectionName: true,
  zoneId: false,
  backupId: true,
  lastUpdatedAt: false,
};

export const RECOVERY_DEFAULT_COLUMN_SIZES: Record<string, number> = {
  id: 70,
  projectShortName: 250,
  taskName: 250,
  createdAt: 210,
  status: 180,
  subStatus: 200,
  timePassed: 140,
  collectionName: 610,
  zoneId: 140,
  backupId: 100,
  lastUpdatedAt: 210,
};

export const RECOVERY_FILTER_MAPPING: Record<string, string> = {
  projectFilter: 'projectShortName',
  indexFilter: 'taskName',
  date: 'createdAt',
  statusFilter: 'status',
  collectionsFilter: 'collectionName',
};

export const getColumns = (): GenerateColumnsFn<IIndexRestore> => {
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
        header: 'Время запуска',
        accessorKey: 'createdAt',
        Cell: ({ row }: any) => row.original.createdAt && moment(row.original.createdAt).format('DD.MM.YYYY HH:mm:ss'),
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
        header: 'Длительность',
        accessorKey: 'timePassed',
        enableColumnFilter: false,
        Cell: ({ row }: any) =>
          row.original.lastUpdatedAt &&
          row.original.createdAt &&
          timeDifferenceToString(
            row.original.lastUpdatedAt,
            row.original.createdAt,
            taskStatusIsInProgress(row.original.status) ? ' (продолжается)' : '',
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
        header: 'ID копии',
        accessorKey: 'backupId',
        enableColumnFilter: false,
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
