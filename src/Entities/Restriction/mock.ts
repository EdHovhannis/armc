import { RestrictionAllItem, RestrictionObjectItem } from './types';

// опции проектов для вкладки "По проекту" (value = shortName, label = name)
export const projectOptionsMock: { name: string; shortName: string }[] = [
  { name: 'abyss_st2', shortName: 'abyss_st2' },
  { name: 'Fast2', shortName: 'Fast2' },
  { name: 'Name1', shortName: 'Key1' },
];

// список объектов с ограничениями (overview) - значения как будто уже догружены
export const restrictionsOverviewMock: RestrictionObjectItem[] = [
  { objectType: 'PROJECT', objectId: 'Fast6', objectName: 'Fast6', projectKey: 'Fast6', maxSearchTimeIntervalSec: 5_184_000 },
  { objectType: 'INDEX', objectId: '25', objectName: 'coord-logs', projectKey: 'abyss_st2', maxSearchTimeIntervalSec: 63_072_000 },
];

// сохранённое глобальное ограничение для всех индексов - 4 дня в секундах
export const restrictionAllMock: RestrictionAllItem = { maxSearchTimeIntervalSec: 345_600 };
