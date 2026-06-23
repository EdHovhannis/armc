import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { Autocomplete } from '@material-ui/lab';
import { debounce, DebouncedFunc } from 'lodash';
import * as React from 'react';

import { TaskType } from '../../../containers/index/IndexEditorView';
import PipelineService from '../../../services/PipelineService';
import { EstimatedIndexQuota, IndexQuota } from '../../../store/index/Types';
import { QuotaPipeline } from '../../../store/pipeline/Types';
import { ProjectWithRole } from '../../../store/project/Actions';
import { Project } from '../../../store/project/Types';
import { getWarningText } from '../../../utils/getWarningText';
import { WrongInput } from '../CreateIndexPage';

interface NameConfigItemProps {
  name: string;
  projectName: string;
  projectShortName: string;
  projects: Array<Project>;
  taskType: TaskType;
  estimatedQuota: EstimatedIndexQuota;
  replicationFactor: number;
  quota: QuotaPipeline;

  wrongInputChanged(wrongInput: WrongInput);

  fetchQuota(projectShortName: string, okCallback: (quota: IndexQuota) => void, errorCallback?: (error: string) => void): any;

  estimatedQuotaChanged(estimatedIndexQuota: EstimatedIndexQuota): any;

  nameChanged(name: string): any;

  projectNameChanged(projectName: string): any;

  projectShortNameChanged(projectShortName: string): any;
}

export class NameConfigItem extends React.Component<NameConfigItemProps> {
  private handleCheckIndexNameQuotaDebounced: DebouncedFunc<any> = debounce(() => {});
  constructor(props) {
    super(props);
    if (this.props.taskType === TaskType.import) {
      this.checkQuota(this.props.projectShortName);
    } else {
      this.props.wrongInputChanged(
        this.checkWrongInput(this.props.projectShortName, this.props.name, this.props.estimatedQuota.currentQuota, this.props.taskType),
      );
    }
    this.handleCheckIndexNameQuotaDebounced = debounce(this.handleCheckIndexNameQuota.bind(this), 300);
  }

  checkQuota(project) {
    if (project) {
      this.props.fetchQuota(
        project,
        (quotaIn) => {
          const quota: EstimatedIndexQuota = {
            currentQuota: quotaIn,
            plannedRate: 0,
            plannedVolume: 0,
            approximatedStoreTimeSec: 0,
            approximatedRealIndexSizeBytes: 0,
            quotaAllowed: true,
          };
          this.props.estimatedQuotaChanged(quota);
          this.props.wrongInputChanged(this.checkWrongInput(project, this.props.name, quotaIn, this.props.taskType));
        },
        (msg) => {
          const checkProjectName = this.props.projects.filter((project) => project.shortName === this.props.projectShortName)[0];
          const wrongInput: WrongInput = {
            wrongInput: true,
            message: checkProjectName ? 'У этого проекта нет квоты на индекс' : 'Проект не выбран',
          };
          this.props.wrongInputChanged(wrongInput);
        },
      );
    }
  }

  checkWrongInput(projectShortName, name, quota: IndexQuota, taskType: TaskType): WrongInput {
    const wrongInput: WrongInput = {
      wrongInput: false,
      message: '',
    };
    if (projectShortName === null || projectShortName === undefined || projectShortName === '') {
      wrongInput.wrongInput = true;
      wrongInput.message = 'Проект не выбран';
      return wrongInput;
    }

    if (name === null || name === undefined || name === '' || getWarningText(name)) {
      wrongInput.wrongInput = true;
      if (getWarningText(name)) {
        wrongInput.message = getWarningText(name);
        return wrongInput;
      }
      wrongInput.message = 'Не введено название индекса';
      return wrongInput;
    }

    if (quota == null || (quota.maxRate === 0 && quota.maxVolume === 0)) {
      wrongInput.wrongInput = true;
      wrongInput.message = 'У этого проекта нет квоты на индекс';
      return wrongInput;
    }

    if (taskType !== TaskType.update) {
      PipelineService.getPipelineInfo(projectShortName, name, () => {
        wrongInput.wrongInput = true;
        wrongInput.message = 'Полнотектовый индекс с таким именем уже существует.';
        return wrongInput;
      });
    }

    return wrongInput;
  }

  handleCheckIndexNameQuota(value) {
    this.props.wrongInputChanged(
      this.checkWrongInput(this.props.projectShortName, value, this.props.estimatedQuota.currentQuota, this.props.taskType),
    );
  }

  componentDidMount() {
    this.checkQuota(this.props.projectShortName);
  }

  render() {
    const { name, quota = {} } = this.props;
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
              const value = e.target.value;
              this.props.nameChanged(value);
              this.handleCheckIndexNameQuotaDebounced(value);
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
            onChange={(event, newValue: ProjectWithRole) => {
              this.props.projectNameChanged(newValue.name);
              this.props.projectShortNameChanged(newValue.shortName);
              // this.props.wrongInputChanged(this.checkWrongInput(newValue.shortName, this.props.name,this.props.estimatedQuota, this.props.taskType))
              if (this.props.taskType !== TaskType.update) {
                this.checkQuota(newValue.shortName);
              } else {
                this.props.checkQuota(
                  newValue.shortName,
                  quota.maxSizeBytes,
                  quota.maxDataRateBytesPerSec,
                  this.props.replicationFactor,
                  null,
                  (quotaIn) => {
                    this.props.estimatedQuotaChanged(quotaIn);
                    this.props.wrongInputChanged(this.checkWrongInput(this.props.projectShortName, this.props.name, quotaIn, this.props.taskType));
                  },
                  (msg) => {
                    const wrongInput: WrongInput = {
                      wrongInput: true,
                      message: 'У этого проекта нет квоты на индекс',
                    };
                    this.props.wrongInputChanged(wrongInput);
                  },
                );
              }
            }}
            renderInput={(params) => <TextField {...params} label="Проект" variant="outlined" />}
          />
        </Grid>
      </React.Fragment>
    );
  }
}
