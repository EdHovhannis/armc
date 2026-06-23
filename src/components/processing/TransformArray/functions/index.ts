import * as _ from 'lodash';
import { customAlphabet } from 'nanoid';

import { ArchiveProcessing, ArchiveSchema } from '../../../../store/archive/Types';
import { SchemaPipeline } from '../../../../store/pipeline/Types';
import { ArchiveUtils } from '../../../../utils/ArchiveUtils';
import { PipelineUtils } from '../../../../utils/PipelineUtils';
import { ERROR_NAME_REGEXP_STRING, NAME_REGEXP } from '../../../../utils/Utils';
import {
  ExtendedValidateRowsType,
  ExtendedValidateRowType,
  ITransformData,
  ITransformTableData,
  TransformArrayData,
  transformTypeNumber,
} from '../types';

const nanoid = customAlphabet('1234567890', 10);

/**
 * является ли примитив/объект/массив пустым (используется lodash)
 * @param value
 */
const checkIsEmpty = (value?: any) => {
  return _.isEmpty(value);
};

/**
 * Функция создает массив со всеми значениями ключа key из массива объектов data
 * in: data =[{ x: value, y: value}, {x: value_1, y: value_2}], key = 'x'
 * out: [value, value_1]
 * @param data - массив объектов
 * @param key - имя свойств, по которому будет осуществлена фильтрация
 *
 */
function getAllPropsByKey<T extends {}>(data: T[] = [], key: keyof T): T[keyof T][] {
  if (!Array.isArray(data)) {
    throw new Error('Переданное значение data не является массивом');
  }
  const dictionary = [...data];

  return dictionary.map((d) => d[key]);
}

/**
 * Функция определяет является ли значение current уникальным в рамках массива data
 * @param data - массив
 * @param currentValue - искомое значение
 */
function checkIsUnique<T>(data: T[], currentValue: T) {
  return !data.some((d) => d === currentValue);
}

const findIndex = (id: number, data: ITransformTableData[]) => {
  return data.findIndex((d) => d.id === id);
};

const transformArrayErrors = {
  empty: 'Запрещено вводить пустое значение',
  uniqueSourceField: 'Имена полей должны быть уникальными',
  uniqueTargetArray: 'Имена новых массивов должны быть уникальными',
  uniqueArrayName: 'Имена массивов должны быть уникальнымы',
  schemaInvalid: 'Поле с таким именем уже существует в схеме',
  symbol: ERROR_NAME_REGEXP_STRING,
};

/**
 * Функция для преобразования данных таблицы ITransformTableData[] в SchemaPipeline['fields'] для
 * отображения в результатах полнотекстового индекса
 * @param data
 */
const covertTransformToSchemaPipeline = (data: ITransformTableData[]): SchemaPipeline['fields'] => {
  const fields = getAllPropsByKey<ITransformTableData>(data, 'fields') as ITransformData[][];

  let linearFields: ITransformData[] = [];

  fields.forEach((array) => {
    linearFields = linearFields.concat(array);
  });

  return linearFields.map((field) => ({
    name: field.targetArray,
    fieldType: transformTypeNumber.ARRAY,
    subType: field.type,
  }));
};
/**©©
 * Функция для преобразования данных таблицы ITransformTableData[] в ArchiveSchema['fields'] для
 * отображения в результатах архивного индекса
 * @param data
 */
const covertTransformToSchemaArchive = (data: ITransformTableData[]): ArchiveSchema['fields'] => {
  const fields = getAllPropsByKey<ITransformTableData>(data, 'fields') as ITransformData[][];

  let linearFields: ITransformData[] = [];

  fields.forEach((array) => {
    linearFields = linearFields.concat(array);
  });

  return linearFields.map((field) => ({
    name: field.targetArray,
    type: transformTypeNumber.ARRAY,
    subType: field.type,
    id: field.id,
    format: field.format,
  }));
};

/**
 * Функция для преобразования TransformArrayData -> ITransformTableData[] (данные для отображения таблицы)
 * @param data
 */
const getTransformTableData = (data: TransformArrayData): ITransformTableData[] => {
  return data.map((d) => {
    return {
      arrayNames: d.sourceArrays,
      fields: d.targetConfig,
      id: +nanoid(5),
    };
  });
};

/**
 * Функция валидации имени массива
 * @param arrayNames - массив содержащий имена массивов
 * @param data
 * @return string - текст ошибки, null - поле является валидным
 */
