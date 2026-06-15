export type RestrictionUnit = 'SECONDS' | 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS';

// Ограничение по конкретному индексу.
export type RestrictionByIndexItem = {
  indexId: string;
  value: number;
  unit: RestrictionUnit;
};

// Ограничение по проекту
export type RestrictionByProjectItem = {
  project: string;
  value: number;
  unit: RestrictionUnit;
};

// Глобальное ограничение для всех индексов.
export type RestrictionAllItem = {
  value: number;
  unit: RestrictionUnit;
};
