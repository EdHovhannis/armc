import { Paper, Grid, LinearProgress, Typography, TextField, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { ShortArchiveTaskWithRole } from '@src/store/archive/Actions';
import { User } from '@src/store/auth/Types';
import { ConstraintType } from '@src/store/constraint/Types';
import { Utils } from '@src/utils/Utils';
import * as React from 'react';
import { useNavigate } from 'react-router';

import ArchiveCard from '../../components/archive/ArchiveCard';

import { FilterRow } from './components/FilterRow';

export interface TaskListProps {
  setState: (state: any) => void;
  user: User;
  availableZones: string[];
  listOfArchives: ShortArchiveTaskWithRole[];
  fetchConstraintForObject: (taskId: number, type: ConstraintType, okCallback?: any, errorCallback?: any) => void;
  fetchUserProjects: () => void;
  deleteHandler: (projectShortName: string, name: string) => void;
  navigate: ReturnType<typeof useNavigate>;
  downloadArchiveTask: (projectShortName: string, name: string) => void;
  page?: number;
  nameFilter?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  setState,
  user,
  availableZones,
  listOfArchives,
  fetchConstraintForObject,
  fetchUserProjects,
  deleteHandler,
  navigate,
  downloadArchiveTask,
  page,
  nameFilter,
}) => {
  if (!listOfArchives) {
    return null;
  }

  return (
    <>
      {listOfArchives?.map((archive) => {
        return (
          <Grid
            container
            style={{ width: '100%', marginTop: '1vw', margin: '1px' }}
            justifyContent="center"
            spacing={2}
            key={archive.name + archive.project + archive.id}
            alignItems="center"
            direction="row"
          >
            <ArchiveCard
              setConstraints={(archive) => {
                fetchConstraintForObject(archive.id, ConstraintType.archive, (constraint) => {
                  setState({
                    constraintDialogOpen: true,
                    constraintObject: archive,
                    constraintTitle: (
                      <React.Fragment>
                        Ограничения на индекс
                        <b>
                          {archive.project}/{archive.name}
                        </b>
                      </React.Fragment>
                    ),
                    currentConstraint: constraint,
                  });
                });
              }}
              onBlock={(archive) => {
                setState({
                  isBlockUserDialogOpen: true,
                  blockedObject: archive,
                });
              }}
              onLabels={(projectName, name, canEdit) => {
                setState({
                  isLabelDialogOpen: true,
                  labelCanEdit: canEdit,
                  labelProjectName: projectName,
                  labelName: name,
                });
              }}
              // перенесено выше, потому что была добавлена пагинация, мы получали обрезок данных и только потом фильтровали по статусам
              isShow={true}
              canEdit={archive.canEdit}
              projectName={archive.project}
              fetchUserProjects={fetchUserProjects}
              archive={archive}
              onDelete={deleteHandler}
              onUpdate={(projectShortName: string, name: string) => {
                navigate(`/archive/${name}`, {
                  state: { detail: projectShortName },
                });
              }}
              onDownload={(projectShortName: string, name: string) => {
                downloadArchiveTask(projectShortName, name);
              }}
              availableZones={availableZones}
              user={user}
              page={page}
              nameFilter={nameFilter}
            />
          </Grid>
        );
      })}
    </>
  );
};

export const FilterTextField = ({
  tabInstances,
  archives,
  isUpdating,
  nameFilter,
  setState,
  handleChangeSearch,
  user,
  projects,
  filter,
  isStatusesLoading,
  allLabels,
  availableZones,
  setArchiveFilter,
  displayError,
  page,
  setDebouncedState,
}) => {
  const [localValue, setLocalValue] = React.useState(nameFilter);

  React.useEffect(() => {
    setLocalValue(nameFilter);
  }, [nameFilter]);

  return (
    <Grid
      item
      style={{
        width: '90%',
        alignSelf: 'center',
        padding: 6,
        marginTop: -6,
        paddingTop: 0,
        marginBottom: !tabInstances ? 5 : 0,
      }}
    >
      <Paper elevation={1}>
        {isUpdating && <LinearProgress />}
        <Grid container direction={'row'}>
          <Grid
            item
            style={{
              width: '45%',
              paddingTop: 16,
              paddingLeft: 16,
              paddingBottom: 8,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {tabInstances ? 'Список конфигураций архивных индексов' : 'Список конфигураций задач архивной индексации'}
            </Typography>
          </Grid>
          <Grid item style={{ width: '50%', alignSelf: 'center', padding: 6 }}>
            <TextField
              label="Поиск"
              size="small"
              variant="outlined"
              value={localValue}
              fullWidth
              onChange={(ev) => {
                const val = ev.target.value;
                setLocalValue(val);
                setDebouncedState(val);
              }}
              style={{
                marginBottom: 10,
                backgroundColor: 'white',
                width: '100%',
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
        <FilterRow
          isAdmin={user.admin}
          archives={archives}
          projects={projects}
          filter={filter}
          isStatusesLoading={isStatusesLoading}
          allLabels={allLabels}
          availableZones={availableZones || []}
          onFilterChange={(filters) => {
            const labels = Utils.createArchiveFilters(filters);
            setState({
              filter: filters.length === 0 ? undefined : filters,
            });
            setArchiveFilter(filters.length === 0 ? undefined : filters, labels.length > 0);
          }}
          onResetOverdraft={() => {
            setState({ openDialogAllReset: true });
          }}
          onRefresh={() => setState({ isRefresh: true })}
        />
      </Paper>
    </Grid>
  );
};
