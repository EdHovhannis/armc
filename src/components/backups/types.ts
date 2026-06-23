export type BackupTableRow = IIndexRecovery | IIndexBackup | ISavepointIndex | IIndexRestore | ISavepointRecovery | IBackupsIncident;

export interface IListBackups<T = BackupTableRow> {
  totalPages: number;
  totalElements: number;
  items: T[];
}

export interface IActionMenuItem {
  label: string;
  visible: boolean;
  onClick: () => void;
}

export interface IBackupsFilter {
  projectShortName: string;
  taskName?: string;
  zoneId?: string;
  backupFilter?: string[];
  finishFilter?: string;
  fromFilter?: string;
  toFilter?: string;
  corrupted?: string;
  page?: number;
  pageSize?: number;
  collection?: string;
}

export interface IIndexRecovery {
  id: number;
  projectShortName: string;
  taskName: string;
  zoneId: string;
  fulltextIndexId: number;
  collectionName: string;
  status: ICollectionStatus;
  backupId?: number;
  createdAt: string;
  lastUpdatedAt: string;
  isHot: boolean;
  lastBackupStatus: ILastBackupStatus;
  lastBackup?: string;
  backupCount: string;
  savepointCount: string;
  canRestoreFromBackup: boolean;
  canRestoreFromSavepoint: boolean;
}

export type ICollectionStatus = 'FAIL' | 'OK';

export type ILastBackupStatus = 'NONE' | 'IN_PROGRESS' | 'FAIL' | 'OK';

export const TaskStatus = ['NEW', 'PROCESSING', 'PROCESSING_YIELD', 'ERR_CONSISTENT', 'ERR_NOT_CONSISTENT', 'ERR_TEMPORARY', 'DONE'] as const;

export type ITaskStatus = (typeof TaskStatus)[number];

export const ErrorClass = ['HEALTH_CHECK_ERROR', 'USER_QUERY_ERROR', 'MAINTENANCE_ERROR', 'INCONSISTENT_MAINTENANCE_ERROR'] as const;

export type IErrorClass = (typeof ErrorClass)[number];

export const ObjectType = ['INDEX', 'COLLECTION'] as const;

export type IObjectType = (typeof ObjectType)[number];

export interface IIndexBackup {
  id: number;
  projectShortName: string;
  taskName: string;
  zoneId: string;
  fulltextIndexId: number;
  collectionName: string;
  backupTime: string;
  backupName: string;
  backupPath: string;
  status: ITaskStatus;
  subStatus: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface IIndexRestore {
  id: number;
  projectShortName: string;
  taskName: string;
  zoneId: string;
  fulltextIndexId: number;
  collectionName: string;
  status: ITaskStatus;
  subStatus: string;
  backupId: number;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface ISavepointIndex {
  id: number;
  projectShortName: string;
  taskName: string;
  zoneId: string;
  fulltextIndexId: number;
  collectionName: string;
  savepointTime: string;
  kafkaOffsets: IKafkaOffset[];
  savepointName: string;
  savepointPath: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface IKafkaOffset {
  topic: string;
  offset: number;
  partition: number;
}

export interface ISavepointRecovery {
  id: number;
  projectShortName: string;
  taskName: string;
  zoneId: string;
  fulltextIndexId: number;
  status: ITaskStatus;
  progress: ISavepointProgress;
  collectionName: string;
  savepointPath: string;
  savepointName: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface ISavepointProgress {
  kafkaCurrentOffsets: IKafkaOffset[];
  kafkaEndOffsets: IKafkaOffset[];
  kafkaStartOffsets: IKafkaOffset[];
  totalMessages: IKafkaOffset;
  completedMessages: number;
  remainingMessages: number;
}

export interface IBackupsIncident {
  id: number;
  projectShortName: string;
  objectType: string;
  fullTextIndexId: number;
  taskName: string;
  zoneId: string;
  collectionName: string;
  errorClass: string;
  errorDescription: string;
  startTime: string;
  finished: boolean;
  finishTime: string;
  lastUpdateTime: string;
}

export interface IFilterCollections {
  readCollections: string[];
  writeCollections: string[];
}

export interface DateRangeSerialized {
  fromFilter?: string;
  toFilter?: string;
}

/**
 * Тип фильтра — определяет, как будет отображаться и управляться фильтр
 */
export type FilterType =
  | 'multiselect' // множественный выбор из списка
  | 'checkboxgroup' // множественный выбор из сheckbox
  | 'segmentgroup' // единичный выбор в segment
  | 'daterange'; // диапазон дат (from/to)

/**
 * Конфигурация источника данных для автозаполнения
 */
export interface AutocompleteConfig {
  fetchOptions: (inputValue: string, context: FilterSelections) => Promise<FilterValue[]>;
  debounceTime?: number; // задержка перед запросом
}

/**
 * Статическое описание фильтра — его мета-информация и настройки
 */
export interface FilterDefinition {
  key: string;
  label: string;
  type: FilterType;

  // Статические опции (если заданы — используются напрямую)
  options?: FilterValue[];

  // Конфигурация асинхронной загрузки (если нет статических)
  autocompleteConfig?: AutocompleteConfig;

  //будет ли доступен поиск в select
  isSearchable?: boolean;

  //Извлечение значения фильтра из url
  extractValueFromUrl: (searchParams: URLSearchParams) => FilterSelection | undefined;

  //сериализация в строку для url
  serializeToUrlParam: (value: FilterSelection) => string | DateRangeSerialized | undefined;
}

/**
 * Фактические значения, выставленные пользователем для конкретного фильтра
 */
export interface FilterValue {
  value: string;
  label: string;
}

export interface FilterSelection {
  key: string;

  // Значения в зависимости от типа
  value?: FilterValue | FilterValue[] | null; // для multiselect, singleselect, autocomplete
  fromValue?: string; // для date, daterange
  toValue?: string; // для daterange
  checked?: boolean; // для checkbox
}

// Утилита: тип состояния всех выбранных фильтров
export type FilterSelections = FilterSelection[];
