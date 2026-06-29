import { RestrictionUnit } from '@src/Shared/types/restriction';

export type RestrictionTab = 'byIndex' | 'byProject' | 'all';

export type RestrictionListName = 'byIndex' | 'byProject';

export type RestrictionEntityRow = {
  // indexId (вкладка "По индексу") или project (вкладка "По проекту")
  entity: string;
  value: number | null;
  unit: RestrictionUnit;
};

export type RestrictionsFormValues = {
  byIndex: RestrictionEntityRow[];
  byProject: RestrictionEntityRow[];
  all: {
    value: number | null;
    unit: RestrictionUnit;
  };
};
