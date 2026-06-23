import { Unit } from '../role/Types';

export enum OBJECT_TYPE {
  PROJECT = 'PROJECT',
  INDEX = 'INDEX',
  GLOBAL = 'GLOBAL',
}

export interface ConstraintShort {
  projectKey: string;
  objectName: string;
  objectId: string | number;
  objectType: OBJECT_TYPE;
  constraintType: ConstraintType;
}

export interface ConstraintFilterParams {
  constraintType?: ConstraintType[];
  objectType?: OBJECT_TYPE;
  projects?: string[];
}

export interface BlockFilterParams {
  constraintType?: ConstraintType[];
  objectType?: OBJECT_TYPE;
  projects?: string[];
  subjectType?: Unit;
}

export enum ConstraintType {
  fulltext = 'Полнотекстовый индекс',
  archive = 'Архивный индекс',
  analytic = 'Аналитический индекс',
  project = 'Проект',
  cluster = 'Cluster',
}

export interface FulltextConstraint {
  inheritedRestrictions: BasicFulltextConstraint;
  objectRestrictions?: BasicFulltextConstraint;
  mergedRestrictions: BasicFulltextConstraint;
}

export interface ArchiveConstraint {
  inheritedRestrictions: BasicArchiveConstraint;
  objectRestrictions?: BasicArchiveConstraint;
  mergedRestrictions: BasicArchiveConstraint;
}

export interface AnalyticConstraint {
  inheritedRestrictions: BasicAnalyticConstraint;
  objectRestrictions?: BasicAnalyticConstraint;
  mergedRestrictions: BasicAnalyticConstraint;
}

export interface ProjectConstraint {
  fulltext: FulltextConstraint;
  archive: ArchiveConstraint;
  analytic: AnalyticConstraint;
}

export interface ClusterConstraint {
  fulltext: BasicFulltextConstraint;
  archive: BasicArchiveConstraint;
  analytic: BasicAnalyticConstraint;
}

export interface Blocks {
  subjectId: number;
  subjectType: Unit;
  objectName: string;
  objectId: number;
  projectKey: string;
  objectType: ConstraintType;
  constraintType: ConstraintType;
}

export interface BlockedInfo {
  subjectId: number;
  subjectType: Unit;
  objectId?: number;
  projectId?: string;
  objectType: ConstraintType;
  constraintType: ConstraintType;
  objectName?: string;
  subjectName?: string;
  global: boolean;
  description?: string;
}

export interface BlockedUnit {
  subjectType: Unit;
  subjectId: number;
  description: string;
  constraintType?: ConstraintType;
}

export interface BlockingDataDescription {
  description: string;
}

export enum ConstraintValueType {
  time,
  number,
  size,
}

//maxRecordCountByQuery: 1000
// maxSearchTimeIntervalSec: 259200
// maxSizeBytesByQuery: 53687091200
export interface BasicFulltextConstraint {
  maxRecordCountByQuery: number;
  maxSearchTimeIntervalSec: number;
  maxSizeBytesByQuery: number;
}

//maxQueryTimeoutSec: 30
// maxRecordCountByDatasource: 1000
// maxRecordCountByQuery: 1001
// maxSearchTimeIntervalForDatasourceSec: 259201
// maxSearchTimeIntervalForQuerySec: 864001
export interface BasicAnalyticConstraint {
  maxQueryTimeoutSec: number;
  maxRecordCountByDatasource: number;
  maxSearchTimeIntervalForDatasourceSec: number;
  maxRecordCountByQuery: number;
  maxSearchTimeIntervalForQuerySec: number;
}

export interface BasicArchiveConstraint {
  maxSearchTimeIntervalSec: number;
}

export const OBJECT_TYPE_MAP = {
  PROJECT: 'Проект',
  INDEX: 'Индекс',
  GLOBAL: 'Глобальная',
};

export const CONSTRAINT_MAP = {
  maxRecordCountByQuery: {
    //это количества записей, запрашиваемых данных в рамках одного запроса
    title: 'Максимальное количество записей, возвращаемых при запросе',
    type: ConstraintValueType.number,
  },
  maxSearchTimeIntervalSec: {
    title: 'Максимальный временной интервала поиска',
    type: ConstraintValueType.time,
  },
  maxSizeBytesByQuery: {
    title: 'Максимальный объем данных при поиске',
    type: ConstraintValueType.size,
  },
  maxRecordCountByDatasource: {
    title: 'Максимальные количество записей, которые можно получить при запросе к датосорсу',
    type: ConstraintValueType.number,
  },
  maxSearchTimeIntervalForDatasourceSec: {
    title: 'Максимальный временной интервал поиска для датасорса',
    type: ConstraintValueType.time,
  },
  maxSearchTimeIntervalForQuerySec: {
    title: 'Максимальный временной интервал поиска для запроса',
    type: ConstraintValueType.time,
  },
  maxQueryTimeoutSec: {
    title: 'Максимальное время выполнения запроса',
    type: ConstraintValueType.time,
  },
  maxScatterGatherBytes: {
    title: 'Максимальный объем данных, возвращаемый в рамках запроса',
    type: ConstraintValueType.size,
  },
};

export const SERVICE_MAP = {
  fulltext: 'Полнотекстовый индекс',
  analytic: 'Аналитический индекс',
  archive: 'Архивный индекс',
  project: 'Проект',
};
