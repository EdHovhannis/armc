import { GridLocaleText } from '@material-ui/data-grid';

export interface Instance {
  zoneId: string;
}

export interface ShortInfo {
  name: string;
  projectShortName: string;
  project: string;
  editable?: boolean;
}

export interface Dictionary {
  id: number;
  canCreateLookup: boolean;
  editable: boolean;
  project: string;
  name: string;
  instances: Instance[];
}

export interface Lookup {
  dictionary: string;
  keyColumn: string;
  valueColumn: string;
}

export interface LookupQuota {
  projectShortName: string;
  currentCount: number;
  maxCount: number;
}

export interface DictionaryQuota {
  projectShortName: string;
  currentSizeBytes: number;
  maxSizeBytes: number;
}

export const LOCAL_TEXT: GridLocaleText = {
  // Root
  rootGridLabel: 'grid',
  noRowsLabel: 'Справочник пуст',
  noResultsOverlayLabel: 'По Вашему запросу ничего не найдено.',
  errorOverlayDefaultLabel: 'Обнаружена ошибка.',

  // Density selector toolbar button text
  toolbarDensity: 'Высота строки',
  toolbarDensityLabel: 'Высота строки',
  toolbarDensityCompact: 'Компактная',
  toolbarDensityStandard: 'Стандартная',
  toolbarDensityComfortable: 'Комфортная',

  // Columns selector toolbar button text
  toolbarColumns: 'Столбцы',
  toolbarColumnsLabel: 'Выбрать столбцы',

  // Filters toolbar button text
  toolbarFilters: 'Фильтры',
  toolbarFiltersLabel: 'Показать фильтры',
  toolbarFiltersTooltipHide: 'Скрыть фильтры',
  toolbarFiltersTooltipShow: 'Показать фильтры',
  toolbarFiltersTooltipActive: (count) => {
    let pluralForm = 'активных фильтров';
    const lastDigit = count % 10;

    if (lastDigit > 1 && lastDigit < 5) {
      pluralForm = 'активных фильтра';
    } else if (lastDigit === 1) {
      pluralForm = 'активный фильтр';
    }

    return `${count} ${pluralForm}`;
  },

  // Export selector toolbar button text
  toolbarExport: 'Экспорт',
  toolbarExportLabel: 'Экпорт',
  toolbarExportCSV: 'Загрузить как CSV',

  // Columns panel text
  columnsPanelTextFieldLabel: 'Найти столбец',
  columnsPanelTextFieldPlaceholder: 'Заголовок столбца',
  columnsPanelDragIconLabel: 'Изменить порядок столбцов',
  columnsPanelShowAllButton: 'Показать все',
  columnsPanelHideAllButton: 'Скрыть все',

  // Filter panel text
  filterPanelAddFilter: 'Добавить фильтр',
  filterPanelDeleteIconLabel: 'Удалить',
  filterPanelOperators: 'Оператор',
  filterPanelOperatorAnd: 'и',
  filterPanelOperatorOr: 'или',
  filterPanelColumns: 'Столбцы',
  filterPanelInputLabel: 'Значение',
  filterPanelInputPlaceholder: 'Значение фильтра',

  // Filter operators text
  filterOperatorContains: 'содержит',
  filterOperatorEquals: 'равен',
  filterOperatorStartsWith: 'начинается с',
  filterOperatorEndsWith: 'заканчивается на',
  filterOperatorIs: 'равен',
  filterOperatorNot: 'не равен',
  filterOperatorAfter: 'больше чем',
  filterOperatorOnOrAfter: 'больше или равно',
  filterOperatorBefore: 'меньше чем',
  filterOperatorOnOrBefore: 'меньше или равно',

  // Filter values text
  filterValueAny: 'любой',
  filterValueTrue: 'истина',
  filterValueFalse: 'ложь',

  // Column menu text
  columnMenuLabel: 'Меню',
  columnMenuShowColumns: 'Показать столбцы',
  columnMenuFilter: 'Фильтр',
  columnMenuHideColumn: 'Скрыть',
  columnMenuUnsort: 'Отменить сортировку',
  columnMenuSortAsc: 'Сортировать по возрастанию',
  columnMenuSortDesc: 'Сортировать по убыванию',

  // Column header text
  columnHeaderFiltersTooltipActive: (count) => {
    let pluralForm = 'активных фильтров';
    const lastDigit = count % 10;

    if (lastDigit > 1 && lastDigit < 5) {
      pluralForm = 'активных фильтра';
    } else if (lastDigit === 1) {
      pluralForm = 'активный фильтр';
    }

    return `${count} ${pluralForm}`;
  },
  columnHeaderFiltersLabel: 'Показать фильтры',
  columnHeaderSortIconLabel: 'Сортировать',

  // Rows selected footer text
  footerRowSelected: (count) => {
    let pluralForm = 'строк выбрано';
    const lastDigit = count % 10;

    if (lastDigit > 1 && lastDigit < 5) {
      pluralForm = 'строки выбраны';
    } else if (lastDigit === 1) {
      pluralForm = 'строка выбрана';
    }

    return `${count} ${pluralForm}`;
  },

  // Total rows footer text
  footerTotalRows: 'Всего строк:',

  // Checkbox selection text
  checkboxSelectionHeaderName: 'Выбор флажка',

  // Boolean cell text
  booleanCellTrueLabel: 'истина',
  booleanCellFalseLabel: 'ложь',
};

export interface DictionaryEstimateResponse {
  blockers: string[];
  warnings: string[];
  quotaAllowed: boolean;
}

export interface LookupEstimateResponse {
  currentCount: number;
  currentCountInDictionary: number;
  maxCount: number;
  directUsage: boolean;
  blockers: string[];
  warnings: string[];
  quotaAllowed: boolean;
}
