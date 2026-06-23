import { ArchiveProcessing, ArchiveSchema } from '../../../store/archive/Types';
import { SchemaPipeline, TimestampNode } from '../../../store/pipeline/Types';

export enum transformTypeNumber {
  STRING = 'STRING',
  INT = 'INT',
  DOUBLE = 'DOUBLE',
  LONG = 'LONG',
  DATE = 'DATE',
  UUID = 'UUID',
  BOOLEAN = 'BOOLEAN',
  ARRAY = 'ARRAY',
}

export interface ITransformData {
  sourceField: string;
  targetArray: string;
  type: string;
  tableData?: { id: number; editing: 'update' | 'add' | 'delete' | boolean };
  id?: number;
  isNew?: boolean;
  format?: string | TimestampNode;
}

export interface ITransformTableData {
  arrayNames: string[];
  fields: ITransformData[];
  id: number;
}

export type TransformArrayData = { sourceArrays: string[]; targetConfig: ITransformData[] }[];

// export type TransformArrayData = { [prop: string]: ITransformData[] }[]

export type ExtendedValidateRowType = (
  parentIndex: number,
  schema: ArchiveSchema | SchemaPipeline,
  displayError?: (error: string) => void,
  processing?: ArchiveProcessing,
) => ValidateRowType;
export type ExtendedValidateRowsType = (
  parentIndex: number,
  schema: ArchiveSchema | SchemaPipeline,
  displayError?: (error: string) => void,
  processing?: ArchiveProcessing,
) => ValidateRowsType;

export type ValidateRowType = (rowData: ITransformData, data: ITransformTableData[]) => boolean;
export type ValidateRowsType = (rowData: ITransformData[], data: ITransformTableData[]) => boolean;

export interface ITransformEvents {
  // удаление массива и всех вложенных в него свойств
  onDeleteArray(id: number): void;

  // удаление одной строки таблицы
  onDeleteField(id: number, index: number): void;

  // добавление новой строки в таблицу
  onAddField(id: number, data: ITransformData): void;

  // добавление нового массива в таблицу
  onAddArray(): void;

  // редактирование строки в таблице
  onEditField(parentIndex: number, index: number, newData: ITransformData): void;

  // редактирование всех строк таблицы
  onEditArray(id: number, data: ITransformData[]): void;

  // редактирование имени массивов
  onEditArrayNames(id: number, names: string[], parentIndex: number): void;
}

export interface ITransformArray {
  transformArray?: TransformArrayData;
}
