import { Button, Icon, Link, Tag, Text, Tooltip } from '@sds-eng/base';
import { DataGridColumnDef } from '@sds-eng/data-grid';

import { ArchiveConfigView, ArchiveInstanceView } from '@src/Entities/Archives/types';

import StatusBadge from './StatusBadge';
import * as styles from './styles.module.css';

const BYTE_UNITS = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ'];

const formatBytes = (bytes: number): string => {
  if (!bytes) {
    return '0 Б';
  }

  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);

  return `${Math.round(bytes / 1024 ** exponent)} ${BYTE_UNITS[exponent]}`;
};

const formatSpeed = (bytesPerSec: number): string => {
  if (!bytesPerSec) {
    return '0 Б/с';
  }

  const exponent = Math.min(Math.floor(Math.log(bytesPerSec) / Math.log(1024)), BYTE_UNITS.length - 1);

  return `${Math.round(bytesPerSec / 1024 ** exponent)} ${BYTE_UNITS[exponent]}/с`;
};

const SECONDS_UNIT = { limit: 1, label: 'сек' };

const RETENTION_UNITS = [
  { limit: 86_400, label: 'дн.' },
  { limit: 3_600, label: 'ч' },
  { limit: 60, label: 'мин' },
  SECONDS_UNIT,
];

const formatRetention = (seconds: number | null): string => {
  if (seconds == null) {
    return '—';
  }

  const unit = RETENTION_UNITS.find(({ limit }) => seconds >= limit) ?? SECONDS_UNIT;

  return `${Math.round(seconds / unit.limit)} ${unit.label}`;
};

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
    Cell: ({ cell }) => (
      <Link href="#" className={styles.instancesLink} onClick={(event) => event.preventDefault()}>
        {cell.getValue<number>()}
      </Link>
    ),
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
    Cell: () => (
      <div className={styles.actionsCell}>
        <Button.Icon size="sm" view="secondary" icon={<Icon.MenuKebab />} aria-label="Действия" />
      </div>
    ),
  },
];
