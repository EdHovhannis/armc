import { Box, Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, Grid, GridItem } from '@sds-eng/base';
import React, { useEffect, useState } from 'react';

import { FilterDefinition, FilterSelections } from '../types';

import { FilterList } from './FilterList';

interface IFilterDrawer {
  open: boolean;
  definitions: FilterDefinition[];
  selections: FilterSelections;
  onClose: () => void;
  onFilterSelectionsChange: (selections: FilterSelections) => void;
}

const FilterDrawer: React.FC<IFilterDrawer> = ({ open, definitions, selections, onClose, onFilterSelectionsChange }) => {
  const [localSelections, setLocalSelections] = useState<FilterSelections>(selections);

  useEffect(() => setLocalSelections(selections), [selections]);

  const getSelection = (key: string) => localSelections.find((s) => s.key === key) || { key };
  const updateSelection = (key: string, updates: Partial<any>) => {
    const idx = localSelections.findIndex((s) => s.key === key);
    const updated = { ...getSelection(key), ...updates };
    const next = idx >= 0 ? [...localSelections] : [...localSelections, updated];
    if (idx >= 0) next[idx] = updated;
    setLocalSelections(next);
  };

  const applyFilters = () => {
    const validSelections = localSelections.filter((selection) => {
      const def = definitions.find((d) => d.key === selection.key);
      if (!def) return false;
      if (def.type === 'daterange') return selection.fromValue || selection.toValue;
      return selection.value && Array.isArray(selection.value) ? selection.value.length > 0 : selection.value !== null;
    });

    onFilterSelectionsChange(validSelections);
    onClose();
  };

  const resetFilters = () => {
    setLocalSelections([]);
  };

  return (
    <Drawer open={open} onClose={onClose} width="756px">
      <DrawerHeader
        closeButtonProps={{
          'aria-label': 'Close drawer',
        }}
        onClose={onClose}
      >
        Фильтр резервных копий
      </DrawerHeader>
      <DrawerBody>
        <Box style={{ width: '100%' }} onClick={(e) => e.stopPropagation()}>
          <FilterList definitions={definitions} updateSelection={updateSelection} currentSelections={localSelections} />
        </Box>
      </DrawerBody>
      <DrawerFooter>
        <Grid justify={'left'} style={{ width: '100%' }}>
          <Grid justify={'left'} columnSpacing={2}>
            <GridItem key={'apply-filters'}>
              <Button onClick={applyFilters} view="primary">
                Применить
              </Button>
            </GridItem>
            <GridItem key={'reset-filters'}>
              <Button onClick={resetFilters} view="secondary">
                Сбросить
              </Button>
            </GridItem>
          </Grid>
        </Grid>
      </DrawerFooter>
    </Drawer>
  );
};

export default FilterDrawer;
