import { useMemo } from 'react';

export enum SpeedUnit {
  Bps = 'Bps',
  Kbps = 'Kbps',
  Mbps = 'Mbps',
  Gbps = 'Gbps',
  Tbps = 'Tbps',
}

export const SpeedLabels: Record<SpeedUnit, string> = {
  [SpeedUnit.Bps]: 'B/s',
  [SpeedUnit.Kbps]: 'KB/s',
  [SpeedUnit.Mbps]: 'Mb/s',
  [SpeedUnit.Gbps]: 'GB/s',
  [SpeedUnit.Tbps]: 'TB/s',
};

const SpeedThresholds: Array<{ unit: SpeedUnit; seconds: number }> = [
  { unit: SpeedUnit.Tbps, seconds: 1024 * 1024 * 1024 * 1024 }, // 1 TiB
  { unit: SpeedUnit.Gbps, seconds: 1024 * 1024 * 1024 },
  { unit: SpeedUnit.Mbps, seconds: 1024 * 1024 },
  { unit: SpeedUnit.Kbps, seconds: 1024 },
  { unit: SpeedUnit.Bps, seconds: 1 },
];

export type SpeedDisplayValue = {
  value: number;
  unit: SpeedUnit;
  label: string;
  formatted: string;
};

/**
 * Преобразует скорость в bps в удобочитаемое значение с подходящей единицей скорости (с дробной частью)
 * @param bytesPerSecond - количество байт в секунду (число)
 * @param decimals - количество знаков после запятой (по умолчанию 2)
 * @returns объект с value, unit, label и formatted строкой
 */
export function computeSpeedDisplayValue(bytesPerSecond: number | null | undefined, decimals: number = 3): SpeedDisplayValue {
  if (!bytesPerSecond || bytesPerSecond < 0) {
    return {
      value: 0,
      unit: SpeedUnit.Bps,
      label: SpeedLabels[SpeedUnit.Bps],
      formatted: `0 ${SpeedLabels[SpeedUnit.Bps]}`,
    };
  }

  for (const { unit, seconds: threshold } of SpeedThresholds) {
    if (bytesPerSecond >= threshold) {
      const value = parseFloat((bytesPerSecond / threshold).toFixed(decimals));
      return {
        value,
        unit,
        label: SpeedLabels[unit],
        formatted: `${value} ${SpeedLabels[unit]}`,
      };
    }
  }

  // fallback для очень малых значений
  const value = parseFloat(bytesPerSecond.toFixed(decimals));
  return {
    value,
    unit: SpeedUnit.Bps,
    label: SpeedLabels[SpeedUnit.Bps],
    formatted: `${value} ${SpeedLabels[SpeedUnit.Bps]}`,
  };
}

export function speedDisplayValueToBytesPerSec(displayValue: SpeedDisplayValue): number {
  if (!displayValue || typeof displayValue.value !== 'number') {
    return 0;
  }

  const { value, unit } = displayValue;

  switch (unit) {
    case SpeedUnit.Bps:
      return value;
    case SpeedUnit.Kbps:
      return value * 1024;
    case SpeedUnit.Mbps:
      return value * 1024 * 1024;
    case SpeedUnit.Gbps:
      return value * 1024 * 1024 * 1024;
    case SpeedUnit.Tbps:
      return value * 1024 * 1024 * 1024 * 1024;
    default:
      console.warn(`Неизвестная единица размера: ${unit}`);
      return 0;
  }
}

/**
 * Преобразует количество байт в значение, соответствующее указанной единице измерения
 * @param bytes - количество секунд
 * @param unit - целевая единица измерения скорости
 * @param decimals - количество знаков после запятой (по умолчанию 5)
 * @returns дробное число — значение в указанной единице
 */
export const convertBytesPerSecToUnitValue = (bytes: number, unit: SpeedUnit, decimals: number = 5): number => {
  let value = 0;

  switch (unit) {
    case SpeedUnit.Bps:
      value = bytes;
      break;
    case SpeedUnit.Kbps:
      value = bytes / 1024;
      break;
    case SpeedUnit.Mbps:
      value = bytes / (1024 * 1024);
      break;
    case SpeedUnit.Gbps:
      value = bytes / (1024 * 1024 * 1024);
      break;
    case SpeedUnit.Tbps:
      value = bytes / (1024 * 1024 * 1024 * 1024);
      break;
    default:
      value = bytes;
  }

  const roundedValue = parseFloat(value.toFixed(decimals));

  const minValue = parseFloat((1 / Math.pow(10, decimals)).toFixed(decimals));

  return roundedValue === 0 && bytes > 0 ? minValue : Math.max(0, roundedValue);
};

interface Option {
  value: SpeedUnit;
  label: string;
}

export const useSpeedUnitOptions = (): Option[] => {
  return useMemo(
    () =>
      Object.entries(SpeedUnit).map(([key, unit]) => ({
        value: unit,
        label: SpeedLabels[unit],
      })),
    [],
  );
};
