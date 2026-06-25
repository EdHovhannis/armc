import { Button, Checkbox, Icon, LabelControl, Popover, Text, TextField } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useCallback, useMemo, useState } from 'react';

import { OptionItemType } from '@src/Shared/types/filter';

import { fetchArchivesFiltersFx } from '@src/Entities/Archives/api';
import { $archiveFilterValues } from '@src/Entities/Archives/model';

import { $appliedArchiveFilters, onApplyArchiveFilters } from '../FilterDrawer/model';

import { COLUMN_FILTER_POPOVER_Z_INDEX, useArchivesTablePortalContainer } from './ArchivesTablePortalContext';
import { getFieldFilterValues, getOptionsForField, removeFieldFromFilters, upsertFieldFilter } from './filterFieldUtils';
import * as styles from './styles.module.css';

interface ColumnHeaderMultiSelectFilterProps {
  title: string;
  field: string;
  options?: OptionItemType[];
}

const ColumnHeaderMultiSelectFilter: FC<ColumnHeaderMultiSelectFilterProps> = ({ title, field, options: staticOptions }) => {
  const [appliedFilters, applyFilters] = useUnit([$appliedArchiveFilters, onApplyArchiveFilters]);
  const [archiveFilterValues, fetchArchivesFilters] = useUnit([$archiveFilterValues, fetchArchivesFiltersFx]);
  const portalContainer = useArchivesTablePortalContainer();
  const [search, setSearch] = useState('');
  const [draftValues, setDraftValues] = useState<string[]>([]);

  const appliedValues = useMemo(() => getFieldFilterValues(appliedFilters, field), [appliedFilters, field]);

  const options = useMemo(() => {
    if (staticOptions?.length) {
      return staticOptions;
    }
    const fieldOptions = getOptionsForField(field, archiveFilterValues);
    return fieldOptions.length ? fieldOptions : appliedValues.map((value) => ({ value, label: value }));
  }, [appliedValues, archiveFilterValues, field, staticOptions]);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return options;
    }
    return options.filter((option) => option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query));
  }, [options, search]);

  const isActive = appliedValues.length > 0;

  const handleStateChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setDraftValues([...appliedValues]);
        setSearch('');
        fetchArchivesFilters();
      }
    },
    [appliedValues, fetchArchivesFilters],
  );

  const handleToggleValue = useCallback((value: string) => {
    setDraftValues((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }, []);

  const handleApply = useCallback(() => {
    applyFilters(upsertFieldFilter(appliedFilters, field, draftValues));
  }, [applyFilters, appliedFilters, draftValues, field]);

  const handleReset = useCallback(() => {
    setDraftValues([]);
    applyFilters(removeFieldFromFilters(appliedFilters, field));
  }, [applyFilters, appliedFilters, field]);

  return (
    <div className={styles.columnHeaderFilter}>
      <Text kind="textSn" className={styles.columnHeaderFilterTitle}>
        {title}
      </Text>
      <Popover
        placement="bottom-start"
        disabledArrow
        zIndex={COLUMN_FILTER_POPOVER_Z_INDEX}
        hideOnScroll={false}
        contentWrapperProps={{ className: styles.columnHeaderFilterPopover }}
        dropdownProps={{
          action: 'click',
          onStateChange: handleStateChange,
          disablePortal: false,
          zIndex: COLUMN_FILTER_POPOVER_Z_INDEX,
          container: portalContainer ?? undefined,
        }}
        description={
          <div className={styles.columnHeaderFilterMenu}>
            <TextField value={search} onChange={setSearch} placeholder="Поиск..." size="sm" prefix={<Icon.Search />} canClear />
            <div className={styles.columnHeaderFilterOptions}>
              {filteredOptions.length ? (
                filteredOptions.map((option) => (
                  <div key={option.value} className={styles.columnHeaderFilterOption}>
                    <LabelControl
                      label={option.label}
                      checked={draftValues.includes(option.value)}
                      onChange={() => handleToggleValue(option.value)}
                      control={<Checkbox />}
                    />
                  </div>
                ))
              ) : (
                <Text kind="bodyS" className={styles.columnHeaderFilterEmpty}>
                  Ничего не найдено
                </Text>
              )}
            </div>
          </div>
        }
        primaryButtonProps={{ text: 'Применить', onClick: handleApply, size: 'sm' }}
        secondaryButtonProps={{ text: 'Сбросить', onClick: handleReset, size: 'sm' }}
      >
        <Button.Icon
          size="xs"
          view="secondary"
          icon={<Icon.Filter />}
          aria-label={`Фильтр: ${title}`}
          className={isActive ? styles.columnHeaderFilterActive : styles.columnHeaderFilterButton}
        />
      </Popover>
    </div>
  );
};

export default ColumnHeaderMultiSelectFilter;
