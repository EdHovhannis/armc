import { RestrictionUnit } from '@src/Shared/types/restriction';

export type RestrictionTab = 'byIndex' | 'byProject' | 'all';

// имя секции формы со списком ограничений по сущности (индекс/проект)
export type RestrictionListName = 'byIndex' | 'byProject';

// редактируемая строка ограничения по сущности (индекс или проект)
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
