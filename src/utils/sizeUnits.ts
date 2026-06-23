import { useMemo } from 'react';

export enum SizeUnit {
  Byte = 'Byte',
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
  TB = 'TB',
}

export const SizeLabels: Record<SizeUnit, string> = {
  [SizeUnit.Byte]: 'Bytes',
  [SizeUnit.KB]: 'KiB',
  [SizeUnit.MB]: 'MiB',
  [SizeUnit.GB]: 'GiB',
  [SizeUnit.TB]: 'TiB',
};

const SizeThresholds: Array<{ unit: SizeUnit; seconds: number }> = [
  { unit: SizeUnit.TB, seconds: 1024 * 1024 * 1024 * 1024 }, // 1 TiB
  { unit: SizeUnit.GB, seconds: 1024 * 1024 * 1024 },
  { unit: SizeUnit.MB, seconds: 1024 * 1024 },
  { unit: SizeUnit.KB, seconds: 1024 },
  { unit: SizeUnit.Byte, seconds: 1 },
];

export type SizeDisplayValue = {
  value: number;
  unit: SizeUnit;
  label: string;
  formatted: string;
};

/**
 * Преобразует количество байт в удобочитаемое значение с подходящей единицей размера (с дробной частью)
 * @param bytes - количество байт (число)
 * @param decimals - количество знаков после запятой (по умолчанию 2)
 * @returns объект с value, unit, label и formatted строкой
 */
export function computeSizeDisplayValue(bytes: number | null | undefined, decimals: number = 3): SizeDisplayValue {
  if (!bytes || bytes < 0) {
    return {
      value: 0,
      unit: SizeUnit.Byte,
      label: SizeLabels[SizeUnit.Byte],
      formatted: `0 ${SizeLabels[SizeUnit.Byte]}`,
    };
  }

  for (const { unit, seconds: threshold } of SizeThresholds) {
    if (bytes >= threshold) {
      const formattedValue = parseFloat((bytes / threshold).toFixed(decimals));
      const formatted = `${formattedValue} ${SizeLabels[unit]}`;

      if (bytes % threshold === 0) {
        return {
          value: bytes / threshold,
          unit,
          label: SizeLabels[unit],
          formatted,
        };
      } else {
        return {
          value: bytes,
          unit: SizeUnit.Byte,
          label: SizeLabels[SizeUnit.Byte],
          formatted,
        };
      }
    }
  }

  const value = parseFloat(bytes.toFixed(decimals));
  return {
    value,
    unit: SizeUnit.Byte,
    label: SizeLabels[SizeUnit.Byte],
    formatted: `${value} ${SizeLabels[SizeUnit.Byte]}`,
  };
}

export function sizeDisplayValueToBytes(displayValue: SizeDisplayValue): number {
  if (!displayValue || typeof displayValue.value !== 'number') {
    return 0;
  }

  const { value, unit } = displayValue;

  switch (unit) {
    case SizeUnit.Byte:
      return value;
    case SizeUnit.KB:
      return value * 1024;
    case SizeUnit.MB:
      return value * 1024 * 1024;
    case SizeUnit.GB:
      return value * 1024 * 1024 * 1024;
    case SizeUnit.TB:
      return value * 1024 * 1024 * 1024 * 1024;
    default:
      console.warn(`Неизвестная единица размера: ${unit}`);
      return 0;
  }
}

/**
 * Преобразует количество байт в значение, соответствующее указанной единице измерения
 * @param bytes - количество байт
 * @param unit - целевая единица измерения размера
 * @param decimals - количество знаков после запятой (по умолчанию 5)
 * @returns дробное число — значение в указанной единице
 */
export const convertBytesToUnitValue = (bytes: number, unit: SizeUnit, decimals: number = 5): number => {
  let value: number;

  switch (unit) {
    case SizeUnit.Byte:
      value = bytes;
      break;
    case SizeUnit.KB:
      value = bytes / 1024;
      break;
    case SizeUnit.MB:
      value = bytes / (1024 * 1024);
      break;
    case SizeUnit.GB:
      value = bytes / (1024 * 1024 * 1024);
      break;
    case SizeUnit.TB:
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
  value: SizeUnit;
  label: string;
}

export const useSizeUnitOptions = (): Option[] => {
  return useMemo(
    () =>
      Object.entries(SizeUnit).map(([, unit]) => ({
        value: unit,
        label: SizeLabels[unit],
      })),
    [],
  );
};
