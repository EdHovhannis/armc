import * as React from 'react';

import { SchemaIndex } from '../../components/index/CreateIndexPage';
import { FulltextFlowEstimateResponse } from '../../components/shared';
import { EstimatedIndexQuota, IndexQuota } from '../../store/index/Types';
import { Pipeline, PipelineInputFormatListEnum, SourcesPipeline, TypePrimaryField } from '../../store/pipeline/Types';

export interface Item {
  value: number;
  unit: string;
}

export default class IndexProvider extends React.Component<any, any> {
  static getEmptyPipeline(): Pipeline {
    return {
      name: '',
      projectShortName: '',
      sources: this.getEmptySource(),
      processing: {},
      schema: {
        fields: [],
        primaryTimeField: {
          type: TypePrimaryField.AUTOGENERATE,
        },
      },
      quota: {
        maxDataRateBytesPerSec: 0,
        maxSizeBytes: 0,
        maxStorageTimeSec: 0,
      },
      replicationFactor: 2,
      recoveryStrategy: 'REPLICATION_FACTOR',
      labels: undefined,
    };
  }

  static getEmptyAutoSchema(): SchemaIndex {
    return {
      allFields: [],
      timestampFields: [],
    };
  }

  static getEmptyEstimatedIndexQuota(): EstimatedIndexQuota {
    return {
      currentQuota: this.getEmptyIndexQuota(),
      plannedRate: 0,
      plannedVolume: 0,
      approximatedStoreTimeSec: 0,
      approximatedRealIndexSizeBytes: 0,
      quotaAllowed: true,
    };
  }

  static getEmptySource(): SourcesPipeline {
    return {
      kafka: [
        {
          projectShortName: '',
          topicName: '',
        },
      ],
      format: {
        type: PipelineInputFormatListEnum.JSON,
        schemaName: null,
      },
    };
  }

  static getEmptyIndexQuota(): IndexQuota {
    return {
      projectShortName: '',
      currentRate: 0,
      currentVolume: 0,
      maxRate: 0,
      maxVolume: 0,
    };
  }

  static getEmptyQuota(): FulltextFlowEstimateResponse {
    return {
      request: {
        maxDataRateBytesPerSec: 1048576,
        maxSizeBytes: 1,
        maxStoreDurationSec: 1,
        replicationFactor: 1,
        sources: {
          kafka: [],
        },
      },
      configuration: {
        maxShardSizeBytes: 0,
        maxDataRateBytesPerSecPerShard: 0,
        indexPartitionRatio: 0,
        indexFillingRatio: 0,
        indexSizeCorrectionRatio: 0,
        avgToMaxIndexSpeedRatio: 0,
        minAllowedRotationIntervalSec: 0,
        maxOverdraftPercent: 0,
        maxThreadDataRateBytesPerSec: 0,
      },
      taskSlots: 0,
      avgBytesPerTaskSlot: 0,
      minAllowedMaxSizeBytes: 0,
      partitionToSlotsRatio: 0,
      quota: {
        currentQuota: {
          projectShortName: '',
          maxSizeBytes: 1,
          currentSizeBytes: 0,
          maxDataRateBytesPerSec: 1048576,
          currentDataRateBytesPerSec: 0,
        },
        plannedDataRateBytesPerSec: 0,
        plannedSizeBytes: 0,
        approximatedStoreTimeSec: 0,
        approximatedRealIndexSizeBytes: 0,
        quotaAllowed: true,
      },
      numShards: 0,
      estimatedCollSizeBytes: 0,
      minRotationTimeSec: 0,
      dataRateMaxPercent: 0,
      maxSizeBytes: 0,
      maxStoreDurationSec: 0,
      warnings: [],
      blockers: [],
    };
  }

  static calculateMs(value: number): number {
    return value * 24 * 60 * 60 * 1000;
  }

  static calculateDelimiterFromBytesCeil(value: number): Item {
    const valueItem: Item = {
      value: 0,
      unit: 'B',
    };
    if (value === 0) return valueItem;
    if (value < 1024) {
      valueItem.value = value;
      valueItem.unit = 'B';
    } else if (value < Math.pow(1024, 2)) {
      valueItem.value = Math.ceil(value / 1024);
      valueItem.unit = 'KB';
    } else if (value < Math.pow(1024, 3)) {
      valueItem.value = Math.ceil(value / Math.pow(1024, 2));
      valueItem.unit = 'MB';
    } else if (value > Math.pow(1024, 3) && value < Math.pow(1024, 4)) {
      valueItem.value = Math.round(value / Math.pow(1024, 2));
      valueItem.unit = 'MB';
    } else if (value < Math.pow(1024, 4)) {
      valueItem.value = Math.ceil(value / Math.pow(1024, 3));
      valueItem.unit = 'GB';
    } else if (!isNaN(value)) {
      valueItem.value = Math.ceil(value / Math.pow(1024, 4));
      valueItem.unit = 'TB';
    }
    return valueItem;
  }

