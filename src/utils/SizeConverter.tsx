import IndexProvider, { Item } from '../containers/index/IndexProvider';

export interface Size {
  tb: number;
  gb: number;
  mb: number;
  kb: number;
  b: number;
}

export interface SizeWithMultiplier {
  size: number;
  multiplier: string;
}

export const multipliers = {
  tb: Math.pow(1024, 4),
  gb: Math.pow(1024, 3),
  mb: Math.pow(1024, 2),
  kb: Math.pow(1024, 1),
  b: 1,
};

export const TIME_UNITS_MAP = {
  years: 'годы',
  month: 'месяцы',
  weeks: 'недели',
  days: 'дни',
  hours: 'часы',
  min: 'минуты',
  sec: 'секунды',
};

export interface Time {
  years: number;
  month: number;
  weeks: number;
  days: number;
  hours: number;
  min: number;
  sec: number;
}

export const timeMultiplier = {
  years: 3600 * 24 * 365,
  month: 3600 * 24 * 30,
  weeks: 3600 * 24 * 7,
  days: 3600 * 24,
  hours: 3600,
  min: 60,
  sec: 1,
};

export default class SizeConverter {
  static convertBytes = (bytes: number): Size => {
    return {
      tb: Math.floor(bytes / multipliers.tb),
      gb: Math.floor((bytes % multipliers.tb) / multipliers.gb),
      mb: Math.floor((bytes % multipliers.gb) / multipliers.mb),
      kb: Math.floor((bytes % multipliers.mb) / multipliers.kb),
      b: bytes % multipliers.kb,
    } as Size;
  };

  static convertSeconds = (seconds: number): Time => {
    return {
      years: Math.floor(seconds / timeMultiplier.years),
      month: Math.floor(seconds / timeMultiplier.month),
      weeks: Math.floor(seconds / timeMultiplier.weeks),
      days: Math.floor(seconds / timeMultiplier.days),
      hours: Math.floor((seconds % timeMultiplier.days) / timeMultiplier.hours),
      min: Math.floor((seconds % timeMultiplier.hours) / timeMultiplier.min),
      sec: seconds % timeMultiplier.min,
    } as Time;
  };

  static msToTime(duration: number): string {
    const milliseconds = parseInt((duration % 1000) / 100);
    let seconds = parseInt((duration / 1000) % 60);
    let minutes = parseInt((duration / (1000 * 60)) % 60);
    let hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
  }

  static getSizeWithMultiplier = (bytes: number): SizeWithMultiplier => {
    if (bytes === 0) {
      return { size: 0, multiplier: 'b' };
    }
    const convertedBytes = SizeConverter.convertBytes(bytes);

    if (convertedBytes.tb > 0) return { size: convertedBytes.tb + 0.001 * convertedBytes.gb, multiplier: 'tb' };
    else if (convertedBytes.gb > 0) return { size: convertedBytes.gb + 0.001 * convertedBytes.kb, multiplier: 'gb' };
    else if (convertedBytes.mb > 0) return { size: convertedBytes.mb + 0.001 * convertedBytes.kb, multiplier: 'mb' };
    else if (convertedBytes.kb > 0) return { size: convertedBytes.kb + 0.001 * convertedBytes.b, multiplier: 'kb' };
    else return { size: convertedBytes.b, multiplier: 'b' };
  };

  static getSizeWithMultiplierByDivide = (bytes: number): SizeWithMultiplier => {
    if (bytes === 0) {
      return { size: 0, multiplier: 'b' };
    }

    const convertedBytes = SizeConverter.convertBytes(bytes);

    if (convertedBytes.tb > 0) return { size: bytes / multipliers.tb, multiplier: 'tb' };
    else if (convertedBytes.gb > 0) return { size: bytes / multipliers.gb, multiplier: 'gb' };
    else if (convertedBytes.mb > 0) return { size: bytes / multipliers.mb, multiplier: 'mb' };
    else if (convertedBytes.kb > 0) return { size: bytes / multipliers.kb, multiplier: 'kb' };
    else return { size: convertedBytes.b, multiplier: 'b' };
  };

  static getSizeWithMultiplierByDivideWithMaxMultiplier = (bytes: number, maxAvailableMultiplier: string): SizeWithMultiplier => {
    if (bytes === 0) {
      return { size: 0, multiplier: 'b' };
    }

    const convertedBytes = SizeConverter.convertBytes(bytes);

    if (convertedBytes.tb > 0 && multipliers.tb <= multipliers[maxAvailableMultiplier]) return { size: bytes / multipliers.tb, multiplier: 'tb' };
    else if (convertedBytes.gb > 0 && multipliers.gb <= multipliers[maxAvailableMultiplier])
      return { size: bytes / multipliers.gb, multiplier: 'gb' };
    else if (convertedBytes.mb > 0 && multipliers.mb <= multipliers[maxAvailableMultiplier])
      return { size: bytes / multipliers.mb, multiplier: 'mb' };
    else if (convertedBytes.kb > 0 && multipliers.kb <= multipliers[maxAvailableMultiplier])
      return { size: bytes / multipliers.kb, multiplier: 'kb' };
    else return { size: convertedBytes.b, multiplier: 'b' };
  };

