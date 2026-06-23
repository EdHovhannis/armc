import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { createStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { ShortArchiveTask } from '../../store/archive/Types';
import { AnalyticConstraint, ArchiveConstraint, ConstraintType, FulltextConstraint, ProjectConstraint } from '../../store/constraint/Types';
import { DruidSupervisorInfo } from '../../store/monitoring/Types';
import { PipelineShort } from '../../store/pipeline/Types';
import { Project } from '../../store/project/Types';
import ConfirmDialog from '../ConfirmDialog';

import { ConstraintServiceTable } from './utils/ConstraintServiceTable';

const styles = () =>
  createStyles({
    resizable: {
      position: 'relative',
      '& .react-resizable-handle': {
        position: 'absolute',
        width: 20,
        height: 20,
        bottom: 0,
        right: 0,
        background:
          "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+')",
        'background-position': 'bottom right',
        padding: '0 3px 3px 0',
        'background-repeat': 'no-repeat',
        'background-origin': 'content-box',
        'box-sizing': 'border-box',
        cursor: 'se-resize',
      },
    },
  });

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-constraint-create" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface AddNewConstraintDialogProps {
  close: () => void;
  fetchConstraintForObject: (taskId: number, type: ConstraintType, okCallback?, errorCallback?) => void;
  fetchConstraintForProject: (projectShortName: string, okCallback?, errorCallback?) => void;
  updateConstraintOnObject: (
    taskId: number,
    type: ConstraintType,
    patch: any,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) => void;
  updateConstraintOnProject: (
    projectShortName: string,
    type: ConstraintType,
    patch: any,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) => void;
  displayError: (errorMessage: string) => void;
  displayInfo: (info: string) => void;
  projects: Project[];
  archives: ShortArchiveTask[];
  analyticTasks: DruidSupervisorInfo[];
  fulltextTasks: PipelineShort[];
}

export interface AddNewConstraintDialogStat {
  constraint?: ArchiveConstraint | AnalyticConstraint | FulltextConstraint | ProjectConstraint;
  type?: ConstraintType;
  types: ConstraintType[];
  archive?: ShortArchiveTask;
  project?: Project;
  fulltextTask?: PipelineShort;
  analyticTask?: DruidSupervisorInfo;
  idObjectSelected: boolean;
  isConstraintEdit: boolean;
  confirmSave: boolean;
  confirmRedirectToDefault: boolean;
  confirmClose: boolean;
}

class AddNewConstraintDialog extends React.Component<AddNewConstraintDialogProps, AddNewConstraintDialogStat> {
  constructor(props) {
    super(props);
    const types: Array<ConstraintType> = new Array<ConstraintType>();
    for (const type in ConstraintType) {
      if (ConstraintType[type] !== ConstraintType.cluster && ConstraintType[type] !== ConstraintType.analytic) {
        types.push(type as ConstraintType);
      }
    }
    this.state = {
      types: types,
      idObjectSelected: false,
      isConstraintEdit: false,
      confirmSave: false,
      confirmRedirectToDefault: false,
      confirmClose: false,
    };
    this.handleConfirmSaveDialogClose = this.handleConfirmSaveDialogClose.bind(this);
    this.handleConfirmRedirectToDefaultDialogClose = this.handleConfirmRedirectToDefaultDialogClose.bind(this);
    this.handleConfirmCloseDialogClose = this.handleConfirmCloseDialogClose.bind(this);
  }

  handleConfirmSaveDialogClose(value) {
    this.setState({ confirmSave: false });
    if (value === 'Ok') {
      this.props.close();
    }
  }

  handleConfirmCloseDialogClose(value) {
    this.setState({ confirmClose: false });
    if (value === 'Ok') {
      this.props.close();
    }
  }

