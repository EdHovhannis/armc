import { FieldTypes, ICopyAuditParams, ICopyFieldsSchema } from './types';

export const copyFieldTypes: FieldTypes[] = ['STRING', 'TEXT', 'INT', 'LONG', 'DOUBLE', 'UUID', 'BOOLEAN'];

export const validateRow = (row: ICopyAuditParams) => {
  let isValid = true;
  let invalidFields: string[] = [];

  Object.entries(row).forEach(([key, value]) => {
    if (
      (key !== 'resultFieldType' && value.length > 128) || // Длина значения не больше 128 символов
      (key === 'resultFieldType' && !copyFieldTypes.includes(value)) || // Поле типа соответствуют заданным значениям
      (['auditParamsArrayFieldName', 'auditParamName'].includes(key) && value.length < 1) // Имя поля и	Поле для копирования обязательны для заполнения
    ) {
      invalidFields = [...invalidFields, key];
      isValid = false;
    }
  });

  return isValid ? isValid : invalidFields;
};

export const modifySchema = (schema: ICopyFieldsSchema[], copyFields: ICopyAuditParams[], useType = true) => {
  let updatedSchema: ICopyFieldsSchema[] = [...schema];

  copyFields?.forEach((obj) => {
    updatedSchema = [
      ...updatedSchema,
      {
        name: obj.resultFieldName,
        [useType ? 'type' : 'fieldType']: obj.resultFieldType,
        subType: null,
      },
    ];
  });

  updatedSchema.reverse();

  const uniqueSchema: ICopyFieldsSchema[] = updatedSchema.reduce((unique: ICopyFieldsSchema[], object: ICopyFieldsSchema) => {
    if (!unique.some((obj) => obj.name === object.name)) {
      unique = [...unique, object];
    }
    return unique;
  }, []);

  return uniqueSchema.reverse();
};
