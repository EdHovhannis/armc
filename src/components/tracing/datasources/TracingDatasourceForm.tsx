import { MenuItem, Select, TextField, Typography } from '@material-ui/core';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Paper from '@material-ui/core/Paper';
import { withStyles, createStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { RouterProps } from 'react-router';

import PermissionUserView from '../../../containers/permissions/PermissionUserView';
import { DruidSupervisorInfo } from '../../../store/monitoring/Types';
import { Project } from '../../../store/project/Types';
import { Resource, Role } from '../../../store/role/Types';
import { TracingSupervisorDescription } from '../../../store/tracingDatasources/Types';
import { DoneFab } from '../../utils/DoneFab';

const styles = (theme) =>
  createStyles({
    parentContainer: {
      width: '100%',
      display: 'flex' as any,
      justifyContent: 'center',
    },
    formContainer: {
      display: 'flex' as any,
      flexDirection: 'column' as any,
      width: 600,
    },
    configContainer: {
      padding: 16,
    },
    parentProjectContainer: {
      padding: 16,
      marginTop: 16,
    },
    rolesContainer: {
      marginTop: 16,
    },
    supervisorSelector: {
      marginTop: 8,
      width: '100%',
    },
  });

export interface TracingDatasourceFormProps {
  id: number;
  datasource: TracingSupervisorDescription;
  projects: Array<Project>;
  supervisors: Array<DruidSupervisorInfo>;
  isLegacy: boolean;
}

export interface TracingDatasourceFormDispatchProps {
  onDatasourceUpdate: (id: number, name: string, traceSupervisorId: number, callsSupervisorId: number, treeSupervisorId: number) => void;
}

class TracingDatasourceForm extends React.Component<
  TracingDatasourceFormProps & TracingDatasourceFormDispatchProps & RouterProps,
  TracingSupervisorDescription
> {
  constructor(props) {
    super(props);

    const { datasource } = props;
    this.state = {
      id: datasource.id,
      name: datasource.name,
      projectId: datasource.projectId,
      traceSupervisorId: datasource.traceSupervisorId,
      callsSupervisorId: datasource.callsSupervisorId || -1,
      treeSupervisorId: datasource.treeSupervisorId || -1,
      canEdit: datasource.canEdit,
      canManageAccess: datasource.canManageAccess,
    };
  }

  render() {
    const canEdit: boolean = this.state.canEdit;
    const { classes } = this.props;
    return (
      <div className={classes.parentContainer}>
        <div className={classes.formContainer}>
          <Paper className={classes.configContainer}>
            <Typography variant="h6" style={{ width: '100%', color: 'rgba(0.0,0.0,0.0,0.54)' }}>
              Конфигурации источника трейсов
            </Typography>
            <TextField
              fullWidth
              label="Имя"
              defaultValue={this.state.name}
              disabled={!canEdit}
              onChange={(e) => {
                this.setState({ name: e.target.value });
              }}
            />
            <Select
              value={this.state.traceSupervisorId}
              fullWidth
              disabled={!canEdit}
              onChange={(e: any) => {
                this.setState({
                  traceSupervisorId: e.target.value,
                });
              }}
              className={classes.supervisorSelector}
              input={<OutlinedInput labelWidth={0} name="Проект" id="project-selector-id" />}
            >
              {this.props.supervisors
                .map((supervisor) => supervisor.info)
                .map((supervisor) => {
                  return (
                    <MenuItem value={supervisor.id} key={supervisor.id}>
                      {supervisor.datasource}
                    </MenuItem>
                  );
                })}
            </Select>
            <Select
              value={this.state.callsSupervisorId}
              fullWidth
              disabled={!canEdit}
              onChange={(e: any) => {
                this.setState({
                  callsSupervisorId: e.target.value,
                });
              }}
              className={classes.supervisorSelector}
              input={<OutlinedInput labelWidth={0} name="Проект" id="project-selector-id" />}
            >
              {this.props.supervisors
                .map((supervisor) => supervisor.info)
                .map((supervisor) => {
                  return (
                    <MenuItem value={supervisor.id} key={supervisor.id}>
                      {supervisor.datasource}
                    </MenuItem>
                  );
                })}
              <MenuItem value={-1} key={-1}>
                Отключено
              </MenuItem>
            </Select>
            <Select
              value={this.state.treeSupervisorId}
              fullWidth
              disabled={!canEdit}
              onChange={(e: any) => {
                this.setState({
                  treeSupervisorId: e.target.value,
                });
              }}
              className={classes.supervisorSelector}
              input={<OutlinedInput labelWidth={0} name="Проект" id="project-selector-id" />}
            >
              {this.props.supervisors
                .map((supervisor) => supervisor.info)
                .map((supervisor) => {
                  return (
                    <MenuItem value={supervisor.id} key={supervisor.id}>
                      {supervisor.datasource}
                    </MenuItem>
                  );
                })}
              <MenuItem value={-1} key={-1}>
                Отключено
              </MenuItem>
            </Select>
          </Paper>
          <Paper className={classes.parentProjectContainer}>
            <Typography variant="h6" style={{ width: '100%', color: 'rgba(0.0,0.0,0.0,0.54)' }}>
              Родительский проект
            </Typography>
            <TextField fullWidth value={this.props.projects.find((val) => val.id === this.state.projectId)?.name} disabled={true} />
          </Paper>
          {this.props.isLegacy && this.state.canManageAccess && (
            <div className={classes.rolesContainer}>
              <PermissionUserView
                canEditAccess={this.state.canManageAccess}
                resourceId={this.state.id}
                resource={Resource.TRACING}
                roles={[Role.TRACING_EDITOR, Role.ACCESS_MANAGER]}
                showSharedToggle
              />
            </div>
          )}
        </div>
        {canEdit && (
          <DoneFab
            onClick={(e) => {
              this.props.onDatasourceUpdate(
                this.state.id,
                this.state.name,
                this.state.traceSupervisorId,
                this.state.callsSupervisorId !== -1 ? this.state.callsSupervisorId : undefined,
                this.state.treeSupervisorId !== -1 ? this.state.treeSupervisorId : undefined,
              );
            }}
          />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(TracingDatasourceForm);
