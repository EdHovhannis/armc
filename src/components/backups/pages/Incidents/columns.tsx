import { IconBase, Tag } from '@sds-eng/base';
import { ViewModeFullSize, Download } from '@sds-eng/base/dist/esm/icons';
import { createDataGridColumnMenuFilter } from '@src/components/backups/FilterControls/ColumnMenuFilter';
import { GenerateColumnsFn } from '@src/components/backups/GenericBackupsTable';
import { IBackupsIncident } from '@src/components/backups/types';
import { findFilterDefinition } from '@src/components/backups/utils';
import moment from 'moment';
import * as React from 'react';

export const INCIDENTS_DEFAULT_VISIBILITY = {
  id: true,
  projectShortName: true,
  taskName: true,
  status: true,
  collectionName: true,
  zoneId: false,
  objectType: true,
  errorClass: true,
  startTime: false,
  errorDescription: true,
  lastUpdatedAt: false,
};

export const INCIDENTS_DEFAULT_COLUMN_SIZES: Record<string, number> = {
  id: 80,
  projectShortName: 250,
  taskName: 250,
  status: 240,
  collectionName: 610,
  zoneId: 140,
  objectType: 140,
  errorClass: 290,
  startTime: 210,
  errorDescription: 170,
  lastUpdatedAt: 210,
};

export const INCIDENTS_FILTER_MAPPING: Record<string, string> = {
  projectFilter: 'projectShortName',
  indexFilter: 'taskName',
  finishFilter: 'status',
  collectionsFilter: 'collectionName',
  objectTypeFilter: 'objectType',
  errorClassFilter: 'errorClass',
  date: 'startTime',
};

export const getColumns = (
  showErrorModal: { (error: string): void; (arg0: any): void },
  saveError: { (error: string, fileName: string): void; (arg0: any, arg1: string): void },
): GenerateColumnsFn<IBackupsIncident> => {
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
        header: 'Cтатус',
        accessorKey: 'status',
        Cell: ({ row }: any) =>
          row.original.finished ? (
            <Tag size="sm" style={{ background: '#1a9e321e', color: '#108e26' }}>
              Решен {row.original.finishTime ? ` ${moment(row.original.finishTime).format('DD.MM.YYYY HH:mm:ss')}` : ''}
            </Tag>
          ) : (
            <Tag size="sm" style={{ color: '#e31227', background: '#ff293e1e' }}>
              Продолжается
            </Tag>
          ),
        Filter: ({ closeFilterPopover }) =>
          createDataGridColumnMenuFilter(
            findFilterDefinition(filterDefinitions, 'finishFilter'),
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
        header: 'Тип объекта',
        accessorKey: 'objectType',
        Filter: ({ closeFilterPopover }) =>
          createDataGridColumnMenuFilter(
            findFilterDefinition(filterDefinitions, 'objectTypeFilter'),
            filterSelectedValues,
            setFilterSelectedValues,
            closeFilterPopover,
          ),
      },
      {
        header: 'Класс ошибки',
        accessorKey: 'errorClass',
        Filter: ({ closeFilterPopover }) =>
          createDataGridColumnMenuFilter(
            findFilterDefinition(filterDefinitions, 'errorClassFilter'),
            filterSelectedValues,
            setFilterSelectedValues,
            closeFilterPopover,
          ),
      },
      {
        header: 'Время начала',
        accessorKey: 'startTime',
        Cell: ({ row }: any) => {
          return row.original.startTime;
        },
        Filter: ({ closeFilterPopover }) =>
          createDataGridColumnMenuFilter(
            findFilterDefinition(filterDefinitions, 'date'),
            filterSelectedValues,
            setFilterSelectedValues,
            closeFilterPopover,
          ),
      },
      {
        header: 'Описание ошибки',
        accessorKey: 'errorDescription',
        enableColumnFilter: false,
        Cell: ({ row }: any) => (
          <>
            <IconBase onClick={() => showErrorModal(row.original.errorDescription)} style={{ color: '#2969e3', cursor: 'pointer' }}>
              <ViewModeFullSize color="foreAccent" />
            </IconBase>
            <IconBase
              onClick={() =>
                saveError(
                  row.original.errorDescription,
                  `${row.original.id}_${row.original.projectShortName}_${row.original.taskName}_${row.original.zoneId}`,
                )
              }
              style={{ color: '#2969e3', marginLeft: 10, cursor: 'pointer' }}
            >
              <Download color="foreAccent" />
            </IconBase>
          </>
        ),
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
