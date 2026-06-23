import { MenuItem, Select, TextField, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { withStyles, createStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { Component } from 'react';
import * as React from 'react';

import { DruidSupervisorInfo } from '../../../store/monitoring/Types';
import { Project } from '../../../store/project/Types';
import WaitingDialog from '../../WaitingDialog';
import JournalLoader from '../../loader/JournalLoader';

const styles = (theme) =>
  createStyles({
    createContainer: {
      display: 'flex',
      flexDirection: 'column' as any,
      width: 300,
      justifyContent: 'space-between',
      padding: 16,
    },
    paramContainer: {
      display: 'flex',
      flexDirection: 'row' as any,
      justifyContent: 'space-between',
      marginTop: 8,
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'row' as any,
      alignContent: 'flex-end',
    },
    supervisorSelector: {
      marginBottom: 8,
      width: '100%',
    },
  });

export interface TracingCreateDialogProps {
  isProjectsLoading: boolean;
  isSupervisorsLoading: boolean;
  projects: Project[] | undefined;
  supervisors: Array<DruidSupervisorInfo> | undefined;
}

export interface TracingCreateDialogDispatchProps {
  onCreate: (
    name: string,
    projectId: number,
    traceSupervisorId: number,
    callsSupervisorId: number | undefined,
    treeSupervisorId: number | undefined,
    callback: () => void,
    errorCallback: (msg) => void,
  ) => void;
  fetchProjects: () => void;
  fetchSupervisors: () => void;
}

export interface TracingCreateDialogParentProps {
  isOpen: boolean;
  onDialogClose: () => void;
  onCreateSuccess: () => void;
}

interface TracingCreateDialogState {
  name: string;
  projectId: number;
  waitForCreating: boolean;
  completeCreate: boolean;
  successCreate: boolean;
  error?: any;
  traceSupervisorId: number;
  callsSupervisorId: number | undefined;
  treeSupervisorId: number | undefined;
}

class TracingDatasourceCreateDialog extends Component<
  TracingCreateDialogProps & TracingCreateDialogParentProps & TracingCreateDialogDispatchProps,
  TracingCreateDialogState
> {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      projectId: -1,
      traceSupervisorId: -1,
      waitForCreating: false,
      successCreate: false,
      completeCreate: false,
      callsSupervisorId: undefined,
      treeSupervisorId: undefined,
    };

    this.props.fetchSupervisors();
    this.props.fetchProjects();
  }

  render(): React.ReactNode {
    const isLoading = this.props.isProjectsLoading || this.props.isSupervisorsLoading;
    return (
      <Dialog open={this.props.isOpen} onClose={this.props.onDialogClose}>
        {!isLoading && this.renderForm()}
        {isLoading && <JournalLoader />}
      </Dialog>
    );
  }

  renderForm(): React.ReactNode {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className={classes.createContainer}>
          <div>
            <Typography variant="h6" style={{ width: '100%' }}>
              Параметры датасорса
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              label="Имя датасорса"
              defaultValue={this.state.name}
              style={{ marginTop: 4 }}
              onChange={(e) => {
                this.setState({ name: e.target.value });
              }}
            />
            <div>
              <Typography variant="h6" style={{ width: '100%' }}>
                Родительский проект
              </Typography>
              <Autocomplete
                id="projectId"
                options={this.props.projects || []}
                getOptionLabel={(option: Project) => option.name}
                fullWidth
                style={{ marginTop: 4 }}
                onChange={(event, newValue: Project) => {
                  this.setState({
                    projectId: newValue.id,
                  });
                }}
                renderInput={(params) => <TextField {...params} label="Проект" variant="outlined" />}
              />
            </div>
            <div>
              <Typography variant="h6" style={{ width: '100%' }}>
                Таблицы с трейсами
              </Typography>
              <Autocomplete
                id="traceSupervisorId"
                options={this.props.supervisors || []}
                getOptionLabel={(option: DruidSupervisorInfo) => option.info.datasource}
                fullWidth
                // style={{marginTop: 16, width: 'calc(100% - 100px)'}}
                onChange={(event, newValue: DruidSupervisorInfo) => {
                  this.setState({
                    traceSupervisorId: newValue.info.id,
                  });
                }}
                renderInput={(params) => <TextField {...params} label="" variant="outlined" />}
              />
              <Autocomplete
                id="callsSupervisorId"
                options={this.props.supervisors || []}
                getOptionLabel={(option: DruidSupervisorInfo) => option.info.datasource}
                fullWidth
                style={{ marginTop: 2 }}
                onChange={(event, newValue: DruidSupervisorInfo) => {
                  this.setState({
                    callsSupervisorId: newValue.info.id,
                  });
                }}
                renderInput={(params) => <TextField {...params} label="" variant="outlined" />}
              />
              <Autocomplete
                id="treeSupervisorId"
                options={this.props.supervisors || []}
                getOptionLabel={(option: DruidSupervisorInfo) => option.info.datasource}
                fullWidth
                style={{ marginTop: 2 }}
                onChange={(event, newValue: DruidSupervisorInfo) => {
                  this.setState({
                    treeSupervisorId: newValue.info.id,
                  });
                }}
                renderInput={(params) => <TextField {...params} label="" variant="outlined" />}
              />
            </div>
            <Button
              variant={'outlined'}
              color={'primary'}
              onClick={(e) => {
                const state: TracingCreateDialogState = this.state;

                this.setState({ waitForCreating: true, completeCreate: false, successCreate: false });
                this.props.onCreate(
                  state.name,
                  state.projectId,
                  state.traceSupervisorId,
                  state.callsSupervisorId,
                  state.treeSupervisorId,
                  () => {
                    this.setState({
                      completeCreate: true,
                      successCreate: true,
                    });
                    // this.props.onCreateSuccess();
                  },
                  (msg) => {
                    this.setState({
                      completeCreate: true,
                      successCreate: false,
                      error: msg,
                    });
                  },
                );
              }}
            >
              Создать
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              variant={'outlined'}
              color={'primary'}
              onClick={(e) => {
                this.props.onDialogClose();
              }}
            >
              Отмена
            </Button>
          </div>
        </div>
        <WaitingDialog
          customFormat={true}
          title={'Создание датасорса'}
          open={this.state.waitForCreating}
          onClose={() => {
            this.setState({ waitForCreating: false, error: undefined });
            if (this.state.successCreate) {
              this.props.onCreateSuccess();
            }
          }}
          complete={this.state.completeCreate}
          success={this.state.successCreate}
          successMessage={'Датасорс успешно создан'}
          errorMessage={'При создании датасорса произошла ошибка'}
          details={this.state.error}
          needDetailedInfo={true}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(TracingDatasourceCreateDialog);
