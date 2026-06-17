import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import FilterDrawerBody from './FilterDrawerBody';
import { mapFormToArchiveFilters } from './mapFilters';
import { $filterDrawerOpen, onApplyArchiveFilters, onChangeFilterDrawerOpen, onResetArchiveFilters } from './model';
import * as styles from './styles.module.css';
import { FilterFormValues } from './types';

const DEFAULT_VALUES: FilterFormValues = {
  configuration: { operator: 'IN', values: [] },
  projectKey: { operator: 'IN', values: [] },
  status: { operator: 'IN', values: [] },
  labels: { operator: 'IN', values: [] },
  zone: { operator: 'IS', value: '' },
  configVersion: { operator: 'IS', value: '' },
  processingSpeed: { operator: '>=', value: '' },
  maxWriteSpeed: { operator: 'IN', from: '', to: '', unit: 'B/s' },
  maxIndexSize: { operator: 'IN', from: '', to: '', unit: 'B' },
  maxRetention: { operator: 'IN', from: '', to: '', unit: 'сек' },
};

const FilterDrawer: FC = () => {
  const [open, onChangeFilterDrawerOpenFn, applyFilters, resetFilters] = useUnit([
    $filterDrawerOpen,
    onChangeFilterDrawerOpen,
    onApplyArchiveFilters,
    onResetArchiveFilters,
  ]);
  const form = useForm<FilterFormValues>({ defaultValues: DEFAULT_VALUES });

  const handleClose = () => onChangeFilterDrawerOpenFn(false);

  const handleReset = () => {
    form.reset(DEFAULT_VALUES);
    resetFilters();
  };

  const onSubmit = form.handleSubmit((data) => {
    applyFilters(mapFormToArchiveFilters(data));
    handleClose();
  });

  return (
    <Drawer open={open} onClose={handleClose} width={520}>
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
