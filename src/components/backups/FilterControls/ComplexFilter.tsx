import { Badge, Grid, GridItem, Icon } from '@sds-eng/base';
import AppliedFiltersBar from '@src/components/backups/FilterControls/AppliedFiltersBar';
import FilterDrawer from '@src/components/backups/FilterControls/FilterDrawer';
import ToolbarButton from '@src/components/backups/FilterControls/ToolbarButton';
import FilterIcon from '@src/components/backups/FilterIcon';
import { FilterDefinition, FilterSelections } from '@src/components/backups/types';
import React, { useState } from 'react';

interface IComplexFilter {
  definitions: FilterDefinition[];
  selections: FilterSelections;
  onSelectionsChange: (selections: FilterSelections) => void;
  actionButtons?: React.ReactNode[];
  filterButtonPosition?: number;
}

const ComplexFilter: React.FC<IComplexFilter> = ({ definitions, selections, onSelectionsChange, actionButtons = [], filterButtonPosition = 0 }) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open);

  const getActionButtonsWithFilter = (): React.ReactNode[] => {
    const pos = Math.max(0, Math.min(filterButtonPosition as number, actionButtons.length));
    const result = [...actionButtons];
    result.splice(
      pos,
      0,
      <ToolbarButton key={'filter-button'} onClick={toggleDrawer(true)} icon={<FilterIcon content={selections.length} />} tooltip={'Фильтрация'} />,
    );
    return result;
  };

  return (
    <>
      <Grid nowrap justify={'flex-start'} style={{ padding: '6px' }} alignItems={'start'}>
        {/* Левая часть: строка с чипами выбранных фильтров */}
        <GridItem key={'filters-display'} style={{ textAlign: 'left' }}>
          <AppliedFiltersBar
            definitions={definitions}
            selections={selections}
            onDelete={(key: string) => {
              onSelectionsChange(selections.filter((s) => s.key !== key));
            }}
            onTruncate={() => onSelectionsChange([])}
          />
        </GridItem>

        {/* Правая часть: кнопка открытия настроек фильтров */}

        {/*Минимальный размер: 5 (кол-во иконок) x 40px (ширина иконки) + 10px */}
        <GridItem key={'filters-button'} xs={1} style={{ textAlign: 'right', minWidth: '210px' }}>
          {getActionButtonsWithFilter()}
        </GridItem>
      </Grid>
      {/* Выпадающий сайдбар с настройками фильтров */}
      <FilterDrawer
        open={drawerOpen}
        definitions={definitions}
        selections={selections}
        onClose={toggleDrawer(false)}
        onFilterSelectionsChange={onSelectionsChange}
      />
    </>
  );
};

export default ComplexFilter;
