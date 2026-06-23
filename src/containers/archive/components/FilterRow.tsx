import { IconButton, Avatar, Grid } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
import { ApplicationState } from '@src/store/Store';
import * as React from 'react';
import { useSelector } from 'react-redux';

import FilterMenu, { FilterMenuItem } from '../../../components/utils/FilterMenu';
import { ShortArchiveTaskWithRole } from '../../../store/archive/Actions';
import { ArchivalStatus } from '../../../store/archive/Types';
import { Project } from '../../../store/project/Types';
import { speedIcon } from '../../../utils/Utils';

interface FilterRowProps {
  isAdmin: boolean;
  archives: ShortArchiveTaskWithRole[];
  projects: Project[];
  filter: FilterMenuItem[] | undefined;
  isStatusesLoading: boolean;
  allLabels: string[];
  availableZones: string[];
  onFilterChange: (filters: FilterMenuItem[]) => void;
  onResetOverdraft: () => void;
  onRefresh: () => void;
}

export const FilterRow: React.FC<FilterRowProps> = ({ isAdmin, filter, onFilterChange, onResetOverdraft, onRefresh }) => {
  const { filterValues } = useSelector((state: ApplicationState) => state.archive);

  return (
    <Grid
      style={{ alignSelf: 'center', marginTop: -6, paddingBottom: 0 }}
      container
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
    >
      <Grid item style={{ width: `calc(100% - ${isAdmin ? '96px' : '99px'})` }}>
        <FilterMenu
          filter={filter}
          onChange={onFilterChange}
          columns={[
            {
              name: 'Название',
              field: 'name',
              variants: filterValues?.names,
            },
            {
              name: 'Проект',
              field: 'shortName',
              variants: filterValues?.projects.map((value: string) => {
                return {
                  name: value,
                  shortName: value,
                };
              }),
            },
            {
              name: 'Статус',
              field: 'status',
              variants: [
                ArchivalStatus.RUNNING,
                ArchivalStatus.STOPPED,
                ArchivalStatus.FAILED,
                ArchivalStatus.UNDEFINED,
                ArchivalStatus.WITHOUT_RESPONSE,
              ],
            },
            {
              name: 'Метки',
              field: 'label',
              variants: filterValues?.labels,
              onlyInOperator: true,
            },
            {
              name: 'Зона',
              field: 'zone',
              variants: filterValues?.zones,
            },
            {
              name: 'Версия',
              field: 'version',
              variants: ['Совпадает', 'Не совпадает'],
              onlyIsOperator: true,
            },
            {
              name: 'Скорость обработки (%)',
              field: 'overdraft',
              comparisonOperators: true,
            },
          ]}
        />
      </Grid>
      <Grid item style={{ width: '48px', marginTop: 6 }}>
        <IconButton onClick={onResetOverdraft}>
          <Avatar src={speedIcon} style={{ width: 24, height: 24 }} alt="Сбросить овердрафт" />
        </IconButton>
      </Grid>
      <Grid item style={{ width: '48px', marginTop: 6 }}>
        <IconButton onClick={onRefresh}>
          <Refresh id={'refreshButton'} color={'primary'} />
        </IconButton>
      </Grid>
    </Grid>
  );
};