const validateArrayName = (arrayNames: string[], data: ITransformTableData[]): string | null => {
  if (arrayNames.some((name) => checkIsEmpty(name))) return transformArrayErrors.empty;
  if (arrayNames.some((name) => !NAME_REGEXP.exec(name))) return transformArrayErrors.symbol;

  // проверка является ли имя массива уникальным среди текущего массива имён
  const isNotUnique = arrayNames.some((name, index, array) => {
    const helperArray = [...array];
    //    удалим текущее имя массива из проверки
    helperArray.splice(index, 1);
    return helperArray.includes(name);
  });

  if (isNotUnique) return transformArrayErrors.uniqueArrayName;

  // проверка на то, что каждое из введеных имен массиво является уникальным среди всех массивов
  const tableData = [...data];
  const dataArrayNames = getAllPropsByKey<ITransformTableData>(tableData, 'arrayNames') as string[][];
  const index = dataArrayNames.findIndex((value) => _.isEqual(value, arrayNames));
  dataArrayNames.splice(index, 1);

  const isNotUniqueAll = arrayNames.some((name) => {
    return dataArrayNames.some((arrayNames) => arrayNames.includes(name));
  });

  if (isNotUniqueAll) return transformArrayErrors.uniqueArrayName;

  return null;
};

/**
 * Функция проверяет является ли значение targetArray уникальным для targetArrays
 * Также, происходит проверка уникальность значения в схеме ArchiveSchema | SchemaPipeline
 * @param targetArray - проверяемое значение
 * @param targetArrays - массив в котором будет проверяться значение
 * @param schema
 * @param processing
 * @return string - текст ошибки, null - поле является валидным
 */
const isTargetArrayUnique = (
  targetArray: string,
  targetArrays: string[],
  schema: ArchiveSchema | SchemaPipeline,
  processing?: ArchiveProcessing,
): string | null => {
  if ('primaryTimeField' in schema && schema?.primaryTimeField) {
    if (PipelineUtils.isFieldNotUnique(targetArray, schema)) {
      return transformArrayErrors.schemaInvalid;
    }
  } else {
    if (ArchiveUtils.isFieldNotUnique(targetArray, schema as ArchiveSchema, processing as ArchiveProcessing)) {
      return transformArrayErrors.schemaInvalid;
    }
  }

  const isUnique = checkIsUnique(targetArrays, targetArray);

  if (!isUnique) {
    return transformArrayErrors.uniqueTargetArray;
  } else {
    return null;
  }
};

/**
 * Функция проверяет все значения существующие значения ITransformTableData['fields'].targetArray в массиве ITransformTableData[]
 * на пустое значение, на  соотвествие маске символов, на уникальность
 * @param rowData - данные строки
 * @param data
 * @param schema
 * @param processing
 * @return string - текст ошибки, null - поле является валидным
 */
const validateTargetArrays = (
  rowData: ITransformData,
  data: ITransformTableData[],
  schema: ArchiveSchema | SchemaPipeline,
  processing?: ArchiveProcessing,
) => {
  const isEmpty = checkIsEmpty(rowData?.targetArray);

  if (isEmpty) {
    return `Имя нового массива: ${transformArrayErrors.empty}`;
  }

  if (!NAME_REGEXP.exec(rowData.targetArray)) {
    return transformArrayErrors.symbol;
  }

  const tableData = [...data];
  let targetArrays: string[] = [];

  const fields = getAllPropsByKey<ITransformTableData>(tableData, 'fields') as ITransformData[][];

  fields.forEach((array) => {
    const targets = getAllPropsByKey<ITransformData>(array, 'targetArray') as string[];
    targetArrays = targetArrays.concat(targets);
  });

  return isTargetArrayUnique(rowData.targetArray ?? '', targetArrays, schema, processing);
};

/**
 * Ялвяется ли поле униклаьным
 * @param sourceField - значение для проверки
 * @param data - массив для валидация
 * @return string - текст ошибки, null - поле является валидным
 */
const isSourceFieldUnique = (sourceField: string, data: ITransformData[]): string | null => {
  const tableData = [...data];
  // получить линейный массив вида -> string[]
  const sourceFields = getAllPropsByKey(tableData, 'sourceField');
  const isUnique = checkIsUnique(sourceFields, sourceField);

  if (!isUnique) {
    return transformArrayErrors.uniqueSourceField;
  } else {
    return null;
  }
};
/**
 * Валидация имени поля в массиве на:
 * 1) является ли значение пустым
 * 2) соответствует ли маске (регулярное выражение)
 * 3) является ли уникальным
 * @param sourceField - поле для проверки
 * @param data - массив для валидации
 * @return string - текст ошибки, null - поле является валидным
 */
