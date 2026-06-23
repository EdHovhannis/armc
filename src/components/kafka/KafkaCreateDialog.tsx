import { Accordion, AccordionSummary, AccordionDetails, MenuItem, TextField, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import withStyles from '@material-ui/core/styles/withStyles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Autocomplete } from '@material-ui/lab';
import { Component } from 'react';
import * as React from 'react';
import { connect } from 'react-redux';

import ClusterService from '../../services/ClusterService';
import { ApplicationState } from '../../store/Store';
import { Cluster } from '../../store/clusters/Types';
import * as featureSettingsSelectors from '../../store/featureSettings/Reducer';
import { KafkaLimitsProps } from '../../store/kafkaViewer/Types';
import { EditableProject, Project } from '../../store/project/Types';
import ConfirmDialog from '../ConfirmDialog';

import { KafkaLimitsComponent } from './components/KafkaLimits';

const styles = () => ({
  createContainer: {
    display: 'flex',
    flexDirection: 'column' as any,
    width: 700,
    justifyContent: 'space-between',
    padding: '20px 20px 10px',
  },
  paramContainer: {
    display: 'flex',
    flexDirection: 'row' as any,
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row' as any,
    alignContent: 'flex-end',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  accordion: {
    padding: 0,
    margin: '0 0 15px 0',
    boxShadow: 'none',
    '&:before': {
      display: 'none',
    },
  },
  block: {
    display: 'block',
    padding: 0,
  },
  kafkaTopicAdditionalCaptionText: {
    marginBottom: '8px',
    display: 'block',
  },
});

export interface KafkaCreateDialogProps {
  projects: Project[];
  editableProjects: EditableProject[];
  clusters: Cluster[];
}

export interface KafkaCreateDialogDispatchProps {
  onTopicCreate: (data: {
    name: string;
    partitions: number;
    replication: number;
    projectId: number;
    clusterId?: string;
    topicFullName?: string;
    successCallback: () => void;
    limits: KafkaLimitsProps;
  }) => void;
  displayError: (error: string) => void;
  enabledLimits: boolean;
}

export interface KafkaCreateDialogParentProps {
  isOpen: boolean;
  onDialogClose: () => void;
  onCreateSuccess: () => void;
}

type validationType = boolean | 'length' | 'regexp' | 'minlength';

interface KafkaCreateDialogState extends KafkaLimitsProps {
  name: string;
  partitions: number;
  replication: number;
  projectId: number;
  projectShortName: string;
  clusterId: number | null;
  clusters: Cluster[];
  topicFullName?: string;
  topicFullNameValidation: validationType;
  nameValidation: validationType;
  kafkaLimitsValidation: boolean;
  factorReplicasChange: boolean;
}

class KafkaCreateDialog extends Component<
  KafkaCreateDialogProps & KafkaCreateDialogParentProps & KafkaCreateDialogDispatchProps & { classes: Record<string, string> },
  KafkaCreateDialogState
> {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      partitions: 1,
      replication: 1,
      projectId: -1,
      projectShortName: '',
      clusterId: null,
      clusters: [],
      topicFullName: '',
      topicFullNameValidation: true,
      nameValidation: true,
      kafkaLimitsValidation: true,
      plannedRate: null,
      plannedRetentionTime: null,
      plannedVolume: null,
      retentionType: null,
      factorReplicasChange: false,
    };

    this.onValidationFields = this.onValidationFields.bind(this);
    this.onUpdateLimits = this.onUpdateLimits.bind(this);
    this.handleConfirmDialog = this.handleConfirmDialog.bind(this);
  }

  onValidationFields(isValid: boolean) {
    this.setState({ kafkaLimitsValidation: isValid });
  }

  onUpdateLimits(data: KafkaLimitsProps) {
    this.setState(data);
  }
  handleConfirmDialog(value: string) {
    if (value === 'Ok') {
      this.props.onTopicCreate({
        name: this.state.name,
        partitions: this.state.partitions,
        replication: this.state.replication,
        projectId: this.state.projectId,
        clusterId: this.state.clusterId?.toString(),
        topicFullName: typeof this.state.topicFullName === 'string' && this.state.topicFullName.length > 0 ? this.state.topicFullName : undefined,
        limits: {
          plannedRate: this.state.plannedRate,
          plannedVolume: this.state.plannedVolume,
          plannedRetentionTime: this.state.plannedRetentionTime,
          retentionType: this.state.retentionType,
        },
        successCallback: this.props.onCreateSuccess,
      });
      this.setState({ factorReplicasChange: false });
    } else {
      this.setState({ factorReplicasChange: false });
    }
  }

  render(): React.ReactNode {
    const { classes } = this.props;

    const availableProjects = this.props.projects;

    return (
      <>
        <Dialog open={this.props.isOpen} onClose={this.props.onDialogClose} maxWidth="md">
          <div className={classes.createContainer}>
            <Typography variant="h6" style={{ marginBottom: 15 }}>
              Параметры топика
            </Typography>
            <Autocomplete
              id="project"
              fullWidth={true}
              options={availableProjects}
              defaultValue={availableProjects.find((project) => project.id === this.state.projectId)}
              getOptionLabel={(option) => option.name}
              style={{ marginBottom: 15 }}
              onChange={(_, newValue: Project) => {
                this.setState({
                  projectId: newValue.id,
                  projectShortName: newValue.shortName,
                });
                ClusterService.getKafkaClustersByProject(
                  newValue.id,
                  (clusters) => this.setState({ clusters: clusters }),
                  (error) => this.props.displayError(error),
                );
              }}
              renderInput={(params) => <TextField {...params} label="Проект" variant="outlined" />}
            />
            <Autocomplete
              id="cluster"
              fullWidth={true}
              options={this.state.clusters}
              defaultValue={this.state.clusters?.find((cluster) => cluster.id === this.state.clusterId?.toString())}
              disabled={this.state.projectId === -1}
              getOptionLabel={(option) => option.name ?? ''}
              style={{ marginBottom: 15 }}
              onChange={(event, newValue: Cluster) => {
                this.setState({
                  clusterId: typeof newValue.id === 'number' ? newValue.id : null,
                });
              }}
              renderOption={(option) =>
                option.id && (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                )
              }
              renderInput={(params) => <TextField {...params} label="Кластер" variant="outlined" />}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Имя источника данных"
              error={['length', 'regexp'].includes(String(this.state.nameValidation))}
              helperText={
                this.state.nameValidation === 'length'
                  ? 'Вы ввели недопустимое количество символов. Разрешено использовать не менее 2 и не более 100 символов.'
                  : this.state.nameValidation === 'regexp'
                    ? 'Вы ввели недопустимые символы. Разрешено использовать заглавные и прописные буквы латинского алфавита, 0-9 и символы "-", "_" и "."'
                    : null
              }
              defaultValue={this.state.name}
              onChange={(e) => {
                const value = e.target.value;
                let validation: validationType = false;

                const result = value.match(/[a-zA-Z0-9.\-_]+/);

                if (result && result[0] === result?.input) {
                  // Вся строка подходит под регулярное выражение
                  validation = true;
                } else if (value.length) {
                  validation = 'regexp';
                }

                if (value.length < 2 || value.length > 100) validation = 'length';

                this.setState({
                  name: value,
                  nameValidation: validation,
                });
              }}
            />
            <Typography style={{ marginBottom: 15 }} variant="caption" color="textSecondary">
              Имя источника данных должно быть уникально для проекта
            </Typography>
            <TextField
              fullWidth
              style={{ marginBottom: 15 }}
              defaultValue={this.state.replication}
              label="Кол-во реплик"
              variant="outlined"
              onChange={(e) => {
                this.setState({ replication: parseInt(e.target.value) });
              }}
            />
            {this.props.enabledLimits && (
              <KafkaLimitsComponent
                projectName={this.state.projectShortName}
                clusterId={this.state.clusterId}
                replication={this.state.replication}
                partitions={this.state.partitions}
                displayError={this.props.displayError}
                onValidationFields={this.onValidationFields}
                onUpdateLimits={this.onUpdateLimits}
                hasPartition
              />
            )}
            {!this.props.enabledLimits && (
              <TextField
                fullWidth
                style={{ marginBottom: 15 }}
                defaultValue={this.state.partitions}
                variant="outlined"
                label="Кол-во партиций"
                onChange={(e) => {
                  this.setState({ partitions: parseInt(e.target.value) });
                }}
              />
            )}
            <Accordion square className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ padding: 0 }}>
                <Typography variant="subtitle1">Дополнительно</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.block}>
                <Typography variant="caption" color="textSecondary" className={classes.kafkaTopicAdditionalCaptionText}>
                  В этом поле можно указать желаемое имя для топика в кластере Kafka. В случае, если поле не заполнено, имя будет сгенерировано
                  автоматически.
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Имя топика Kafka"
                  defaultValue={this.state.topicFullName}
                  error={['length', 'regexp', 'minlength'].includes(String(this.state.topicFullNameValidation))}
                  helperText={
                    this.state.topicFullNameValidation === 'length'
                      ? 'Вы ввели недопустимое количество символов. Разрешено использовать не более 128 символов.'
                      : this.state.topicFullNameValidation === 'regexp'
                        ? 'Вы ввели недопустимые символы. Разрешено использовать заглавные и прописные буквы латинского алфавита, 0-9 и символы "-", "_" и "."'
                        : this.state.topicFullNameValidation === 'minlength'
                          ? 'Имя топика должно состоять хотя бы из 3 символов'
                          : null
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    let validation: validationType = false;

                    const result = value.match(/[a-zA-Z0-9._-]+/);
                    const firstSymbol = value.slice(0, 1);
                    const resultFirst = firstSymbol.match(/[a-zA-Z0-9_]+/);

                    if (
                      result &&
                      result[0] === result?.input && // Вся строка подходит под регулярное выражение
                      resultFirst &&
                      resultFirst[0] === firstSymbol // Первый символ подходит под регулярное выражение
                    ) {
                      validation = true;
                    } else if (value.length) {
                      validation = 'regexp';
                    }

                    if (value.length > 128) validation = 'length';
                    if (value.length < 3) validation = 'minlength';
                    if (value.length === 0) validation = true;

                    this.setState({
                      topicFullName: value,
                      topicFullNameValidation: validation,
                    });
                  }}
                />
              </AccordionDetails>
            </Accordion>
            <div className={classes.buttonContainer}>
              <Button
                variant="text"
                color="primary"
                disabled={
                  ['length', 'regexp', 'minlength'].includes(String(this.state.topicFullNameValidation)) ||
                  ['length', 'regexp'].includes(String(this.state.nameValidation)) ||
                  this.state.name === '' ||
                  !this.state.kafkaLimitsValidation
                }
                onClick={() => {
                  const minInSyncReplicas = this.state.clusters.find((c) => c.id === this.state.clusterId)?.minInSyncReplicas;
                  const replication = this.state.replication;
                  if (this.state.projectId === -1) {
                    this.props.displayError('Проект не выбран!');
                    return;
                  }
                  if (this.state.clusterId === null) {
                    this.props.displayError('Кластер не выбран!');
                    return;
                  }
                  if (this.state.kafkaLimitsValidation === false) {
                    this.props.displayError('Не правильно заполнены лимиты');
                    return;
                  }
                  if (minInSyncReplicas && Number(replication) < Number(minInSyncReplicas)) {
                    this.setState({ factorReplicasChange: true });
                    return;
                  }

                  this.props.onTopicCreate({
                    name: this.state.name,
                    partitions: this.state.partitions,
                    replication: this.state.replication,
                    projectId: this.state.projectId,
                    clusterId: this.state.clusterId.toString(),
                    topicFullName:
                      typeof this.state.topicFullName === 'string' && this.state.topicFullName.length > 0 ? this.state.topicFullName : undefined,
                    limits: {
                      plannedRate: this.state.plannedRate,
                      plannedVolume: this.state.plannedVolume,
                      plannedRetentionTime: this.state.plannedRetentionTime,
                      retentionType: this.state.retentionType,
                    },
                    successCallback: this.props.onCreateSuccess,
                  });
                }}
              >
                Создать
              </Button>
              <Button style={{ marginLeft: 8 }} variant="text" color="primary" onClick={this.props.onDialogClose}>
                Отмена
              </Button>
            </div>
          </div>
        </Dialog>
        <ConfirmDialog
          warningText={
            'Фактор репликации топика не соответствует параметру min.insync.replicas кластера. Возможны проблемы с отправкой данных в топик. Вы уверены?'
          }
          open={this.state.factorReplicasChange}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialog}
        />
      </>
    );
  }
}

function mapStateToProps(state: ApplicationState) {
  return {
    enabledLimits: featureSettingsSelectors.getEnableFeatureSettingLimits(state),
  };
}

export default connect(mapStateToProps, null)(withStyles(styles)(KafkaCreateDialog));
