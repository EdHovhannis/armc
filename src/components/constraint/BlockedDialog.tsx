import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  TextField,
  Typography,
  withStyles,
} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { createStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import CheckPVMUserContainer from '../../containers/users/pvm/CheckPVMUserContainer';
import { ShortArchiveTaskWithRole } from '../../store/archive/Actions';
import { ShortArchiveTask, ShortArchiveTaskWithId } from '../../store/archive/Types';
import { User } from '../../store/auth/Types';
import { ConstraintType } from '../../store/constraint/Types';
import { Group } from '../../store/group/Types';
import { FulltextTask } from '../../store/index/Types';
import { DruidSupervisorInfo } from '../../store/monitoring/Types';
import { PipelineShort } from '../../store/pipeline/Types';
import { Project } from '../../store/project/Types';
import { Unit } from '../../store/role/Types';
import ConfirmDialog from '../ConfirmDialog';

const styles = (theme) =>
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

enum OBJECT_TYPE {
  project = 'Проект',
  object = 'Объект',
}

const UnitOptions = [
  {
    title: 'Группа',
    field: Unit.GROUP,
  },
  {
    title: 'Пользователь',
    field: Unit.USER,
  },
];

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-block-set-edit" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface BlockedDialogDispatchProps {
  projects: Project[];
  archives: ShortArchiveTaskWithId[];
  analyticTasks: DruidSupervisorInfo[];
  fulltextTasks: FulltextTask[];

  displayError(errorMessage: string): any;
}

export interface BlockedDialogProps {
  users: User[];
  groups: Group[];
  isEdit: boolean;
  type?: ConstraintType;
  object?: ShortArchiveTask | PipelineShort | DruidSupervisorInfo;
  archive?: ShortArchiveTaskWithRole;
  project?: Project;
  fulltextTask?: PipelineShort;
  analyticTask?: DruidSupervisorInfo;
  pvmMode: boolean;

  close(): any;

  onClose(
    value: string,
    constraintType?: ConstraintType,
    isGlobal?: boolean,
    description?: string,
    subjectType?: Unit,
    subject?: User | Group,
    objectId?: number,
    projectId?: string,
    isProject?: boolean,
  ): any;
}

export interface BlockedDialogStat {
  user?: User;
  group?: Group;
  isGlobalBlock: boolean;
  objectType?: OBJECT_TYPE;
  unitType?: Unit;
  description?: string;
  type?: ConstraintType;
  types: ConstraintType[];
  archive?: ShortArchiveTask;
  project?: Project;
  fulltextTask?: FulltextTask;
  analyticTask?: DruidSupervisorInfo;
  objectId?: number;
  projectId?: string;
  object?: ShortArchiveTask | Project | PipelineShort | DruidSupervisorInfo;
  idObjectSelected: boolean;
  confirmSave: boolean;
  confirmRedirectToDefault: boolean;
  confirmClose: boolean;
}

class BlockedDialog extends React.Component<BlockedDialogProps & BlockedDialogDispatchProps, BlockedDialogStat> {
  constructor(props) {
    super(props);
    const types: Array<ConstraintType> = new Array<ConstraintType>();
    for (const type in ConstraintType) {
      if (ConstraintType[type] !== ConstraintType.project && ConstraintType[type] !== ConstraintType.cluster) {
        types.push(ConstraintType[type] as ConstraintType);
      }
    }
    this.state = {
      type: this.props.isEdit ? this.props.type : undefined,
      object: this.props.isEdit ? this.props.object : undefined,
      objectType: this.props.isEdit ? (this.props.type === ConstraintType.project ? OBJECT_TYPE.project : OBJECT_TYPE.object) : undefined,
      user: undefined,
      fulltextTask: this.props.fulltextTask
        ? this.props.fulltextTasks.filter(
            (task) => task.name === this.props.fulltextTask?.name && task.project === this.props.fulltextTask?.projectShortName,
          )[0]
        : undefined,
      archive: this.props.archive
        ? this.props.archives.filter((archive) => archive.name === this.props.archive?.name && archive.project === this.props.archive.project)[0]
        : undefined,
      analyticTask: this.props.analyticTask,
      project: this.props.project,
      objectId: this.props.isEdit
        ? this.props.type === ConstraintType.project
          ? undefined
          : this.props.type === ConstraintType.analytic
            ? this.props.object.info.id
            : this.props.type === ConstraintType.archive
              ? this.props.archive?.id
              : this.props.object.id
        : undefined,
      projectId: this.props.isEdit && this.props.type === ConstraintType.project ? this.props.object.shortName : undefined,
      types: types,
      isGlobalBlock: false,
      idObjectSelected: this.props.isEdit,
      confirmSave: false,
      confirmRedirectToDefault: false,
      confirmClose: false,
    };
    this.handleConfirmCloseDialogClose = this.handleConfirmCloseDialogClose.bind(this);
  }