const validateSourceField = (sourceField: string = '', data: ITransformData[]): string | null => {
  const isSourceFieldEmpty = checkIsEmpty(sourceField);

  if (isSourceFieldEmpty) {
    return `Имя поля в объектах массива: ${transformArrayErrors.empty}`;
    // return {isValid: false, helperText: transformArrayErrors.empty}
  } else if (!NAME_REGEXP.exec(sourceField)) {
    return transformArrayErrors.symbol;
  } else {
    return isSourceFieldUnique(sourceField, data);
  }
};

/**
 * Валидация строки таблицы для полей sourceField, targetArray
 *
 * @param parentIndex - родительский индекс
 * @param schema
 * @param displayError - функция для отображения ошибки
 * @param processing
 * @return true - строка валидна, false - невалидна
 */
const validateRow: ExtendedValidateRowType = (
  parentIndex: number,
  schema: ArchiveSchema | SchemaPipeline,
  displayError?: (error: string) => void,
  processing?: ArchiveProcessing,
) => {
  return (rowData: ITransformData, data: ITransformTableData[]): boolean => {
    const myData = [...data];
    const parent = { ...myData[parentIndex] };
    const fields = [...parent.fields];

    if (rowData?.tableData) {
      fields.splice(rowData?.tableData?.id, 1);
      parent.fields = fields;
      myData.splice(parentIndex, 1, { ...parent });
    }

    let error: { sourceField: null | string; targetArray: null | string } = { sourceField: null, targetArray: null };
    const clearError = () => ({
      sourceField: null,
      targetArray: null,
    });
    // защита от кэша
    if (error.sourceField || error.targetArray) {
      error = clearError();
    }
    //SOURCE FIELD
    error.sourceField = validateSourceField(rowData?.sourceField, [...myData[parentIndex]?.fields]);

    // TARGET ARRAY
    error.targetArray = validateTargetArrays(rowData, myData, schema, processing);

    // Предотвращение многократного отображения одинаковой ошибки
    if (error.sourceField === error.targetArray) {
      error.targetArray = null;
    }

    const errorInfo = Object.values(error)
      .filter((value) => !!value)
      .map((value) => value?.toLowerCase()) as string[];

    if (displayError) {
      if (errorInfo.length) {
        if (errorInfo.length > 1) {
          displayError(errorInfo.join(', '));
        } else {
          displayError(errorInfo[0]);
        }
      }
    }

    return !errorInfo.length;
  };
};

//
const validateRows: ExtendedValidateRowsType = (
  parentIndex: number,
  schema: ArchiveSchema | SchemaPipeline,
  displayError?: (error: string) => void,
  processing?: ArchiveProcessing,
) => {
  return (rowsData: ITransformData[], data: ITransformTableData[]): boolean => {
    return rowsData.every((rowData) => validateRow(parentIndex, schema, displayError, processing)(rowData, data));
  };
};

const getArchiveTypesDictionary = (): Record<string, string> => ({
  [transformTypeNumber.STRING]: 'string',
  [transformTypeNumber.INT]: 'int',
  [transformTypeNumber.DOUBLE]: 'double',
  [transformTypeNumber.LONG]: 'long',
  [transformTypeNumber.DATE]: 'date',
  [transformTypeNumber.BOOLEAN]: 'boolean',
});

const getIndexTypesDictionary = (): Record<string, string> => ({
  [transformTypeNumber.STRING]: 'string',
  [transformTypeNumber.INT]: 'int',
  [transformTypeNumber.DOUBLE]: 'double',
  [transformTypeNumber.LONG]: 'long',
  [transformTypeNumber.DATE]: 'date',
  [transformTypeNumber.UUID]: 'uuid',
  [transformTypeNumber.BOOLEAN]: 'boolean',
});

export {
  getArchiveTypesDictionary,
  getIndexTypesDictionary,
  validateArrayName,
  validateRow,
  validateRows,
  checkIsUnique,
  getAllPropsByKey,
  checkIsEmpty,
  findIndex,
  covertTransformToSchemaPipeline,
  covertTransformToSchemaArchive,
  getTransformTableData,
  transformArrayErrors,
  nanoid,
};