  static calculateDelimiterFromBytes(value: number, defaultMb?: boolean): Item {
    const valueItem: Item = {
      value: 0,
      unit: defaultMb ? 'MB' : 'B',
    };

    if (value === 0) return valueItem;
    if (value < 1024) {
      valueItem.value = value;
      valueItem.unit = 'B';
    } else if (value < Math.pow(1024, 2)) {
      valueItem.value = Math.round(value / 1024);
      valueItem.unit = 'KB';
    } else if (value < Math.pow(1024, 3)) {
      valueItem.value = Math.round(value / Math.pow(1024, 2));
      valueItem.unit = 'MB';
    } else if (value > Math.pow(1024, 3) && value < Math.pow(1024, 4)) {
      valueItem.value = Math.round(value / Math.pow(1024, 2));
      valueItem.unit = 'MB';
    } else if (value < Math.pow(1024, 4)) {
      valueItem.value = Math.round(value / Math.pow(1024, 3));
      valueItem.unit = 'GB';
    } else if (!isNaN(value)) {
      valueItem.value = Math.round(value / Math.pow(1024, 4));
      valueItem.unit = 'TB';
    }
    return valueItem;
  }

  static calculateDelimiterFromBytesInMb(value: number): Item {
    const valueItem: Item = {
      value: 0,
      unit: 'MB',
    };
    if (value === 0) return valueItem;
    if (value <= Math.pow(1024, 2)) {
      valueItem.value = 1;
      valueItem.unit = 'MB';
    } else if (value > Math.pow(1024, 2) && value < Math.pow(1024, 4)) {
      valueItem.value = Math.round(value / Math.pow(1024, 2));
      valueItem.unit = 'MB';
    } else if (value < Math.pow(1024, 4)) {
      valueItem.value = Math.round(value / Math.pow(1024, 3));
      valueItem.unit = 'GB';
    } else if (!isNaN(value)) {
      valueItem.value = Math.round(value / Math.pow(1024, 4));
      valueItem.unit = 'TB';
    }
    return valueItem;
  }

  static calculateDelimiterFromTimeSeconds(retentionTimeSec: number): Item {
    const timeItem: Item = {
      value: 0,
      unit: 'секунды',
    };

    if (retentionTimeSec === 0 || isNaN(retentionTimeSec)) {
      return timeItem;
    }
    if (retentionTimeSec < 60) {
      timeItem.value = retentionTimeSec;
    } else if (retentionTimeSec < 3600) {
      timeItem.value = Math.round(retentionTimeSec / 60);
      timeItem.unit = 'минуты';
    } else if (retentionTimeSec < 86400) {
      timeItem.value = Math.round(retentionTimeSec / 3600);
      timeItem.unit = 'часы';
    } else if (retentionTimeSec < 2592000) {
      timeItem.value = Math.round(retentionTimeSec / 86400);
      timeItem.unit = 'дни';
    } else {
      timeItem.value = Math.round(retentionTimeSec / 2592000);
      timeItem.unit = 'месяцы';
    }

    return timeItem;
  }

  static calculateBytesByDelimeter(value: number, valueUnit: string) {
    switch (valueUnit) {
      case 'TB':
        value *= 1024 * 1024 * 1024 * 1024;
        break;
      case 'GB':
        value *= 1024 * 1024 * 1024;
        break;
      case 'MB':
        value *= 1024 * 1024;
        break;
      case 'KB':
        value *= 1024;
        break;
      case 'B':
        value *= 1;
    }
    return value;
  }

  static calculateTimeInSec(time: number | null, timeUnit: string) {
    let timeInSec = 0;
    if (!time) return null;
    if (time < 0) return 0;

    switch (timeUnit) {
      case 'месяцы':
        timeInSec = time * 30 * 24 * 60 * 60;
        break;
      case 'дни':
        timeInSec = time * 24 * 60 * 60;
        break;
      case 'часы':
        timeInSec = time * 60 * 60;
        break;
      case 'минуты':
        timeInSec = time * 60;
        break;
      case 'секунды':
        timeInSec = time;
        break;
    }
    return timeInSec;
  }

