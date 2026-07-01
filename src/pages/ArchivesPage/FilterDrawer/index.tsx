import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { fetchArchivesFiltersFx } from '@src/Entities/Archives/api';

import FilterDrawerBody from './FilterDrawerBody';
import { DEFAULT_FILTER_FORM_VALUES, mapArchiveFiltersToForm, mapFormToArchiveFilters } from './mapFilters';
import { $appliedArchiveFilters, $filterDrawerOpen, onApplyArchiveFilters, onChangeFilterDrawerOpen, onResetArchiveFilters } from './model';
import * as styles from './styles.module.css';
import { FilterFormValues } from './types';

const FilterDrawer: FC = () => {
  const [open, appliedFilters, onChangeFilterDrawerOpenFn, applyFilters, resetFilters, fetchArchivesFilters] = useUnit([
    $filterDrawerOpen,
    $appliedArchiveFilters,
    onChangeFilterDrawerOpen,
    onApplyArchiveFilters,
    onResetArchiveFilters,
    fetchArchivesFiltersFx,
  ]);

  useEffect(() => {
    if (open) {
      fetchArchivesFilters();
    }
  }, [fetchArchivesFilters, open]);

  const form = useForm<FilterFormValues>({ defaultValues: DEFAULT_FILTER_FORM_VALUES });

  useEffect(() => {
    form.reset(appliedFilters.length ? mapArchiveFiltersToForm(appliedFilters) : DEFAULT_FILTER_FORM_VALUES);
  }, [appliedFilters, form]);

  const handleClose = () => onChangeFilterDrawerOpenFn(false);

  const handleReset = () => {
    form.reset(DEFAULT_FILTER_FORM_VALUES);
    resetFilters();
  };

  const onSubmit = form.handleSubmit((data) => {
    applyFilters(mapFormToArchiveFilters(data));
    handleClose();
  });

  return (
    <Drawer open={open} onClose={handleClose} width={'50%'}>
      <DrawerHeader onClose={handleClose}>Фильтр</DrawerHeader>
      <DrawerBody>
        <FormProvider {...form}>
          <FilterDrawerBody />
        </FormProvider>
      </DrawerBody>
      <DrawerFooter>
        <div className={styles.filterDrawerFooter}>
          <Button onClick={onSubmit}>Применить</Button>
          <Button view="secondary" onClick={handleReset}>
            Сбросить
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
};

export default FilterDrawer;
