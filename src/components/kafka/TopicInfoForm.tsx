import { Grid, TextField, Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';

import ClusterService from '../../services/ClusterService';
import { ApplicationState } from '../../store/Store';
import * as featureSettingsSelectors from '../../store/featureSettings/Reducer';
import { KafkaTopic } from '../../store/kafka/Types';
import { KafkaLimitsProps, KafkaRetentionType } from '../../store/kafkaViewer/Types';
import { Project } from '../../store/project/Types';
import { DoneFab } from '../utils/DoneFab';

import { KafkaLimitsComponent } from './components/KafkaLimits/KafkaLimits';

export interface TopicInfoFormProps {
  projects: Array<Project>;
}

export interface TopicInfoFormParentProps {
  initialTopic: KafkaTopic;
  isAdmin: boolean;
  canEdit: boolean;
}

export interface TopicInfoFormDispatchProps {
  handleTopicSubmit: (topic: KafkaTopic) => void;
  displayError: (message: string) => void;
  enabledLimits: boolean;
}

export interface TopicInfoFormState extends KafkaTopic {
  clusterName: string | number;
  kafkaLimitsValidation: boolean;
}

class TopicInfoForm extends React.Component<
  TopicInfoFormProps & TopicInfoFormParentProps & TopicInfoFormDispatchProps & KafkaLimitsProps,
  TopicInfoFormState
> {
  constructor(props) {
    super(props);

    this.state = {
      clusterName: '',
      kafkaLimitsValidation: true,
      ...this.props.initialTopic,
    };

    this.onValidationFields = this.onValidationFields.bind(this);
    this.onUpdateLimits = this.onUpdateLimits.bind(this);
  }

  onValidationFields(isValid: boolean) {
    this.setState({ kafkaLimitsValidation: isValid });
  }

  onUpdateLimits(data: KafkaLimitsProps) {
    this.setState({
      plannedRate: data.plannedRate || null,
      plannedRetentionTime: data.plannedRetentionTime || null,
      plannedVolume: data.plannedVolume || null,
      retentionType: data.retentionType || null,
    });
  }

  componentDidMount() {
    if (typeof this.props.initialTopic.clusterId === 'number' && !isNaN(this.props.initialTopic.clusterId)) {
      ClusterService.getCluster(
        this.props.initialTopic.clusterId,
        (cluster) => this.setState({ clusterName: cluster.name ?? this.props.initialTopic.clusterId }),
        () => this.setState({ clusterName: this.props.initialTopic.clusterId }),
      );
    }
  }

  render() {
    const canEdit = this.props.isAdmin || this.props.canEdit;
    return (
      <Grid item container alignItems="center" justifyContent="center">
        <Grid item xs={9}>
          <Grid container style={{ marginTop: '1vw' }} spacing={3} justifyContent="center" alignItems="center">
            <Grid item xs={12}>
              <Paper>
                <Grid container spacing={3} direction="row" justifyContent="flex-start" alignItems="center" style={{ padding: 12 }}>
                  <Grid item xs>
                    <Grid container spacing={2} direction="row" style={{ width: '100%' }}>
                      <Grid item xs>
                        <Typography variant="h6" style={{ width: '100%', color: 'rgba(0.0,0.0,0.0,0.54)' }}>
                          Конфигурация топика кафки
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={12}>
                        <Autocomplete
                          disabled
                          id="parent-project"
                          fullWidth={true}
                          options={this.props.projects}
                          defaultValue={this.props.projects.filter((project) => project.id === this.state.projectId)[0]}
                          getOptionLabel={(option) => option.name}
                          style={{ width: '100%' }}
                          renderInput={(params) => <TextField {...params} label="Проект" variant="standard" />}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Кластер" value={this.state.clusterName} disabled={true} />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Имя источника данных"
                          defaultValue={this.state.name}
                          disabled={true}
                          onChange={(e) => {
                            this.setState({ name: e.target.value });
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="number"
                          defaultValue={this.state.partitions}
                          label="Кол-во партиций"
                          disabled={!canEdit}
                          onChange={(e) => {
                            this.setState({ partitions: parseInt(e.target.value) });
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          defaultValue={this.state.replication}
                          disabled={true}
                          label="Кол-во реплик"
                          onChange={(e) => {
                            this.setState({ replication: parseInt(e.target.value) });
                          }}
                        />
                      </Grid>
                    </Grid>
                    {this.props.enabledLimits && (
                      <Grid container spacing={2} direction="row" style={{ width: '100%', marginTop: 12 }}>
                        <Grid item xs={12}>
                          <KafkaLimitsComponent
                            projectName={this.props.projects.filter((project) => project.id === this.state.projectId)[0]?.shortName || ''}
                            clusterId={Number(this.props.initialTopic.clusterId)}
                            replication={this.state.replication}
                            partitions={this.state.partitions}
                            topicName={this.state.name}
                            limits={{
                              plannedRate: this.state.plannedRate || null,
                              plannedVolume: this.state.plannedVolume || null,
                              plannedRetentionTime: this.state.plannedRetentionTime || null,
                              retentionType: (this.state.retentionType as KafkaRetentionType | undefined) || null,
                            }}
                            onValidationFields={this.onValidationFields}
                            onUpdateLimits={this.onUpdateLimits}
                            displayError={this.props.displayError}
                          />
                        </Grid>
                      </Grid>
                    )}
                    <Grid container spacing={2} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Имя топика Kafka" defaultValue={this.state.topicFullName} disabled={true} />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          {canEdit && this.state.kafkaLimitsValidation && <DoneFab onClick={() => this.props.handleTopicSubmit(this.state)} />}
        </Grid>
      </Grid>
    );
  }
}

function mapStateToProps(state: ApplicationState) {
  return {
    enabledLimits: featureSettingsSelectors.getEnableFeatureSettingLimits(state),
  };
}

export default connect(mapStateToProps, null)(TopicInfoForm);
