import { RETENTION_UNIT_OPTIONS } from '@src/Shared/constants/options';

export const formatRetention = (seconds: number | null): string => {
  if (seconds === null) {
    return '—';
  }

  // опции отсортированы по убыванию, последняя ('сек', limit 1) - и наименьшая единица, и fallback для seconds < 1
  const unit = RETENTION_UNIT_OPTIONS.find(({ limit }) => seconds >= limit) ?? RETENTION_UNIT_OPTIONS[RETENTION_UNIT_OPTIONS.length - 1];

  return unit ? `${Math.round(seconds / unit.limit)} ${unit.label}` : '—';
};
