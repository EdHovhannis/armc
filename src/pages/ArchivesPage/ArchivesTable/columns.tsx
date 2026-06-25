import { Button, Icon, Link, Text, Tooltip } from '@sds-eng/base';
import { DataGridCell, DataGridColumnDef } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { MouseEvent } from 'react';

import { STATUS_OPTIONS } from '@src/Shared/constants/filters';
import { formatBytes } from '@src/Shared/lib/format/formatBytes';
import { formatRetention } from '@src/Shared/lib/format/formatRetention';
import { formatSpeed } from '@src/Shared/lib/format/formatSpeed';

import { ArchiveConfigView, ArchiveInstanceView } from '@src/Entities/Archives/types';

import { SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { onChangeTableView } from '@src/Features/TableView/model';

import { onApplyArchiveFilters } from '../FilterDrawer/model';

import ColumnHeaderMultiSelectFilter from './ColumnHeaderMultiSelectFilter';
import ConfigurationActionsCell from './ConfigurationActionsCell';
import LabelsCell from './LabelsCell';
import StatusBadge from './StatusBadge';
import * as styles from './styles.module.css';

const createColumnHeaderFilter = (title: string, field: string, options?: typeof STATUS_OPTIONS) =>
  function ColumnHeaderFilter() {
    return <ColumnHeaderMultiSelectFilter title={title} field={field} options={options} />;
  };

const filterColumnHeadCellProps = {
  className: `${styles.tableHeadCell} ${styles.tableHeadCellFilter}`,
};

export const archiveIndexColumns: DataGridColumnDef<ArchiveInstanceView>[] = [
  {
    accessorKey: 'configName',
    header: 'Конфигурация',
    Header: createColumnHeaderFilter('Конфигурация', 'name'),
    tableHeadCellProps: filterColumnHeadCellProps,
    size: 200,
    minSize: 120,
    Cell: ({ cell }) => (
      <Text kind="bodyS" className={styles.configurationCell}>
        {cell.getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: 'zoneId',
    header: 'Зона',
    size: 90,
    Cell: ({ cell }) => <Text kind="bodyS">{cell.getValue<string>()}</Text>,
  },
  {
    accessorKey: 'instanceStatus',
    header: 'Статус',
    Header: createColumnHeaderFilter('Статус', 'status', STATUS_OPTIONS),
    tableHeadCellProps: filterColumnHeadCellProps,
    size: 140,
    minSize: 130,
    Cell: ({ cell }) => <StatusBadge status={cell.getValue<ArchiveInstanceView['instanceStatus']>()} />,
    tableBodyCellProps: {
      style: { textOverflow: 'unset' },
    },
  },
  {
    accessorKey: 'currentSizeBytes',
    header: 'Занято памяти',
    size: 110,
    Cell: ({ cell }) => <Text kind="bodyS">{formatBytes(cell.getValue<number>())}</Text>,
  },
  {
    accessorKey: 'maxSizeBytes',
    header: 'Выделено памяти',
    size: 120,
    Cell: ({ cell }) => <Text kind="bodyS">{formatBytes(cell.getValue<number>())}</Text>,
  },
  {
    accessorKey: 'maxWriteSpeed',
    header: 'Макс. скорость записи',
    size: 130,
    Cell: ({ cell }) => <Text kind="bodyS">{formatSpeed(cell.getValue<number>())}</Text>,
  },
  {
    accessorKey: 'maxIndexSize',
    header: 'Макс. размер индекса',
    size: 130,
    Cell: ({ cell }) => <Text kind="bodyS">{formatBytes(cell.getValue<number>())}</Text>,
  },
  {
    accessorKey: 'maxRetention',
    header: 'Макс. время хранения данных',
    size: 150,
    Cell: ({ cell }) => <Text kind="bodyS">{formatRetention(cell.getValue<number | null>())}</Text>,
  },
  {
    id: 'actions',
    header: 'Действия',
    size: 120,
    minSize: 110,
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
    Header: () => <span className={styles.actionsHeaderLabel}>Действия</span>,
    tableHeadCellProps: {
      align: 'right',
      className: styles.actionsHeaderCell,
      style: { textAlign: 'right' },
    },
    tableBodyCellProps: {
      align: 'right',
      className: styles.actionsBodyCell,
      style: { textAlign: 'right' },
    },
    Cell: ({ row }) => {
      const { hasVersionMismatch, configVersion, instanceVersion } = row.original;

      return (
        <div className={styles.actionsCell}>
          <Button.Icon size="sm" view="secondary" icon={<Icon.Refresh />} aria-label="Обновить" />
          {hasVersionMismatch && configVersion && instanceVersion && (
            <Tooltip title={`Версия конфигурации: ${configVersion}\nВерсия экземпляра: ${instanceVersion}`}>
              <Button.Icon size="sm" view="secondary" icon={<Icon.WarningFill />} aria-label="Несовпадение версий" />
            </Tooltip>
          )}
          <Button.Icon size="sm" view="secondary" icon={<Icon.MenuKebab />} aria-label="Действия" />
        </div>
      );
    },
  },
];

const configurationActionsCellProps = {
  align: 'right' as const,
  className: styles.actionsBodyCell,
  style: { textAlign: 'right' as const },
};

const configurationActionsHeaderProps = {
  align: 'right' as const,
  className: styles.actionsHeaderCell,
  style: { textAlign: 'right' as const },
};

const InstancesCountLink = ({ cell }: { cell: DataGridCell<ArchiveConfigView, unknown> }) => {
  const [onChangeTableViewFn, applyFilters] = useUnit([onChangeTableView, onApplyArchiveFilters]);
  const instancesCount = cell.getValue<number>();

  // клик по числу экземпляров - дрилл-даун на вкладку Экземпляры. Применяем фильтр по имени конфигурации
  // через общий стор: URL обновится сам (ссылку можно расшарить), а серверная фильтрация конфигов
  // оставит в выдаче только инстансы этой конфигурации
  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    applyFilters([{ field: 'name', op: 'eq', values: [cell.row.original.configuration] }]);
    onChangeTableViewFn(SEGMENT_INSTANCES);
  };

  return (
    <Link className={styles.instancesLink} onClick={handleClick}>
      {instancesCount}
    </Link>
  );
};

export const archiveConfigurationColumns: DataGridColumnDef<ArchiveConfigView>[] = [
  {
    accessorKey: 'configuration',
    header: 'Конфигурация',
    Header: createColumnHeaderFilter('Конфигурация', 'name'),
    tableHeadCellProps: filterColumnHeadCellProps,
    size: 220,
    minSize: 140,
    Cell: ({ cell }) => (
      <Text kind="bodyS" className={styles.configurationCell}>
        {cell.getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: 'projectKey',
    header: 'Ключ проекта',
    Header: createColumnHeaderFilter('Ключ проекта', 'project'),
    tableHeadCellProps: filterColumnHeadCellProps,
    size: 120,
    Cell: ({ cell }) => <Text kind="bodyS">{cell.getValue<string>()}</Text>,
  },
  {
    accessorKey: 'instancesCount',
    header: 'Экземпляры',
    size: 110,
    Cell: InstancesCountLink,
  },
  {
    accessorKey: 'maxWriteSpeed',
    header: 'Макс. скорость записи',
    size: 150,
    Cell: ({ cell }) => <Text kind="bodyS">{formatSpeed(cell.getValue<number>())}</Text>,
  },
  {
    accessorKey: 'maxIndexSize',
    header: 'Макс. размер индекса',
    size: 140,
    Cell: ({ cell }) => <Text kind="bodyS">{formatBytes(cell.getValue<number>())}</Text>,
  },
  {
    accessorKey: 'maxRetention',
    header: 'Макс. время хранения данных',
    size: 180,
    Cell: ({ cell }) => <Text kind="bodyS">{formatRetention(cell.getValue<number | null>())}</Text>,
  },
  {
    accessorKey: 'labels',
    header: 'Метки',
    Header: createColumnHeaderFilter('Метки', 'label'),
    tableHeadCellProps: filterColumnHeadCellProps,
    size: 200,
    minSize: 120,
    Cell: ({ row }) => <LabelsCell row={row.original} />,
    tableBodyCellProps: {
      style: { textOverflow: 'unset', overflow: 'visible', whiteSpace: 'normal' },
    },
  },
  {
    id: 'actions',
    header: 'Действия',
    size: 90,
    minSize: 80,
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
    Header: () => <span className={styles.actionsHeaderLabel}>Действия</span>,
    tableHeadCellProps: configurationActionsHeaderProps,
    tableBodyCellProps: configurationActionsCellProps,
    Cell: ({ row }) => (
      <div className={styles.actionsCell}>
        <ConfigurationActionsCell row={row.original} />
      </div>
    ),
  },
];