  handleConfirmRedirectToDefaultDialogClose(value) {
    this.setState({ confirmRedirectToDefault: false });
    if (value === 'Ok') {
      const pathname = window.location.pathname.replace('/overloaded', '');
      window.open(pathname, '_blank');
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Dialog
          open={true}
          onClose={(e) => {
            this.setState({ confirmClose: true });
          }}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-constraint-create"
        >
          <ResizableBox
            width={1100}
            // height={this.props.type === ConstraintType.project? 660 : this.props.type === ConstraintType.archive? 290 : 405}
            // width={'ss'}
            height={'ss'}
            className={classes.resizable}
          >
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-constraint-create">
              <Grid container direction="row" justifyContent="space-between" alignItems="center">
                <Grid item>Переопределить значения ограничений</Grid>
                <Grid item>
                  <Button
                    color={'primary'}
                    variant={'text'}
                    onClick={(event) => {
                      this.setState({ confirmRedirectToDefault: true });
                    }}
                  >
                    Изменить значения по умолчанию
                  </Button>
                </Grid>
              </Grid>
            </DialogTitle>
            <DialogContent>
              <Autocomplete
                id="chose-type-of-index-for-constraint"
                fullWidth
                defaultValue={ConstraintType[this.state.type]}
                options={this.state.types.map((option) => option)}
                getOptionLabel={(option) => ConstraintType[option]}
                renderOption={(option) => ConstraintType[option]}
                onChange={(e, newValue: ConstraintType) => {
                  this.setState({
                    idObjectSelected: false,
                    type: newValue,
                  });
                }}
                renderInput={(params) => <TextField {...params} label="Тип объекта" variant="standard" />}
              />
              {ConstraintType[this.state.type] === ConstraintType.analytic && (
                <Autocomplete
                  id="chose-analytic-task-for-constraint"
                  fullWidth
                  noOptionsText={'Объектов не найдено'}
                  style={{ marginTop: 4 }}
                  defaultValue={this.state.analyticTask}
                  options={this.props.analyticTasks}
                  getOptionLabel={(option: DruidSupervisorInfo) =>
                    this.props.projects.filter((project) => project.id === option.info.projectId)[0].shortName + '/' + option.info.datasource
                  }
                  renderOption={(option: DruidSupervisorInfo) =>
                    this.props.projects.filter((project) => project.id === option.info.projectId)[0].shortName + '/' + option.info.datasource
                  }
                  onChange={(e, newValue: DruidSupervisorInfo) => {
                    if (newValue == null) {
                      this.setState({
                        analyticTask: newValue,
                        idObjectSelected: false,
                      });
                    } else {
                      this.props.fetchConstraintForObject(newValue.info.id, ConstraintType.analytic, (constraint) => {
                        this.setState({
                          analyticTask: newValue,
                          idObjectSelected: true,
                          constraint: constraint,
                        });
                      });
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label="Название аналитического индекса" variant="standard" />}
                />
              )}
              {ConstraintType[this.state.type] === ConstraintType.fulltext && (
                <Autocomplete
                  id="chose-fulltext-tasks-for-constraint"
                  fullWidth
                  noOptionsText={'Объектов не найдено'}
                  style={{ marginTop: 4 }}
                  defaultValue={this.state.fulltextTask}
                  options={this.props.fulltextTasks}
                  getOptionLabel={(option: PipelineShort) => option.project + '/' + option.name}
                  renderOption={(option: PipelineShort) => option.project + '/' + option.name}
                  onChange={(e, newValue: PipelineShort) => {
                    if (newValue == null) {
                      this.setState({
                        fulltextTask: newValue,
                        idObjectSelected: false,
                      });
                    } else {
                      this.props.fetchConstraintForObject(newValue.id, ConstraintType.fulltext, (constraint) => {
                        this.setState({
                          fulltextTask: newValue,
                          idObjectSelected: true,
                          constraint: constraint,
                        });
                      });
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label="Название полнотекстового индекса" variant="standard" />}
                />
              )}
              {ConstraintType[this.state.type] === ConstraintType.project && (
                <Autocomplete
                  id="chose-project-for-constraint"
                  fullWidth
                  noOptionsText={'Объектов не найдено'}
                  style={{ marginTop: 4 }}
                  defaultValue={this.state.project}
                  options={this.props.projects}
                  getOptionLabel={(option: Project) => option.shortName}
                  renderOption={(option) => option.shortName}
                  onChange={(e, newValue: Project) => {
                    if (newValue == null) {
                      this.setState({
                        project: newValue,
                        idObjectSelected: false,
                      });
                    } else {
                      this.props.fetchConstraintForProject(newValue.shortName, (constraint) => {
                        this.setState({
                          project: newValue,
                          idObjectSelected: true,
                          constraint: constraint,
                        });
                      });
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label="Название проекта" variant="standard" />}
                />
              )}
              {ConstraintType[this.state.type] === ConstraintType.archive && (
                <Autocomplete
                  id="chose-archive-for-constraint"
                  fullWidth
                  noOptionsText={'Объектов не найдено'}
                  defaultValue={this.state.archive}
                  options={this.props.archives}
                  style={{ marginTop: 4 }}
                  getOptionLabel={(option: ShortArchiveTask) => option.project + '/' + option.name}
                  renderOption={(option: ShortArchiveTask) => option.project + '/' + option.name}
                  onChange={(e, newValue: ShortArchiveTask) => {
                    if (newValue == null) {
                      this.setState({
                        archive: newValue,
                        idObjectSelected: false,
                      });
                    } else {
                      this.props.fetchConstraintForObject(newValue.id, ConstraintType.archive, (constraint) => {
                        this.setState({
                          archive: newValue,
                          idObjectSelected: true,
                          constraint: constraint,
                        });
                      });
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label="Название архивного индекса" variant="standard" />}
                />
              )}
              <div style={{ display: 'flex', width: '100%', marginTop: 16, justifyContent: 'center' }}>
                {this.state.idObjectSelected && (
                  <ConstraintServiceTable
                    onPatchChanges={(type, patch, constraint) => {
                      if (ConstraintType[this.state.type] === ConstraintType.project) {
                        this.props.updateConstraintOnProject(
                          this.state.project?.shortName,
                          type,
                          patch,
                          () => {
                            this.setState({ constraint: constraint });
                          },
                          (error) => {
                            this.props.displayError(error);
                          },
                        );
                      } else {
                        let projectId, taskId;
                        switch (ConstraintType[this.state.type]) {
                          case ConstraintType.archive:
                            projectId = this.state.archive?.project;
                            taskId = this.state.archive?.id;
                            break;
                          case ConstraintType.fulltext:
                            projectId = this.state.fulltextTask?.projectShortName;
                            taskId = this.state.fulltextTask?.id;
                            break;
                          case ConstraintType.analytic:
                            projectId = this.state.analyticTask?.info.projectId;
                            taskId = this.state.analyticTask?.info.id;
                            break;
                        }
                        this.props.updateConstraintOnObject(
                          taskId,
                          type,
                          patch,
                          () => {
                            this.setState({ constraint: constraint });
                          },
                          (error) => {
                            this.props.displayError(error);
                          },
                        );
                      }
                    }}
                    isEdit={(isEdit) => {
                      this.setState({ isConstraintEdit: isEdit });
                    }}
                    displayError={this.props.displayError}
                    constraint={this.state.constraint}
                    type={ConstraintType[this.state.type]}
                  />
                )}
              </div>
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button
                onClick={(e) => {
                  if (this.state.isConstraintEdit) {
                    this.setState({ confirmSave: true });
                    return;
                  }
                  this.props.close();
                }}
                color="primary"
              >
                Закрыть
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>

        <ConfirmDialog
          warningText={'Введенное Вам значение еще не подтверждено. Вы уверены, что хотите закрыть диалоговое окно?'}
          open={this.state.confirmSave}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmSaveDialogClose}
        />

        <ConfirmDialog
          warningText={'Вы уверены, что хотите закрыть окно?'}
          open={this.state.confirmClose}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmCloseDialogClose}
        />

        <ConfirmDialog
          warningText={
            this.state.isConstraintEdit
              ? 'Введенное Вам значение еще не подтверждено. Вы уверены, что хотите перейти на вкладку с ограничениями по умолчанию?'
              : 'Для изменения значений по умолчанию, Вы должны перейти на другую страницу. Страница откроется в новой вкладке.' +
                'Вы уверены, что хотите открыть страницу с ограничениями по умолчанию?'
          }
          open={this.state.confirmRedirectToDefault}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmRedirectToDefaultDialogClose}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(AddNewConstraintDialog);
