import moment from 'moment';

import { IHealthCheckSelection, IHealthChecks } from '../../../store/config/Types';

const SERVICE_LABELS: Record<string, string> = {
  ARCHIVE: 'Archive',
  AUTZ_POLICY_SERVICE: 'Autz Policy Service',
  FLOW: 'Flow',
  FULLTEXT: 'Fulltext',
  TRACE_QUERY: 'Trace Query',
  MONITORING: 'Monitoring',
  PVM_SECURITY: 'PVM Security',
  KAFKA: 'Kafka',
  PVM_BASE: 'PVM Base',
};

const ZONE_LABELS: Record<string, string> = {
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary',
};

const SOURCE_LABELS: Record<string, string> = {
  AUTO: 'Auto',
  USER: 'User',
};

export function getHealthCheckRowId(item: Pick<IHealthChecks, 'service' | 'zone'>) {
  return `${item.service}:${item.zone}`;
}

export function formatServiceLabel(service: string) {
  return SERVICE_LABELS[service] || service;
}

export function formatZoneLabel(zone: string) {
  return ZONE_LABELS[zone] || zone;
}

export function formatSourceLabel(source: string) {
  return SOURCE_LABELS[source] || source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
}

export function formatAuthorLabel(author: string) {
  if (!author) return '';
  return author.charAt(0).toUpperCase() + author.slice(1);
}

export function formatUpdatedAt(updatedAt: string) {
  return moment(updatedAt).format('DD.MM HH:mm:ss');
}

function formatDaysLabel(days: number) {
  const mod10 = days % 10;
  const mod100 = days % 100;
  if (mod10 === 1 && mod100 !== 11) return `${days} день`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${days} дня`;
  return `${days} дней`;
}

export function formatTimeInStatus(updatedAt: string) {
  const duration = moment.duration(moment().diff(moment(updatedAt)));
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();

  if (days > 0) {
    return minutes > 0 ? `${formatDaysLabel(days)} ${minutes} мин` : formatDaysLabel(days);
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours} ч ${minutes} мин` : `${hours} ч`;
  }
  return `${minutes} мин`;
}

export function selectionToServiceByZone(selectedRows: IHealthCheckSelection[]) {
  return selectedRows.reduce<Record<string, string[]>>((acc, { service, zone }) => {
    if (!acc[zone]) {
      acc[zone] = [];
    }
    acc[zone].push(service);
    return acc;
  }, {});
}

export function getTextForConfirm(selectedRows: IHealthCheckSelection[], action: string) {
  const act = action === 'OFF' ? 'выключить' : 'включить';
  const groupedByZone = selectionToServiceByZone(selectedRows);
  const parts = Object.entries(groupedByZone).map(
    ([zone, services]) => `в зоне ${formatZoneLabel(zone)} для ${services.map(formatServiceLabel).join(', ')}`,
  );

  return `Вы уверены, что хотите ${act} настройки ${parts.join(' и ')}?`;
}