  handleConfirmCloseDialogClose(value) {
    this.setState({ confirmClose: false });
    if (value === 'Ok') {
      this.props.close();
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
          aria-labelledby="draggable-dialog-block-set-edit"
        >
          <ResizableBox
            width={800}
            // height={this.state.allUsersCheck? 190 : 240}
            height={'sss'}
            className={classes.resizable}
          >
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-block-set-edit">
              Установка блокировки
            </DialogTitle>
            <DialogContent>
              {/*блок выбора индекса, глобальной блокировки или блокировки на объект/проект*/}
              <React.Fragment>
                <Autocomplete
                  id="chose-type-of-index-for-block"
                  fullWidth
                  disabled={this.props.isEdit}
                  defaultValue={this.state.type}
                  options={this.state.types.map((option) => option)}
                  getOptionLabel={(option) => option}
                  renderOption={(option) => option}
                  onChange={(e, newValue: ConstraintType) => {
                    this.setState({
                      idObjectSelected: false,
                      type: newValue,
                      object: undefined,
                    });
                  }}
                  renderInput={(params) => <TextField {...params} label="Тип индекса" variant="standard" />}
                />
                {/*блок выбора пользователя или группы*/}
                <React.Fragment>
                  <Typography style={{ marginTop: 25 }} color="primary" display="block" variant="body1">
                    Выбор субъекта блокировки
                  </Typography>
                  <Divider style={{ marginBottom: 20 }} />
                  <React.Fragment>
                    <Autocomplete
                      id="chose-type-of-subject"
                      fullWidth
                      style={{ marginTop: 4 }}
                      defaultValue={UnitOptions.filter((option) => option.field === this.state.unitType)[0] || undefined}
                      options={UnitOptions}
                      getOptionLabel={(option) => option.title}
                      renderOption={(option) => option.title}
                      onChange={(e, newValue) => {
                        if (newValue == null) {
                          this.setState({
                            unitType: newValue.field,
                            user: undefined,
                            group: undefined,
                          });
                        } else {
                          this.setState({
                            unitType: newValue.field,
                            user: undefined,
                            group: undefined,
                          });
                        }
                      }}
                      renderInput={(params) => <TextField {...params} label="Тип субъекта" variant="standard" />}
                    />
                    {this.state.unitType === Unit.USER && !this.props.pvmMode && (
                      <Autocomplete
                        id="add-user-to-block-on-object"
                        fullWidth
                        options={this.props.users.map((option) => option)}
                        getOptionLabel={(option) => option.name}
                        renderOption={(option) => option.name}
                        onChange={(e, newValue: User) => {
                          this.setState({
                            user: newValue,
                          });
                        }}
                        renderInput={(params) => <TextField {...params} label="Выбрать пользователя для блокировки на объект" variant="standard" />}
                      />
                    )}
                    {this.state.unitType === Unit.USER && this.props.pvmMode && (
                      <CheckPVMUserContainer
                        choseUser={(user) => {
                          this.setState({ user: user });
                        }}
                      />
                    )}
                    {this.state.unitType === Unit.GROUP && (
                      <Autocomplete
                        id="add-group-to-block-on-object"
                        fullWidth
                        options={this.props.groups.map((option) => option)}
                        getOptionLabel={(option) => option.name}
                        renderOption={(option) => option.name}
                        onChange={(e, newValue: Group) => {
                          this.setState({
                            group: newValue,
                          });
                        }}
                        renderInput={(params) => <TextField {...params} label="Выбрать группу для блокировки на объект" variant="standard" />}
                      />
                    )}
                    <TextField
                      label="Причина блокировки"
                      margin="normal"
                      variant="standard"
                      fullWidth
                      multiline
                      helperText="Причина должна содержать от 5 до 100 символов"
                      error={!this.state.description || this.state.description?.length > 100 || this.state.description?.trim().length < 5}
                      defaultValue={this.state.description}
                      onChange={(e) => {
                        this.setState({ description: e.target.value });
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          color={'primary'}
                          name="globalBlock"
                          disabled={this.props.isEdit}
                          defaultChecked={this.state.isGlobalBlock}
                          checked={this.state.isGlobalBlock}
                          onChange={(e) => {
                            if (e.target.checked) {
                              this.setState({
                                isGlobalBlock: e.target.checked,
                              });
                            } else {
                              this.setState({
                                isGlobalBlock: e.target.checked,
                              });
                            }
                          }}
                        />
                      }
                      label="Глобальная блокировка субъекта"
                    />
                  </React.Fragment>
                </React.Fragment>
                {/*блок выбора самого объекта/проекта*/}
                {!this.state.isGlobalBlock && (
                  <React.Fragment>
                    <Typography style={{ marginTop: 25 }} color="primary" display="block" variant="body1">
                      Выбор объекта блокировки
                    </Typography>
                    <Divider style={{ marginBottom: 20 }} />
                    <Autocomplete
                      id="chose-type-of-block"
                      fullWidth
                      style={{ marginTop: 4 }}
                      disabled={this.props.isEdit}
                      defaultValue={this.state.objectType}
                      options={[OBJECT_TYPE.project, OBJECT_TYPE.object]}
                      getOptionLabel={(option: OBJECT_TYPE) => option}
                      renderOption={(option: OBJECT_TYPE) => option}
                      onChange={(e, newValue: OBJECT_TYPE) => {
                        if (newValue == null) {
                          this.setState({
                            objectType: newValue,
                            projectId: undefined,
                            objectId: undefined,
                            idObjectSelected: false,
                          });
                        } else {
                          this.setState({
                            objectType: newValue,
                            projectId: undefined,
                            objectId: undefined,
                            idObjectSelected: false,
                          });
                        }
                      }}
                      renderInput={(params) => <TextField {...params} label="Тип объекта" variant="standard" />}
                    />
                    {this.state.type === ConstraintType.analytic && !this.state.isGlobalBlock && this.state.objectType === OBJECT_TYPE.object && (
                      <Autocomplete
                        id="chose-analytic-task-for-block"
                        fullWidth
                        disabled={this.props.isEdit}
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
                              object: newValue,
                              objectId: undefined,
                              projectId: undefined,
                              idObjectSelected: false,
                            });
                          } else {
                            this.setState({
                              analyticTask: newValue,
                              object: newValue,
                              projectId: undefined,
                              objectId: newValue.info.id,
                              idObjectSelected: true,
                            });
                          }
                        }}
                        renderInput={(params) => <TextField {...params} label="Название аналитического индекса" variant="standard" />}
                      />
                    )}
                    {this.state.type === ConstraintType.fulltext && this.state.objectType === OBJECT_TYPE.object && !this.state.isGlobalBlock && (
                      <Autocomplete
                        id="chose-fulltext-tasks-for-block"
                        fullWidth
                        disabled={this.props.isEdit}
                        noOptionsText={'Объектов не найдено'}
                        style={{ marginTop: 4 }}
                        defaultValue={this.state.fulltextTask}
                        options={this.props.fulltextTasks}
                        getOptionLabel={(option: FulltextTask) => option.project + '/' + option.name}
                        renderOption={(option: FulltextTask) => option.project + '/' + option.name}
                        onChange={(e, newValue: FulltextTask) => {
                          if (newValue == null) {
                            this.setState({
                              fulltextTask: newValue,
                              object: newValue,
                              objectId: undefined,
                              projectId: undefined,
                              idObjectSelected: false,
                            });
                          } else {
                            this.setState({
                              fulltextTask: newValue,
                              object: newValue,
                              objectId: newValue.id,
                              projectId: undefined,
                              idObjectSelected: true,
                            });
                          }
                        }}
                        renderInput={(params) => <TextField {...params} label="Название полнотекстового индекса" variant="standard" />}
                      />
                    )}
                    {this.state.objectType === OBJECT_TYPE.project && !this.state.isGlobalBlock && (
                      <Autocomplete
                        id="chose-project-for-block"
                        fullWidth
                        disabled={this.props.isEdit}
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
                              object: newValue,
                              objectId: undefined,
                              projectId: undefined,
                              idObjectSelected: false,
                            });
                          } else {
                            this.setState({
                              project: newValue,
                              object: newValue,
                              objectId: undefined,
                              projectId: newValue.shortName,
                              idObjectSelected: true,
                            });
                          }
                        }}
                        renderInput={(params) => <TextField {...params} label="Название проекта" variant="standard" />}
                      />
                    )}
                    {this.state.type === ConstraintType.archive && this.state.objectType === OBJECT_TYPE.object && !this.state.isGlobalBlock && (
                      <Autocomplete
                        id="chose-archive-for-block"
                        fullWidth
                        disabled={this.props.isEdit}
                        noOptionsText={'Объектов не найдено'}
                        defaultValue={this.state.archive}
                        options={this.props.archives}
                        style={{ marginTop: 4 }}
                        getOptionLabel={(option: ShortArchiveTask) => option.project + '/' + option.name}
                        renderOption={(option: ShortArchiveTask) => option.project + '/' + option.name}
                        onChange={(e, newValue: ShortArchiveTaskWithId) => {
                          if (newValue == null) {
                            this.setState({
                              archive: newValue,
                              object: newValue,
                              objectId: undefined,
                              projectId: undefined,
                              idObjectSelected: false,
                            });
                          } else {
                            this.setState({
                              archive: newValue,
                              object: newValue,
                              objectId: newValue.id,
                              projectId: undefined,
                              idObjectSelected: true,
                            });
                          }
                        }}
                        renderInput={(params) => <TextField {...params} label="Название архивного индекса" variant="standard" />}
                      />
                    )}
                  </React.Fragment>
                )}
              </React.Fragment>
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button
                onClick={(e) => {
                  this.props.onClose('Cancel');
                  this.props.close();
                }}
                color="primary"
              >
                Отменить
              </Button>
              <Button
                onClick={(e) => {
                  if (!this.state.type) {
                    this.props.displayError('Тип индекса не выбран');
                    return;
                  }
                  if (this.state.unitType === Unit.USER && this.state.user == null) {
                    this.props.displayError('Пользователь не выбран!');
                    return;
                  }
                  if (this.state.unitType === Unit.GROUP && this.state.group == null) {
                    this.props.displayError('Группа не выбрана!');
                    return;
                  }
                  if (!this.state.unitType) {
                    this.props.displayError('Не выбран тип субъекта и субъект!');
                    return;
                  }
                  if (!this.state.idObjectSelected && !this.state.isGlobalBlock) {
                    this.props.displayError('Объект не выбран!');
                    return;
                  }
                  if (!this.state.description || this.state.description == '') {
                    this.props.displayError('Причина блокировки не введена!');
                    return;
                  }
                  if (this.state.description?.trim().length < 5) {
                    this.props.displayError('Причина не может содержать менее 5 символов');
                    return;
                  }
                  if (this.state.description?.length > 100) {
                    this.props.displayError('Причина не может содержать более 100 символов!');
                    return;
                  }
                  this.props.onClose(
                    'Ok',
                    this.state.type,
                    this.state.isGlobalBlock,
                    this.state.description,
                    this.state.unitType,
                    this.state.unitType === Unit.GROUP ? this.state.group : this.state.user,
                    this.state.objectId,
                    this.state.projectId,
                    this.state.objectType === OBJECT_TYPE.project,
                  );
                  this.props.close();
                }}
                variant={'contained'}
                color="primary"
              >
                Подтвердить
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>
        <ConfirmDialog
          warningText={'Вы уверены, что хотите закрыть окно?'}
          open={this.state.confirmClose}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmCloseDialogClose}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(BlockedDialog);
