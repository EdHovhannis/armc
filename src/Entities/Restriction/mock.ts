import { RestrictionAllItem, RestrictionByIndexItem, RestrictionByProjectItem } from './types';

// Список доступных индексов (источник опций для вкладки «По индексу»).
export const indexOptionsMock: string[] = [
  'CI02001608_CI00682968_WAREHOUSE_AND_LOGISTICS_WMS',
  'CI02001608_CI03222853_PERSON_CREDIT_CHAPAYMANTDAY',
  'CI02001608_CI00982781-SM-UKO',
  'CI02001608_CI00982781-SESSION-INTEGRATION',
  'CI02001608_CI00682968_PINSURANCE_MORTGAGE_MB',
  'CI02001608_CI00682968_PINSURANCE_MORTGAGE',
  'CI02001608_CI00682968_PINSURANCE_PRAVTO_MB',
  'CI02001608_CI00682968_PINSURANCE_HEALTH_MB',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINSURANCE_HEALTH_IB',
  'CI02001608_CI00682968_PINS_PSS_TERM_MB_crit',
  'CI02001608_CI00682968_PINS_PSS_TERM_MB_uncrit',
];

// Список доступных проектов (источник опций для вкладки «По проекту»)
export const projectOptionsMock: string[] = ['C03132782PL', 'CI02001608', 'CI00682968', 'CI03222853', 'C03132782RPS'];

// Сохранённые ограничения по индексам.
export const restrictionsByIndexMock: RestrictionByIndexItem[] = [
  { indexId: 'CI02001608_CI00682968_WAREHOUSE_AND_LOGISTICS_WMS', value: 7, unit: 'YEARS' },
  { indexId: 'CI02001608_CI03222853_PERSON_CREDIT_CHAPAYMANTDAY', value: 5, unit: 'YEARS' },
];

// Сохранённые ограничения по проектам
export const restrictionsByProjectMock: RestrictionByProjectItem[] = [{ project: 'C03132782PL', value: 2, unit: 'YEARS' }];

// Сохранённое глобальное ограничение для всех индексов.
export const restrictionAllMock: RestrictionAllItem = { value: 7, unit: 'YEARS' };