  static getNounDay(number: number, one: string, two: string, five: string) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
      return five;
    }
    n %= 10;
    if (n === 1) {
      return one;
    }
    if (n >= 2 && n <= 4) {
      return two;
    }
    return five;
  }

  /**
   * Рассчитывает скорость, конвертируя значение в подходящую единицу (B, KB, MB),
   * только если оно кратно текущей мере.
   * @param value - Исходное значение (в неизвестной мере).
   * @param maxUnit - Опциональный аргумент для ограничения максимальной единицы измерения. Допустимые значения: "B", "KB", "MB".
   * @returns Объект с значением и единицей измерения.
   */
  public static calculateSpeed(value: number, maxUnit?: string): Item {
    const units = ['B', 'KB', 'MB'];
    const delimiter = 1024;
    let currentValue = value;
    let index = 0;

    // Если передан maxUnit, определяем его индекс
    const maxIndex = maxUnit ? units.indexOf(maxUnit) : units.length - 1;

    while (currentValue >= delimiter && index < maxIndex) {
      if (currentValue % delimiter === 0) {
        currentValue /= delimiter;
        index++;
      } else {
        break;
      }
    }

    return {
      value: currentValue,
      unit: units[index],
    };
  }

  /**
   * Рассчитывает размер, конвертируя значение в подходящую единицу (MB, GB, TB),
   * только если оно кратно текущей мере.
   * @param value - Исходное значение (в неизвестной мере).
   * @param maxUnit - Опциональный аргумент для ограничения максимальной единицы измерения. Допустимые значения: "MB", "GB", "TB".
   * @returns Объект с значением и единицей измерения.
   */
  public static calculateSize(value: number, maxUnit?: string): Item {
    const units = ['MB', 'GB', 'TB'];
    const delimiter = 1024;
    let currentValue = Math.round(value / (1024 * 1024)); // Начинаем с MB
    let index = 0;

    // Если передан maxUnit, определяем его индекс
    const maxIndex = maxUnit ? units.indexOf(maxUnit) : units.length - 1;

    while (currentValue >= delimiter && index < maxIndex) {
      if (currentValue % delimiter === 0) {
        currentValue /= delimiter;
        index++;
      } else {
        break;
      }
    }

    // Если значение > 0, но меньше 1 MB — возвращаем 1 MB
    if (value > 0 && currentValue < 1) {
      return { value: 1, unit: 'MB' };
    }

    return {
      value: currentValue,
      unit: units[index],
    };
  }

  /**
   * Возвращает значение в конвертируемой мере времени и саму меру (секунды, минуты, часы, дни, месяцы),
   * только если исходное значение (в секундах) кратно текущей мере.
   * @param seconds - Исходное значение в секундах.
   * @param maxUnit - Опциональный аргумент для ограничения максимальной единицы измерения. Допустимые значения: "секунды", "минуты", "часы", "дни", "месяцы".
   * @returns Объект с значением и единицей измерения.
   */
  public static calculateTime(seconds: number, maxUnit?: string): Item {
    const units = ['секунды', 'минуты', 'часы', 'дни', 'месяцы'];
    const delimiters = [60, 60, 24, 30];
    let currentValue = seconds;
    let index = 0;

    // Если передан maxUnit, определяем его индекс
    const maxIndex = maxUnit ? units.indexOf(maxUnit) : units.length - 1;

    while (index < delimiters.length && index <= maxIndex) {
      const delimiter = delimiters[index];

      // Если текущая единица — максимальная, останавливаемся
      if (index === maxIndex) {
        break;
      }

      if (currentValue % delimiter === 0) {
        currentValue /= delimiter;
        index++;
      } else {
        break;
      }
    }

    return {
      value: currentValue,
      unit: units[index],
    };
  }

  /**
   * Рассчитывает скорость, конвертируя значение в подходящую единицу
   */
  public static convertBytesToUnit(value: number, maxUnit: string): number {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const delimiter = 1024;
    let currentValue = value;
    let index = 0;

    const maxIndex = units.indexOf(maxUnit);

    while (index < maxIndex) {
      currentValue /= delimiter;
      index += 1;
    }

    currentValue = this.formatValue(currentValue, value);

    return currentValue;
  }

  /**
   * Конвертирует значение в секундах в подходящую единицу времени (секунды, минуты, часы, дни, месяцы),
   */
  public static convertTimeToUnit(seconds: number, maxUnit: string): number {
    const units = ['секунды', 'минуты', 'часы', 'дни', 'месяцы'];
    const delimiters = [60, 60, 24, 30];
    let currentValue = seconds;
    let index = 0;

    const maxIndex = units.indexOf(maxUnit);

    while (index < delimiters.length && index < maxIndex) {
      const delimiter = delimiters[index];
      currentValue /= delimiter;
      index += 1;
    }

    return this.formatValue(currentValue, seconds);
  }

  /**
   * Форматирует число: убирает лишние нули после запятой.
   */
  private static formatValue(value: number, originalValue: number): number {
    // Устанавливаем минимальное значение 0.001, если value > 0
    if (originalValue > 0 && value < 0.001) {
      return 0.001;
    }

    // Если число целое — возвращаем как есть
    if (value === Math.floor(value)) {
      return value;
    }

    // Округляем до 3 знаков после запятой
    const rounded = parseFloat(value.toFixed(3));

    // Удаляем лишние нули после запятой
    const formatted = Number.isInteger(rounded) ? rounded : parseFloat(rounded.toFixed(3));

    return formatted;
  }
}
