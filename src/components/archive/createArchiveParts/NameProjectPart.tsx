import { Grid, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { debounce, DebouncedFunc } from 'lodash';
import * as React from 'react';

import { TaskType } from '../../../containers/archive/ArchiveEditorView';
import ArchiveService from '../../../services/ArchiveService';
import { ArchivalQuota, ArchiveQuota } from '../../../store/archive/Types';
import { Project } from '../../../store/project/Types';
import { getWarningText } from '../../../utils/getWarningText';
import { WrongInput } from '../../index/CreateIndexPage';

interface NameProjectPartProps {
  name: string;
  projectName: string;
  projectShortName: string;
  projects: Array<Project>;
  taskType: TaskType;

  availableQuota: ArchivalQuota;
  quota: ArchiveQuota;

  wrongInputChanged(wrongInput: WrongInput);

  fetchQuota(projectShortName: string, okCallback: (quota: ArchivalQuota) => void, errorCallback?: (error: string) => void): any;

  availableQuotaChanged(availableQuota: ArchivalQuota): any;

  nameChanged(name: string): any;

  projectNameChanged(projectName: string): any;

  projectShortNameChanged(projectShortName: string): any;
}

export class NameProjectPart extends React.Component<NameProjectPartProps> {
  private handleCheckQuotaDebounced: DebouncedFunc<any> = debounce(() => {});
  constructor(props) {
    super(props);
    this.checkQuota(this.props.projectShortName);
    this.props.wrongInputChanged(this.checkWrongInput(this.props.projectShortName, this.props.name, this.props.taskType));
    // this.props.quota))
    this.handleCheckQuotaDebounced = debounce(this.handleCheckQuota.bind(this), 300);
  }

  checkQuota(project) {
    if (project) {
      this.props.fetchQuota(
        project,
        (quota) => {
          this.props.availableQuotaChanged(quota);
          this.props.wrongInputChanged(this.checkWrongInput(this.props.projectShortName, this.props.name, this.props.taskType));
        },
        (msg) => {
          const wrongInput: WrongInput = {
            wrongInput: true,
            message: 'У этого проекта нет квоты на архив',
          };
          this.props.wrongInputChanged(wrongInput);
        },
      );
    }
  }

  checkWrongInput(projectShortName: string, name: string, taskType: TaskType): WrongInput {
    const wrongInput: WrongInput = {
      wrongInput: false,
      message: '',
    };

    if (name === null || name === undefined || name == '' || getWarningText(name)) {
      wrongInput.wrongInput = true;
      if (getWarningText(name)) {
        wrongInput.message = getWarningText(name);
        return wrongInput;
      }
      wrongInput.message = 'Не введено название индекса';
      return wrongInput;
    }

    if (projectShortName === null || projectShortName === undefined || projectShortName === '') {
      wrongInput.wrongInput = true;
      wrongInput.message = 'Проект не выбран';
      return wrongInput;
    }

    if (taskType !== TaskType.update) {
      ArchiveService.getArchiveId(
        projectShortName,
        name,
        () => {
          wrongInput.wrongInput = true;
          wrongInput.message = 'Индекс с таким именем уже существует.';
          return wrongInput;
        },
        () => {},
      );
    }

    return wrongInput;
  }

  handleCheckQuota(value: string) {
    if (this.props.projectShortName) {
      this.checkQuota(this.props.projectShortName);
    } else {
      this.props.wrongInputChanged(this.checkWrongInput(this.props.projectShortName, value, this.props.taskType));
    }
  }

  render() {
    const { name } = this.props;
    const nameHelperText = getWarningText(name);
    return (
      <React.Fragment>
        <Grid container direction={'row'} justifyContent={'center'}>
          <TextField
            fullWidth
            variant="outlined"
            value={this.props.name}
            disabled={this.props.taskType === TaskType.update}
            label="Название индекса"
            style={{ width: 'calc(100% - 100px)', marginTop: 10 }}
            onChange={(e) => {
              this.props.nameChanged(e?.target.value);
              this.handleCheckQuotaDebounced(e.target.value);
            }}
            error={!!nameHelperText}
            helperText={nameHelperText}
          />
        </Grid>
        <Grid container direction={'row'} justifyContent={'center'}>
          <Autocomplete
            id="project"
            options={this.props.projects}
            disabled={this.props.taskType === TaskType.update}
            defaultValue={this.props.projects.filter((project) => project.shortName === this.props.projectShortName)[0]}
            getOptionLabel={(option) => option.name}
            style={{ marginTop: 16, width: 'calc(100% - 100px)' }}
            onChange={(event, newValue: Project) => {
              this.props.projectNameChanged(newValue.name);
              this.props.projectShortNameChanged(newValue.shortName);
              if (this.props.taskType !== TaskType.update) {
                this.checkQuota(newValue.shortName);
              } else {
                this.props.wrongInputChanged(this.checkWrongInput(newValue.shortName, this.props.name, this.props.taskType));
              }
            }}
            renderInput={(params) => <TextField {...params} label="Проект" variant="outlined" />}
          />
        </Grid>
      </React.Fragment>
    );
  }
}
