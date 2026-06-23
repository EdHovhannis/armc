import { ActionMenuItem } from '@sds-eng/data-grid';
import { FulltextTask } from '@src/store/index/Types';
import moment from 'moment/moment';
import * as React from 'react';

import { FilterDefinition, FilterSelection, FilterSelections, IBackupsFilter, ICollectionStatus, ILastBackupStatus, ITaskStatus } from './types';

export const indexListToFilter = (indexesList: FulltextTask[]) => {
  const filterProjects = [...new Set(indexesList.map((row) => row.project))];
  const filterIndexes = indexesList.reduce(
    (acc, row) => {
      if (!acc[row.project]) acc[row.project] = [];
      if (!acc[row.project].includes(row.name)) acc[row.project].push(row.name);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const filterZones = [...new Set(indexesList.flatMap((row) => (row.instances || []).map((instance) => instance.zoneId)))].sort();

  return {
    filterProjects,
    filterIndexes,
    filterZones,
  };
};

export const timeDifferenceToString = (firstTime: string, secondTime: string, suffix?: string): string => {
  const secondsPassed = Math.floor(Math.abs(new Date(firstTime).getTime() - new Date(secondTime).getTime()) / 1000);

  const days = Math.floor(secondsPassed / 86400);
  const hours = Math.floor((secondsPassed % 86400) / 3600);
  const minutes = Math.floor((secondsPassed % 3600) / 60);
  const seconds = secondsPassed % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} д.`);
  if (hours > 0 || days > 0) parts.push(`${hours} ч.`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes} мин.`);
  parts.push(`${seconds} сек.`);

  return parts.join(' ') + (suffix ? ` ${suffix}` : '');
};

export const getRedirectPath = (path: string, filter: IBackupsFilter) => {
  const params = new URLSearchParams();

  if (filter) {
    if (filter.projectShortName) params.append('projectFilter', filter.projectShortName);
    if (filter.zoneId) params.append('zone', filter.zoneId);
    if (filter.taskName) params.append('indexFilter', filter.taskName);
    if (filter.collection) params.append('collectionsFilter', filter.collection);
  }

  return `${path}?${params.toString()}`;
};

export const renderRowActionMenuItems =
  (actionMenuItems) =>
  ({ row, table, closeMenu }) => {
    if (!table) return [];
    return actionMenuItems(row)
      .filter((item) => item.visible)
      .map((item, idx) => (
        <ActionMenuItem
          key={idx}
          icon={null}
          label={item.label}
          onClick={(row) => {
            item.onClick(row);
            closeMenu();
          }}
          table={table}
        />
      ));
  };

export const BACKUPS_PAGE = {
  index: '/backups/control',
  list: '/backups/list',
  savepoints: '/backups/savepoints',
  tasks: '/backups/tasks',
  incidents: '/backups/incidents',
};

const PROCESSING_STATUSES = ['NEW', 'PROCESSING', 'PROCESSING_YIELD', 'ERR_TEMPORARY'];

export const taskStatusIsInProgress = (status: ITaskStatus): boolean => {
  return PROCESSING_STATUSES.includes(status);
};

export const getCellWithStatusColor = (status: ITaskStatus) => {
  const statusGreen = { color: '#108e26', background: '#1a9e321e', padding: '4px', borderRadius: '2px' };
  const statusBlue = { color: '#0c72b6', background: '#118cdf1e', padding: '4px', borderRadius: '2px' };
  const statusRed = { color: '#e31227', background: '#ff293e1e', padding: '4px', borderRadius: '2px' };
  if (status === 'DONE' || status === 'NEW') {
    return <div style={statusGreen}>{status}</div>;
  } else if (status === 'PROCESSING' || status === 'PROCESSING_YIELD') {
    return <div style={statusBlue}>{status}</div>;
  } else if (status === 'ERR_CONSISTENT' || status === 'ERR_NOT_CONSISTENT' || status === 'ERR_TEMPORARY') {
    return <div style={statusRed}>{status}</div>;
  }
  return <div>{status}</div>;
};

export const getCellWithCorruptedColor = (status: ICollectionStatus) => {
  const statusGreen = { color: '#108e26', background: '#1a9e321e', padding: '4px', borderRadius: '2px' };
  const statusRed = { color: '#e31227', background: '#ff293e1e', padding: '4px', borderRadius: '2px' };
  if (status === 'OK') {
    return <div style={statusGreen}>{status}</div>;
  } else {
    return <div style={statusRed}>{status}</div>;
  }
};

export const getCellWithSubStatusColor = (subStatus: string) => {
  const statusBlue = { color: '#0c72b6', background: '#118cdf1e', padding: '4px', borderRadius: '2px' };
  return <div style={statusBlue}>{subStatus}</div>;
};

export const getCellWithLastBackupColor = (status: ILastBackupStatus, lastBackupDate?: string) => {
  const statusBlue = { color: '#0c72b6', background: '#118cdf1e', padding: '4px', borderRadius: '2px' };
  const statusRed = { color: '#e31227', background: '#ff293e1e', padding: '4px', borderRadius: '2px' };
  if (status === 'OK' && !!lastBackupDate) {
    return moment(lastBackupDate).format('DD.MM.YYYY HH:mm:ss');
  } else if (status === 'NONE' || status === 'FAIL') {
    return <div style={statusRed}>{status}</div>;
  } else if (status === 'IN_PROGRESS') {
    return <div style={statusBlue}>{status}</div>;
  }
  return status;
};

export const findFilterDefinition = (filterDefinitions: FilterDefinition[], key: string): FilterDefinition | undefined => {
  return filterDefinitions.find((def) => def.key === key);
};

export const findFilterSelection = (filterSelections: FilterSelections, key: string): FilterSelection | undefined => {
  return filterSelections.find((def) => def.key === key);
};