  static makeSizeString = (size: Size, isPerSec: boolean): string => {
    const getConvertedValue = (size: Size) => {
      let convertedSize: number;
      if (size.tb > 0) convertedSize = size.tb + 0.001 * size.gb;
      else if (size.gb > 0) convertedSize = size.gb + 0.001 * size.mb;
      else if (size.mb > 0) convertedSize = size.mb + 0.001 * size.kb;
      else if (size.kb > 0) convertedSize = size.kb + 0.001 * size.b;
      else convertedSize = size.b;

      return +convertedSize.toFixed(2);
    };

    if (size.tb > 0) return isPerSec ? `${getConvertedValue(size)} Tb/s` : `${getConvertedValue(size)} Tb`;
    else if (size.gb > 0) return isPerSec ? `${getConvertedValue(size)} Gb/s` : `${getConvertedValue(size)} Gb`;
    else if (size.mb > 0) return isPerSec ? `${getConvertedValue(size)} Mb/s` : `${getConvertedValue(size)} Mb`;
    else if (size.kb > 0) return isPerSec ? `${getConvertedValue(size)} Kb/s` : `${getConvertedValue(size)} Kb`;
    else return size.b <= 0 ? (isPerSec ? `0 b/s` : `0 b`) : isPerSec ? `${getConvertedValue(size)} b/s` : `${getConvertedValue(size)} b`;
  };

  static makeTimeString = (time: Time): string => {
    let yearsString: string | undefined = undefined;
    let monthString: string | undefined = undefined;
    let weeksString: string | undefined = undefined;
    let daysString: string | undefined = undefined;
    let hoursString: string | undefined = undefined;
    let minutesString: string | undefined = undefined;
    let secondsString: string | undefined = undefined;
    if (time.years > 0) {
      yearsString = time.years + ' ' + IndexProvider.getNounDay(time.years, 'год', 'года', 'лет');
      if (time.days - time.years * 365 > 0)
        if (time.days - time.years * 365 > 30) {
          monthString = time.month - time.years * 12 + ' ' + IndexProvider.getNounDay(time.month - time.years * 12, 'месяц', 'месяца', 'месяцев');
          daysString = time.days - time.month * 30 + ' ' + IndexProvider.getNounDay(time.days - time.month * 30, 'день', 'дня', 'дней');
        } else {
          daysString = time.days - time.years * 365 + ' ' + IndexProvider.getNounDay(time.days - time.years * 365, 'день', 'дня', 'дней');
        }
    } else if (time.month > 0) {
      monthString = time.month + ' ' + IndexProvider.getNounDay(time.month, 'месяц', 'месяца', 'месяцев');
      if (time.days - time.month * 30 > 0)
        daysString = time.days - time.month * 30 + ' ' + IndexProvider.getNounDay(time.days - time.month * 30, 'день', 'дня', 'дней');
    } else if (time.weeks > 0) {
      weeksString = time.weeks + ' ' + IndexProvider.getNounDay(time.weeks, 'неделя', 'недели', 'недель');
      if (time.days - time.weeks * 7 > 0)
        daysString = time.days - time.weeks * 7 + ' ' + IndexProvider.getNounDay(time.days - time.weeks * 7, 'день', 'дня', 'дней');
    } else if (time.days > 0) {
      daysString = time.days + ' ' + IndexProvider.getNounDay(time.days, 'день', 'дня', 'дней');
    }
    if (time.hours - time.days * 24 > 0)
      hoursString = time.hours - time.days * 24 + ' ' + IndexProvider.getNounDay(time.hours - time.days * 24, 'час', 'часа', 'часов');
    if (time.min - time.days * 24 * 60 > 0)
      minutesString = time.min - time.days * 24 * 60 + ' ' + IndexProvider.getNounDay(time.min - time.days * 24 * 60, 'минута', 'минуты', 'минут');
    if (time.sec - time.min * 60 > 0)
      secondsString = time.sec - time.min * 60 + ' ' + IndexProvider.getNounDay(time.sec - time.min * 60, 'секунда', 'секунды', 'секунд');
    let result: string = '';
    if (yearsString) {
      result = result + yearsString;
    }
    if (monthString) {
      if (result === '') {
        result = result + monthString;
      } else {
        result = result + ' ' + monthString;
      }
    }
    if (weeksString) {
      if (result === '') {
        result = result + weeksString;
      } else {
        result = result + ' ' + weeksString;
      }
    }
    if (daysString) {
      if (result === '') {
        result = result + daysString;
      } else {
        result = result + ' ' + daysString;
      }
    }
    if (hoursString) {
      if (result === '') {
        result = result + hoursString;
      } else {
        result = result + ' ' + hoursString;
      }
    }
    if (minutesString) {
      if (result === '') {
        result = result + minutesString;
      } else {
        result = result + ' ' + minutesString;
      }
    }
    if (secondsString) {
      if (result === '') {
        result = result + secondsString;
      } else {
        result = result + ' ' + secondsString;
      }
    }
    return result;
  };

