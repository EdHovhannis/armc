export interface ICopyAuditParamsSpecs {
  auditParamsArrayFieldName: string;
  auditParamName: string;
  fieldWithAuditParamName: string;
  fieldWithAuditParamValue: string;
  resultFieldName: string;
  resultFieldType: FieldTypes;
}

export interface ICopyAuditParams extends ICopyAuditParamsSpecs {
  tableData?: ITableData;
}

export interface ITableData {
  id?: number;
  editing?: 'update' | 'add' | 'delete' | boolean;
}

export interface ITableValidate {
  isValid: boolean;
  helperText?: string | undefined;
}

export interface ICopyFieldsSchema {
  name: string;
  type?: string;
  fieldType?: string;
  subType: string | null;
}

export type FieldTypes = 'STRING' | 'TEXT' | 'INT' | 'LONG' | 'DOUBLE' | 'UUID' | 'BOOLEAN';
