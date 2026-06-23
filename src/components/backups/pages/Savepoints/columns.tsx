import moment from 'moment';

import { taskStatusIsInProgress, timeDifferenceToString } from '../../utils';

export const columnsIndex = [
  {
    header: 'ID',
    accessorKey: 'id',
    size: 80,
  },
  // {
  //   header: 'Проект',
  //   accessorKey: 'projectShortName',
  // },
  {
    header: 'Зона',
    accessorKey: 'zoneId',
  },
  // {
  //   header: 'Индекс',
  //   accessorKey: 'taskName',
  // },
  {
    header: 'Коллекция',
    accessorKey: 'collectionName',
  },
  {
    header: 'Точка восстановления',
    accessorKey: 'savepointName',
  },
  {
    header: 'Дата создания',
    accessorKey: 'createdAt',
    Cell: ({ row }: any) => row.original.createdAt && moment(row.original.createdAt).format('DD.MM.YYYY HH:mm:ss'),
  },
];

export const columnsSavepoints = [
  {
    header: 'ID',
    accessorKey: 'id',
    size: 80,
  },
  // {
  //   header: 'Проект',
  //   accessorKey: 'projectShortName',
  // },
  {
    header: 'Зона',
    accessorKey: 'zoneId',
  },
  // {
  //   header: 'Индекс',
  //   accessorKey: 'taskName',
  // },
  {
    header: 'Коллекция',
    accessorKey: 'collectionName',
  },
  {
    header: 'Статус',
    accessorKey: 'status',
  },
  {
    header: 'Точка восстановления',
    accessorKey: 'savepointName',
  },
  {
    header: 'Прогресс',
    accessorKey: 'progress',
    Cell: ({ row }: any) => {
      const { completedMessages, totalMessages } = row.original.progress || {};
      const percent =
        typeof completedMessages === 'number' && typeof totalMessages === 'number' && totalMessages > 0
          ? ((completedMessages / totalMessages) * 100).toFixed(2) + '%'
          : '—';
      return percent;
    },
  },
  {
    header: 'Запущен в',
    accessorKey: 'createdAt',
    Cell: ({ row }: any) => row.original.createdAt && moment(row.original.createdAt).format('DD.MM.YYYY HH:mm:ss'),
  },
  {
    header: 'Длительность',
    accessorKey: 'timePassed',
    Cell: ({ row }: any) =>
      row.original.lastUpdatedAt &&
      row.original.createdAt &&
      timeDifferenceToString(
        row.original.lastUpdatedAt,
        row.original.createdAt,
        taskStatusIsInProgress(row.original.status) ? ' (продолжается)' : '',
      ),
  },
];
