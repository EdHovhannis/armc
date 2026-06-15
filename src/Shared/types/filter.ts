export type OptionItemType = { label: string; value: string };

export type SpeedUnitValue = 'B/s' | 'KB/s' | 'MB/s';
export type SizeUnitValue = 'MB' | 'GB' | 'TB';
export type DateUnitValue = 'MONTH' | 'WEEKS' | 'DAYS' | 'HOURS' | 'MIN' | 'SEC';

export type SpeedUnitOption = { value: SpeedUnitValue; label: string };
export type SizeUnitOption = { value: SizeUnitValue; label: string };
export type DateUnitOption = { value: DateUnitValue; label: string };

export type SchemaFieldValue = 'STRING' | 'TEXT' | 'INT' | 'DOUBLE' | 'LONG' | 'DATE' | 'BOOLEAN' | 'ARRAY';
export type SchemaFieldOption = { value: SchemaFieldValue; label: string };

export type SchemaSubFieldValue = 'STRING' | 'INT' | 'DOUBLE' | 'LONG' | 'DATE' | 'BOOLEAN';
export type SchemaSubFieldOption = { value: SchemaSubFieldValue; label: string };

export type SchemaTypeFieldValue = 'EQUALS' | 'REGEX' | 'IS_NULL';
export type SchemaTypeFieldOption = { value: SchemaTypeFieldValue; label: string };

export type SchemaConditionFieldValue = 'AND' | 'OR';
export type SchemaConditionFieldOption = { value: SchemaConditionFieldValue; label: string };

export type SchemaDLQFieldOption = { value: boolean; label: string };

export type SchemaAuditFieldValue = 'STRING' | 'TEXT' | 'INT' | 'DOUBLE' | 'LONG' | 'BOOLEAN';
export type SchemaAuditFieldOption = { value: SchemaAuditFieldValue; label: string };
