import { string } from 'prop-types';

export const COLUMN_PREFIX = 'column_';

export class LookupUtils {
  static getWidthOfColumnName(columnName: string) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '12px arial';
    const width = context.measureText(columnName).width;
    const formattedWidth = Math.ceil(width + 90) + 'px';
    return formattedWidth;
  }

  static checkEmptyCell(data: any[]): { isEmpty: boolean; column?: string } {
    let res: { isEmpty: boolean; column?: string } = {
      isEmpty: false,
    };
    const allColumns: string[] = [];
    data.map((dataLine) => {
      Object.keys(dataLine).map((key) => {
        if (!allColumns.includes(key)) {
          allColumns.push(key);
        }
      });
    });
    data.map((dataLine) => {
      allColumns.map((key) => {
        if (dataLine[key] === '' || !dataLine[key]) {
          res = {
            isEmpty: true,
            column: key,
          };
        }
      });
    });
    return res;
  }
}
