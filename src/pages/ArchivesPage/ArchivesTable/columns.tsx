import { Button, Icon, Link, Tag, Text, Tooltip } from '@sds-eng/base';
import { DataGridCell, DataGridColumnDef } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { useNavigate } from 'react-router';

import { formatBytes } from '@src/Shared/lib/format/formatBytes';
import { formatRetention } from '@src/Shared/lib/format/formatRetention';
import { formatSpeed } from '@src/Shared/lib/format/formatSpeed';

import { ArchiveConfigView, ArchiveInstanceView } from '@src/Entities/Archives/types';

import { $tableView, onChangeTableView } from '@src/Features/TableView/model';

import ConfigurationActionsCell from './ConfigurationActionsCell';
import StatusBadge from './StatusBadge';
import * as styles from './styles.module.css';

export const archiveIndexColumns: DataGridColumnDef<ArchiveInstanceView>[] = [
  {
    accessorKey: 'configName',
    header: 'Конфигурация',
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
  const [onChangeTableViewFn, tableView] = useUnit([onChangeTableView, $tableView]);
  const navigate = useNavigate();
  const instancesCount = cell.getValue<number>();

  return (
    <Link
      className={styles.instancesLink}
      onClick={(event) => {
        event.preventDefault();

        const configName = cell.row.original?.name;
        const filterData = {
          field: 'name',
          op: 'eq',
          values: [configName],
        };
        const jsonString = JSON.stringify(filterData);
        const encodedFilters = encodeURIComponent(jsonString);
        const baseUrl = `/${location.pathname.split('/').at(-1)}`;
        localStorage.setItem('filters', encodedFilters);
        const finalUrl = `${baseUrl}?filters=${encodedFilters}`;

        if (tableView === 'configurations') {
          onChangeTableViewFn('instances');
          navigate(finalUrl);
        }
      }}
    >
      {instancesCount}
    </Link>
  );
};

export const archiveConfigurationColumns: DataGridColumnDef<ArchiveConfigView>[] = [
  {
    accessorKey: 'configuration',
    header: 'Конфигурация',
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
    size: 200,
    minSize: 120,
    Cell: ({ cell }) => {
      const labels = cell.getValue<string[]>();
      return (
        <div className={styles.labelsCell}>
          {labels?.map((label) => (
            <Tag key={label} as="span" className={styles.labelTag}>
              {label}
            </Tag>
          ))}
        </div>
      );
    },
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