  static getTimeForConstraints = (seconds: number): Time => {
    return {
      years: seconds % timeMultiplier.years === 0 ? seconds / timeMultiplier.years : 0,
      month: seconds % timeMultiplier.month === 0 ? seconds / timeMultiplier.month : 0,
      weeks: seconds % timeMultiplier.weeks === 0 ? seconds / timeMultiplier.weeks : 0,
      days: seconds % timeMultiplier.days === 0 ? seconds / timeMultiplier.days : 0,
      hours: seconds % timeMultiplier.hours === 0 ? seconds / timeMultiplier.hours : 0,
      min: seconds % timeMultiplier.min === 0 ? seconds / timeMultiplier.min : 0,
      sec: seconds,
    } as Time;
  };

  static getInitTimeUnit = (time: Time): Item => {
    const valueItem: Item = {
      value: 0,
      unit: 's',
    };
    if (time.years > 0) {
      valueItem.value = time.years;
      valueItem.unit = 'years';
      return valueItem;
    }
    if (time.month > 0) {
      valueItem.value = time.month;
      valueItem.unit = 'month';
      return valueItem;
    }
    if (time.weeks > 0) {
      valueItem.value = time.weeks;
      valueItem.unit = 'weeks';
      return valueItem;
    }
    if (time.days > 0) {
      valueItem.value = time.days;
      valueItem.unit = 'days';
      return valueItem;
    }
    if (time.hours > 0) {
      valueItem.value = time.hours;
      valueItem.unit = 'hours';
      return valueItem;
    }
    if (time.min > 0) {
      valueItem.value = time.min;
      valueItem.unit = 'min';
      return valueItem;
    }
    if (time.sec > 0) {
      valueItem.value = time.sec;
      valueItem.unit = 'sec';
      return valueItem;
    }
  };

  static makeTimeStringForConstraint = (time: Time): string => {
    if (time.years > 0) {
      return time.years + ' ' + IndexProvider.getNounDay(time.years, 'год', 'года', 'лет');
    }
    if (time.month > 0) {
      return time.month + ' ' + IndexProvider.getNounDay(time.month, 'месяц', 'месяца', 'месяцев');
    }
    if (time.weeks > 0) {
      return time.weeks + ' ' + IndexProvider.getNounDay(time.weeks, 'неделя', 'недели', 'недель');
    }
    if (time.days > 0) {
      return time.days + ' ' + IndexProvider.getNounDay(time.days, 'день', 'дня', 'дней');
    }
    if (time.hours > 0) return time.hours + ' ' + IndexProvider.getNounDay(time.hours, 'час', 'часа', 'часов');
    if (time.min > 0) return time.min + ' ' + IndexProvider.getNounDay(time.min, 'минута', 'минуты', 'минут');
    if (time.sec > 0) return time.sec + ' ' + IndexProvider.getNounDay(time.sec, 'секунда', 'секунды', 'секунд');
  };

  static calculateBytesByDelimiter(value, valueUnit) {
    switch (valueUnit) {
      case 'Tb':
        value = value * multipliers.tb;
        break;
      case 'Gb':
        value = value * multipliers.gb;
        break;
      case 'Mb':
        value = value * multipliers.mb;
        break;
      case 'Kb':
        value = value * multipliers.kb;
        break;
      case 'b':
        value *= 1;
    }
    return value;
  }

  static calculateTimeByDelimiter(value, valueUnit) {
    switch (valueUnit) {
      case 'years':
        value *= timeMultiplier.years;
        break;
      case 'month':
        value *= timeMultiplier.month;
        break;
      case 'weeks':
        value *= timeMultiplier.weeks;
        break;
      case 'days':
        value *= timeMultiplier.days;
        break;
      case 'hours':
        value *= timeMultiplier.hours;
        break;
      case 'min':
        value *= timeMultiplier.min;
      case 'sec':
        value *= 1;
    }
    return value;
  }

  static mapToTimeUnits(unit: string) {
    switch (unit) {
      case 'WEEK':
        return 'неделя';
      case 'SECOND':
        return 'секунда';
      case 'MINUTE':
        return 'минута';
      case 'HOUR':
        return 'час';
      case 'MONTH':
        return 'месяц';
      case 'YEAR':
        return 'год';
      case 'DAY':
        return 'день';
    }
  }
}
