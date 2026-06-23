import { useMemo } from 'react';

export enum TimeUnit {
  Seconds = 'секунды',
  Minutes = 'минуты',
  Hours = 'часы',
  Days = 'дни',
  Months = 'месяцы',
}

export const TimeLabels: Record<TimeUnit, string> = {
  [TimeUnit.Seconds]: 'секунд',
  [TimeUnit.Minutes]: 'минут',
  [TimeUnit.Hours]: 'часов',
  [TimeUnit.Days]: 'днeй',
  [TimeUnit.Months]: 'месяцев',
};

const TimeThresholds: Array<{ unit: TimeUnit; seconds: number }> = [
  { unit: TimeUnit.Months, seconds: 2592000 }, // ~30 дней
  { unit: TimeUnit.Days, seconds: 86400 },
  { unit: TimeUnit.Hours, seconds: 3600 },
  { unit: TimeUnit.Minutes, seconds: 60 },
  { unit: TimeUnit.Seconds, seconds: 1 },
];

export type TimeDisplayValue = {
  value: number;
  unit: TimeUnit;
  label: string;
  formatted: string;
};

/**
 * Преобразует количество секунд в удобочитаемое значение с подходящей единицей времени (с дробной частью)
 * @param seconds - количество секунд (число)
 * @param decimals - количество знаков после запятой (по умолчанию 2)
 * @returns объект с value, unit, label и formatted строкой
 */
export function computeTimeDisplayValue(seconds: number | null | undefined, decimals: number = 3): TimeDisplayValue {
  if (!seconds || seconds < 0) {
    return {
      value: 0,
      unit: TimeUnit.Seconds,
      label: TimeLabels[TimeUnit.Seconds],
      formatted: `0 ${TimeLabels[TimeUnit.Seconds]}`,
    };
  }

  for (const { unit, seconds: threshold } of TimeThresholds) {
    if (seconds >= threshold) {
      const value = parseFloat((seconds / threshold).toFixed(decimals));
      return {
        value,
        unit,
        label: TimeLabels[unit],
        formatted: `${value} ${TimeLabels[unit]}`,
      };
    }
  }

  // fallback для очень малых значений
  const value = parseFloat(seconds.toFixed(decimals));
  return {
    value,
    unit: TimeUnit.Seconds,
    label: TimeLabels[TimeUnit.Seconds],
    formatted: `${value} ${TimeLabels[TimeUnit.Seconds]}`,
  };
}

export function timeDisplayValueToSeconds(displayValue: TimeDisplayValue): number {
  if (!displayValue || typeof displayValue.value !== 'number') {
    return 0;
  }

  const { value, unit } = displayValue;

  switch (unit) {
    case TimeUnit.Seconds:
      return value;
    case TimeUnit.Minutes:
      return value * 60;
    case TimeUnit.Hours:
      return value * 3600;
    case TimeUnit.Days:
      return value * 86400;
    case TimeUnit.Months:
      return value * 2592000; // приблизительно (30 дней)
    default:
      console.warn(`Неизвестная единица времени: ${unit}`);
      return 0;
  }
}

/**
 * Преобразует количество секунд в значение, соответствующее указанной единице измерения
 * @param seconds - количество секунд
 * @param unit - целевая единица измерения времени
 * @param decimals - количество знаков после запятой (по умолчанию 5)
 * @returns дробное число — значение в указанной единице
 */
export const convertSecondsToUnitValue = (seconds: number, unit: TimeUnit, decimals: number = 5): number => {
  let value = 0;

  switch (unit) {
    case TimeUnit.Seconds:
      value = seconds;
      break;
    case TimeUnit.Minutes:
      value = seconds / 60;
      break;
    case TimeUnit.Hours:
      value = seconds / 3600;
      break;
    case TimeUnit.Days:
      value = seconds / 86400;
      break;
    case TimeUnit.Months:
      value = seconds / 2592000; // ~30 дней
      break;
    default:
      value = seconds;
  }

  const roundedValue = parseFloat(value.toFixed(decimals));

  const minValue = parseFloat((1 / Math.pow(10, decimals)).toFixed(decimals));

  return roundedValue === 0 && seconds > 0 ? minValue : Math.max(0, roundedValue);
};

interface Option {
  value: TimeUnit;
  label: string;
}

export const useTimeUnitOptions = (): Option[] => {
  return useMemo(
    () =>
      Object.entries(TimeUnit).map(([key, unit]) => ({
        value: unit,
        label: TimeLabels[unit],
      })),
    [],
  );
};
