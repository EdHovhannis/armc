import { RestrictionUnit } from '@src/Entities/Restriction/types';

export type RestrictionTab = 'byIndex' | 'byProject' | 'all';

// Имя секции формы со списком ограничений по сущности (индекс/проект)
export type RestrictionListName = 'byIndex' | 'byProject';

// Редактируемая строка ограничения по сущности (индекс или проект).
export type RestrictionEntityRow = {
  // indexId (вкладка «По индексу») или project (вкладка «По проекту»).
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
