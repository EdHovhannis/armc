import { Card, CardActions, CardContent, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import { RouteProps } from 'react-router';

import { AlmgrQuota } from '../../store/almgr/Type';
import { CollectorProjectQuota } from '../../store/collector/Type';
import { OsirisCheckQuotaProject, OsirisTrafficQuotaProject } from '../../store/osiris/Type';
import { UnimonProjectQuota } from '../../store/unimon/Type';
import { ClusterUtils } from '../../utils/ClusterUtils';
import SizeConverter, { multipliers } from '../../utils/SizeConverter';
import { ClustersInfo } from '../clusters/ClustersInfo';
import { ClusterInfoTableItem } from '../clusters/types';
import { Loader } from '../utils/Loader';
import { withNavigation, WithNavigationProps } from '../utils/withNavigation';

import ConfirmProjectDeleteDialog from './ConfirmProjectDeleteDialog';

export interface ProjectInfoFormState {
  projectName: string;
  shortName: string;
  currentKafkaPartitions: number;
  maxKafkaPartitions: number;
  currentDruidTaskCount: number;
  maxDruidTaskCount: number;
  currentQuotaSize: number;
  maxQuotaSize: number;
  currentVolume: number;
  maxVolume: number;
  currentRate: number;
  maxRate: number;
  currentArchVolume: number;
  maxArchVolume: number;
  currentArchRate: number;
  maxArchRate: number;
  maxCountLookup: number;
  currentCountLookup: number;
  maxSizeDictionary: number;
  currentSizeDictionary: number;
  redirect: boolean;
  volumeMeasurementUnit?: string;
  speedMeasurementUnit?: string;
  volumeArchMeasurementUnit?: string;
  speedArchMeasurementUnit?: string;
  maxSizeDictionaryMeasurementUnit?: string;
  unimonQuota: UnimonProjectQuota;
  almgrQuota: AlmgrQuota;
  osirisCheckQuota: OsirisCheckQuotaProject;
  osirisTrafficQuota: OsirisTrafficQuotaProject;
  confirmDeleteOpen: boolean;
  collectorQuota: CollectorProjectQuota;
  collectorQuotaLimitUnit: string;
  clustersInfo: ClusterInfoTableItem[];
}

export interface ProjectInfoFormProps extends RouteProps, ProjectInfoFormState {
  isAdmin: boolean;
  isLoading: boolean;
  isLimitFeatureSettingEnabled: boolean;
}

export interface ProjectInfoFormDispatchProps {
  updateProject(
    projectName: string,
    maxPartitions: number,
    maxDruidTasks: number,
    maxPipelines: number,
    maxVolume: number,
    maxRate: number,
    maxArchVolume: number,
    maxArchRate: number,
    maxSizeDictionary: number,
    maxCountLookup: number,
    unimonQuota: UnimonProjectQuota,
    almgr: AlmgrQuota,
    osirisCheckQuota: OsirisCheckQuotaProject,
    osirisTrafficQuota: OsirisTrafficQuotaProject,
    collectorQuota: CollectorProjectQuota,
    clustersInfo?: ClusterInfoTableItem[],
  );

  displayError(error: string);

  // removeCurrentProject()
}

class ProjectInfoForm extends React.Component<ProjectInfoFormProps & ProjectInfoFormDispatchProps & WithNavigationProps, ProjectInfoFormState> {
  constructor(props) {
    super(props);

    const volumeWithMultiplier = SizeConverter.getSizeWithMultiplierByDivide(this.props.maxVolume == undefined ? 0 : this.props.maxVolume);
    const rateWithMultiplier = SizeConverter.getSizeWithMultiplierByDivideWithMaxMultiplier(
      this.props.maxRate == undefined ? 0 : this.props.maxRate,
      this.props.isLimitFeatureSettingEnabled ? 'tb' : 'mb',
    );
    const volumeArchWithMultiplier = SizeConverter.getSizeWithMultiplierByDivide(
      this.props.maxArchVolume == undefined ? 0 : this.props.maxArchVolume,
    );
    const rateArchWithMultiplier = SizeConverter.getSizeWithMultiplierByDivideWithMaxMultiplier(
      this.props.maxArchRate == undefined ? 0 : this.props.maxArchRate,
      this.props.isLimitFeatureSettingEnabled ? 'tb' : 'mb',
    );
    const dictionaryWithMultiplier = SizeConverter.getSizeWithMultiplierByDivide(
      this.props.maxSizeDictionary === undefined ? 0 : this.props.maxSizeDictionary,
    );

    const getFixedByTwoDigits = (value: number) => +value.toFixed(2);

    this.state = {
      projectName: this.props.projectName,
      shortName: this.props.shortName,
      currentKafkaPartitions: this.props.currentKafkaPartitions,
      maxKafkaPartitions: this.props.maxKafkaPartitions,
      currentDruidTaskCount: this.props.currentDruidTaskCount,
      maxDruidTaskCount: this.props.maxDruidTaskCount,
      currentQuotaSize: this.props.currentQuotaSize,
      maxQuotaSize: this.props.maxQuotaSize,
      currentVolume: this.props.currentVolume,
      maxVolume: getFixedByTwoDigits(volumeWithMultiplier.size),
      volumeMeasurementUnit: volumeWithMultiplier.multiplier === 'b' ? 'mb' : volumeWithMultiplier.multiplier,
      currentRate: this.props.currentRate,
      maxRate: getFixedByTwoDigits(rateWithMultiplier.size),
      speedMeasurementUnit: rateWithMultiplier.multiplier,
      currentCountLookup: this.props.currentCountLookup,
      maxCountLookup: this.props.maxCountLookup,
      currentSizeDictionary: this.props.currentSizeDictionary,
      maxSizeDictionary: getFixedByTwoDigits(dictionaryWithMultiplier.size),
      maxSizeDictionaryMeasurementUnit: dictionaryWithMultiplier.multiplier,
      currentArchVolume: this.props.currentArchVolume,
      maxArchVolume: getFixedByTwoDigits(volumeArchWithMultiplier.size),
      volumeArchMeasurementUnit: volumeArchWithMultiplier.multiplier === 'b' ? 'mb' : volumeArchWithMultiplier.multiplier,
      currentArchRate: this.props.currentArchRate,
      maxArchRate: getFixedByTwoDigits(rateArchWithMultiplier.size),
      speedArchMeasurementUnit: rateArchWithMultiplier.multiplier,
      osirisCheckQuota: this.props.osirisCheckQuota,
      osirisTrafficQuota: this.props.osirisTrafficQuota,
      redirect: false,
      unimonQuota: this.props.unimonQuota,
      almgrQuota: this.props.almgrQuota,
      confirmDeleteOpen: false,
      collectorQuota: this.props.collectorQuota,
      collectorQuotaLimitUnit: 'b',
      clustersInfo: this.props.clustersInfo,
    };
  }

  componentDidUpdate(prevProps: ProjectInfoFormProps) {
    // Проверяем, изменился ли prop.almgrQuota
    if (prevProps?.almgrQuota !== this.props?.almgrQuota) {
      // Обновляем state при изменении prop
      this.setState({
        almgrQuota: this.props?.almgrQuota,
      });
    }
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    } else {
      return this.renderProjects();
    }
  }

  renderProjects() {
    const speedOptions = this.props.isLimitFeatureSettingEnabled ? ['Tb/s', 'Gb/s', 'Mb/s', 'Kb/s', 'b/s'] : ['Mb/s', 'Kb/s', 'b/s'];

    return (
      <div>
        <Grid container style={{ marginTop: '1vw' }} spacing={3} justifyContent="center" alignItems="center">
          <Grid item xs>
            <Card elevation={1}>
              <CardContent>
                <Grid container spacing={3} direction="row" justifyContent="flex-start" alignItems="center">
                  <Grid item xs>
                    <Grid container spacing={1} direction="column" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={12}>
                        <TextField label="Ключ проекта" fullWidth disabled={true} defaultValue={this.state.shortName} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Имя проекта"
                          fullWidth
                          disabled={!this.props.isAdmin}
                          defaultValue={this.state.projectName}
                          onChange={(e) => {
                            this.setState({ projectName: e.target.value });
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid item>
                      <Typography style={{ marginTop: 25 }} color="primary" display="block" variant="subtitle2">
                        Настройка кластеров для проекта Abyss
                      </Typography>
                      <Divider style={{ marginBottom: 10 }} />
                    </Grid>
                    <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={12}>
                        <ClustersInfo
                          clusters={this.state.clustersInfo}
                          isAdmin={this.props.isAdmin}
                          setClustersInfo={(clustersInfo) => this.setState((prev) => ({ ...prev, clustersInfo }))}
                        />
                      </Grid>
                    </Grid>
                    <Grid item>
                      <Typography style={{ marginTop: 25 }} color="primary" display="block" variant="subtitle2">
                        Квоты на сервисы Abyss
                      </Typography>
                      <Divider style={{ marginBottom: 10 }} />
                    </Grid>
                    <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={6}>
                        <TextField fullWidth label="Текущее кол-во задач мониторинга" disabled defaultValue={this.state.currentDruidTaskCount} />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Максимум задач мониторинга"
                          disabled={!this.props.isAdmin}
                          defaultValue={this.state.maxDruidTaskCount}
                          onChange={(e) => {
                            this.setState({ maxDruidTaskCount: parseInt(e.target.value) });
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={6}>
                        <TextField fullWidth label="Кол-во задач обработки" disabled defaultValue={this.state.currentQuotaSize} />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Максимум задач обработки"
                          disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                          defaultValue={this.state.maxQuotaSize}
                          onChange={(e) => {
                            this.setState({ maxQuotaSize: parseInt(e.target.value) });
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Текущий объём индексов"
                          disabled
                          defaultValue={SizeConverter.makeSizeString(
                            SizeConverter.convertBytes(isNaN(this.state.currentVolume) ? 0 : this.state.currentVolume),
                            false,
                          )}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth={false}
                          style={{ width: '82%' }}
                          label="Максимальный объём индексов"
                          disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                          defaultValue={this.state.maxVolume}
                          error={(this.state.maxVolume == 0 && this.state.maxRate != 0) || (this.state.maxVolume != 0 && this.state.maxRate == 0)}
                          onChange={(e) => {
                            this.setState({ maxVolume: Number(e.target.value) });
                          }}
                        />
                        <FormControl fullWidth style={{ width: '18%' }}>
                          <InputLabel> </InputLabel>
                          <Select
                            value={this.state.volumeMeasurementUnit}
                            fullWidth
                            disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                            onChange={(e) => {
                              this.setState({ volumeMeasurementUnit: e.target.value as string });
                            }}
                          >
                            {['Tb', 'Gb', 'Mb'].map((unit) => (
                              <MenuItem key={unit} value={unit.toLowerCase()}>
                                {unit}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Текущая скорость обработки индексов"
                          disabled
                          defaultValue={SizeConverter.makeSizeString(
                            SizeConverter.convertBytes(isNaN(this.state.currentRate) ? 0 : this.state.currentRate),
                            true,
                          )}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth={false}
                          style={{ width: '82%' }}
                          label="Макс. скорость обработки индексов"
                          disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                          defaultValue={this.state.maxRate}
                          error={(this.state.maxVolume == 0 && this.state.maxRate != 0) || (this.state.maxVolume != 0 && this.state.maxRate == 0)}
                          onChange={(e) => {
                            this.setState({ maxRate: Number(e.target.value) });
                          }}
                        />
                        <FormControl fullWidth style={{ width: '18%' }}>
                          <InputLabel> </InputLabel>
                          <Select
                            value={this.state.speedMeasurementUnit + '/s'}
                            fullWidth
                            disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                            onChange={(e) => {
                              const unit = e.target.value as string;
                              this.setState({ speedMeasurementUnit: unit.split('/')[0] });
                            }}
                          >
                            {speedOptions.map((unit) => (
                              <MenuItem key={unit} value={unit.toLowerCase()}>
                                {unit}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Текущий объём архива"
                          disabled
                          defaultValue={SizeConverter.makeSizeString(
                            SizeConverter.convertBytes(isNaN(this.state.currentArchVolume) ? 0 : this.state.currentArchVolume),
                            false,
                          )}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth={false}
                          style={{ width: '82%' }}
                          label="Максимальный объём архива"
                          disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                          defaultValue={this.state.maxArchVolume}
                          error={
                            (this.state.maxArchVolume == 0 && this.state.maxArchRate != 0) ||
                            (this.state.maxArchVolume != 0 && this.state.maxArchRate == 0)
                          }
                          onChange={(e) => {
                            this.setState({ maxArchVolume: Number(e.target.value) });
                          }}
                        />
                        <FormControl fullWidth style={{ width: '18%' }}>
                          <InputLabel> </InputLabel>
                          <Select
                            value={this.state.volumeArchMeasurementUnit}
                            fullWidth
                            disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                            onChange={(e) => {
                              this.setState({ volumeArchMeasurementUnit: e.target.value as string });
                            }}
                          >
                            {['Tb', 'Gb', 'Mb'].map((unit) => (
                              <MenuItem key={unit} value={unit.toLowerCase()}>
                                {unit}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Текущая скорость обработки архива"
                          disabled
                          defaultValue={SizeConverter.makeSizeString(
                            SizeConverter.convertBytes(isNaN(this.state.currentArchRate) ? 0 : this.state.currentArchRate),
                            true,
                          )}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth={false}
                          style={{ width: '82%' }}
                          label="Макс. скорость обработки архива"
                          disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                          defaultValue={this.state.maxArchRate}
                          error={
                            (this.state.maxArchVolume == 0 && this.state.maxArchRate != 0) ||
                            (this.state.maxArchVolume != 0 && this.state.maxArchRate == 0)
                          }
                          onChange={(e) => {
                            this.setState({ maxArchRate: Number(e.target.value) });
                          }}
                        />
                        <FormControl fullWidth style={{ width: '18%' }}>
                          <InputLabel> </InputLabel>
                          <Select
                            value={this.state.speedArchMeasurementUnit + '/s'}
                            fullWidth
                            disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                            onChange={(e) => {
                              const unit = e.target.value as string;
                              this.setState({ speedArchMeasurementUnit: unit.split('/')[0] });
                            }}
                          >
                            {speedOptions.map((unit) => (
                              <MenuItem key={unit} value={unit.toLowerCase()}>
                                {unit}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Текущий объём справочников"
                          disabled
                          defaultValue={SizeConverter.makeSizeString(
                            SizeConverter.convertBytes(isNaN(this.state.currentSizeDictionary) ? 0 : this.state.currentSizeDictionary),
                            false,
                          )}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth={false}
                          style={{ width: '82%' }}
                          label="Максимальный объём справочников"
                          disabled={!this.props.isAdmin}
                          defaultValue={this.state.maxSizeDictionary}
                          onChange={(e) => {
                            this.setState({ maxSizeDictionary: Number(e.target.value) });
                          }}
                        />
                        <FormControl fullWidth style={{ width: '18%' }}>
                          <InputLabel> </InputLabel>
                          <Select
                            value={this.state.maxSizeDictionaryMeasurementUnit}
                            fullWidth
                            disabled={!this.props.isAdmin}
                            onChange={(e) => {
                              this.setState({ maxSizeDictionaryMeasurementUnit: e.target.value as string });
                            }}
                          >
                            {['Tb', 'Gb', 'Mb', 'Kb', 'b'].map((unit) => (
                              <MenuItem key={unit} value={unit.toLowerCase()}>
                                {unit}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={6}>
                        <TextField fullWidth label="Текущее кол-во lookup'ов" disabled defaultValue={this.state.currentCountLookup} />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Максимум lookup'ов"
                          disabled={!this.props.isAdmin}
                          defaultValue={this.state.maxCountLookup}
                          onChange={(e) => {
                            this.setState({ maxCountLookup: parseInt(e.target.value) });
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid item>
                      <Typography style={{ marginTop: 25 }} color="primary" display="block" variant="subtitle2">
                        Квоты на сервисы Unimon
                      </Typography>
                      <Divider style={{ marginBottom: 10 }} />
                    </Grid>
                    <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Зарезервированный трафик на подключения"
                          disabled
                          defaultValue={this.state.unimonQuota.currentUtilization}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Максимальный трафик в минуту"
                          disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                          defaultValue={this.state.unimonQuota.limitTrafficPerMin}
                          onChange={(e) => {
                            this.setState({ unimonQuota: { ...this.state.unimonQuota, limitTrafficPerMin: e.target.value } });
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Время овердрафт в минутах"
                          disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                          defaultValue={this.state.unimonQuota.overdraftMinutes}
                          onChange={(e) => {
                            this.setState({ unimonQuota: { ...this.state.unimonQuota, overdraftMinutes: e.target.value } });
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Процент овердрафта"
                          disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                          defaultValue={this.state.unimonQuota.overdraftPercent}
                          onChange={(e) => {
                            this.setState({ unimonQuota: { ...this.state.unimonQuota, overdraftPercent: e.target.value } });
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid item>
                      <Typography style={{ marginTop: 25 }} color="primary" display="block" variant="subtitle2">
                        Квоты на сервисы Osiris
                      </Typography>
                      <Divider style={{ marginBottom: 10 }} />
                    </Grid>
                    <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={6}>
                        <TextField fullWidth label="Зарезервированный трафик" disabled defaultValue={this.state.osirisTrafficQuota.spent} />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Максимальный трафик в секунду"
                          disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                          defaultValue={this.state.osirisTrafficQuota.max}
                          onChange={(e) => {
                            this.setState({ osirisTrafficQuota: { ...this.state.osirisTrafficQuota, max: e.target.value } });
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Возможное время овердрафта (сек.)"
                          disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                          defaultValue={this.state.osirisTrafficQuota.maxSecondsInOver}
                          onChange={(e) => {
                            this.setState({
                              osirisTrafficQuota: {
                                ...this.state.osirisTrafficQuota,
                                maxSecondsInOver: e.target.value,
                              },
                            });
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Процент овердрафта"
                          disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                          defaultValue={this.state.osirisTrafficQuota.over}
                          onChange={(e) => {
                            this.setState({ osirisTrafficQuota: { ...this.state.osirisTrafficQuota, over: e.target.value } });
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <Grid item xs={6}>
                        <TextField fullWidth label="Текущее кол-во проверок" disabled={true} defaultValue={this.state.osirisCheckQuota.spent} />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Макс. кол-во проверок"
                          disabled={!this.props.isAdmin || this.props.isLimitFeatureSettingEnabled}
                          defaultValue={this.state.osirisCheckQuota.max}
                          onChange={(e) => {
                            this.setState({ osirisCheckQuota: { ...this.state.osirisCheckQuota, max: e.target.value } });
                          }}
                        />
                      </Grid>
                      <Grid item>
                        <Typography style={{ marginTop: 25 }} color="primary" display="block" variant="subtitle2">
                          Квоты на сервисы Alert Manager
                        </Typography>
                        <Divider style={{ marginBottom: 10 }} />
                      </Grid>
                      <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                        <Grid item xs={6}>
                          <TextField fullWidth label="Текущее RPM для правил отклонений" disabled defaultValue={this.state.almgrQuota.currentRpm} />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Максимальное RPM для правил отклонений"
                            disabled={!this.props.isAdmin}
                            value={this.state.almgrQuota.maxRpm}
                            onChange={(e) => {
                              this.setState({ almgrQuota: { ...this.state.almgrQuota, maxRpm: e.target.value } });
                            }}
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Текущее количество правил уведомлений"
                            disabled
                            defaultValue={this.state.almgrQuota.currentGroupRulesAmount}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Максимальное количество правил уведомлений"
                            disabled={!this.props.isAdmin}
                            value={this.state.almgrQuota.maxGroupRulesAmount}
                            onChange={(e) => {
                              this.setState({
                                almgrQuota: {
                                  ...this.state.almgrQuota,
                                  maxGroupRulesAmount: e.target.value,
                                },
                              });
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item>
                      <Typography style={{ marginTop: 25 }} color="primary" display="block" variant="subtitle2">
                        Проектные квоты Единого коллектора
                      </Typography>
                      <Divider style={{ marginBottom: 10 }} />
                    </Grid>
                    <Grid container spacing={1} direction="row" style={{ width: '100%', marginTop: 12 }}>
                      <TextField
                        fullWidth
                        style={{ width: '82%' }}
                        label="Макс. скорость сбора данных"
                        disabled={!this.props.isAdmin}
                        defaultValue={this.state.collectorQuota ? this.state.collectorQuota.limitTrafficBytesPerMin : 0}
                        onChange={(e) => {
                          this.setState({
                            collectorQuota: {
                              ...this.state.collectorQuota,
                              limitTrafficBytesPerMin: isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value),
                            },
                          });
                        }}
                      />
                      <FormControl fullWidth style={{ width: '18%' }}>
                        <InputLabel> </InputLabel>
                        <Select
                          value={this.state.collectorQuotaLimitUnit + '/m'}
                          fullWidth
                          disabled={!this.props.isAdmin}
                          onChange={(e) => {
                            const unit = e.target.value as string;
                            this.setState({ collectorQuotaLimitUnit: unit.split('/')[0] });
                          }}
                        >
                          {['b/m'].map((unit) => (
                            <MenuItem key={unit} value={unit.toLowerCase()}>
                              {unit}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
              {this.props.isAdmin && (
                <CardActions>
                  {/*<Button size="small" color="primary" onClick={() => {*/}
                  {/*  this.setState({confirmDeleteOpen: true})*/}
                  {/*}}> Удалить </Button>*/}
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => {
                      if (this.state.maxRate === undefined || isNaN(this.state.maxRate) || this.state.maxRate < 0) {
                        this.props.displayError('Максимальная скорость обработки полнотекстовых индексов не задана или задана некорректно');
                        return;
                      } else if (this.state.maxVolume === undefined || isNaN(this.state.maxVolume) || this.state.maxVolume < 0) {
                        this.props.displayError('Максимальный объем полнотекстового индекса не задан или задан некорректно');
                        return;
                      } else if (this.state.maxVolume != 0 && this.state.maxRate == 0) {
                        this.props.displayError('Задайте максимальную скорость обработки полнотекстовых индексов.');
                        return;
                      } else if (this.state.maxVolume == 0 && this.state.maxRate != 0) {
                        this.props.displayError('Задайте максимальный объем полнотекстовых индексов.');
                        return;
                      } else if (this.state.maxArchVolume === undefined || isNaN(this.state.maxArchVolume) || this.state.maxArchVolume < 0) {
                        this.props.displayError('Максимальный объем архива не задан или задан некорректно');
                        return;
                      } else if (this.state.maxArchRate === undefined || isNaN(this.state.maxArchRate) || this.state.maxArchRate < 0) {
                        this.props.displayError('Максимальная скорость обработки архива не задана или задана некорректно');
                        return;
                      } else if (this.state.maxArchVolume != 0 && this.state.maxArchRate == 0) {
                        this.props.displayError('Задайте максимальную скорость обработки архива.');
                        return;
                      } else if (this.state.maxArchVolume == 0 && this.state.maxArchRate != 0) {
                        this.props.displayError('Задайте максимальный объем архива.');
                        return;
                      } else if (this.state.maxQuotaSize === undefined || isNaN(this.state.maxQuotaSize) || this.state.maxQuotaSize < 0) {
                        this.props.displayError('Максимальное количество задач обработки не задано или задано некорректно');
                        return;
                      } else if (
                        this.state.maxDruidTaskCount === undefined ||
                        isNaN(this.state.maxDruidTaskCount) ||
                        this.state.maxDruidTaskCount < 0
                      ) {
                        this.props.displayError('Максимальное количество задач мониторинга не задано или задано некорректно');
                        return;
                      } else if (
                        this.state.maxKafkaPartitions === undefined ||
                        isNaN(this.state.maxKafkaPartitions) ||
                        this.state.maxKafkaPartitions < 0
                      ) {
                        this.props.displayError('Максимальное количество партиций не задано или задано некорректно');
                        return;
                      } else if (this.state.maxCountLookup === undefined || isNaN(this.state.maxCountLookup) || this.state.maxCountLookup < 0) {
                        this.props.displayError("Максимальное количество lookup'ов не задано или задано некорректно");
                        return;
                      } else if (
                        this.state.maxSizeDictionary === undefined ||
                        isNaN(this.state.maxSizeDictionary) ||
                        this.state.maxSizeDictionary < 0
                      ) {
                        this.props.displayError('Максимальный размер справочников не задан или задан некорректно');
                        return;
                      } else if (
                        this.state.unimonQuota.limitTrafficPerMin === undefined ||
                        isNaN(this.state.unimonQuota.limitTrafficPerMin) ||
                        this.state.unimonQuota.limitTrafficPerMin < 0
                      ) {
                        this.props.displayError('Максимальный трафик в минуту для Unimon не задан или задан некорректно');
                        return;
                      } else if (
                        this.state.unimonQuota.overdraftMinutes === undefined ||
                        isNaN(this.state.unimonQuota.overdraftMinutes) ||
                        this.state.unimonQuota.overdraftMinutes < 0
                      ) {
                        this.props.displayError('Максимальное время нахождения в овердрафте для Unimon не задано или задано некорректно');
                        return;
                      } else if (
                        this.state.unimonQuota.overdraftPercent === undefined ||
                        isNaN(this.state.unimonQuota.overdraftPercent) ||
                        this.state.unimonQuota.overdraftPercent < 0
                      ) {
                        this.props.displayError('Максимальный процент овердрафта для Unimon не задан или задан некорректно');
                        return;
                      } else if (
                        this.state.almgrQuota.maxGroupRulesAmount === undefined ||
                        isNaN(this.state.almgrQuota.maxGroupRulesAmount) ||
                        this.state.almgrQuota.maxGroupRulesAmount < 0
                      ) {
                        this.props.displayError('Максимальное количество правил уведомлений для Alert Manager не задано или задано некорректно');
                        return;
                      } else if (
                        this.state.almgrQuota.maxRpm === undefined ||
                        isNaN(this.state.almgrQuota.maxRpm) ||
                        this.state.almgrQuota.maxRpm < 0
                      ) {
                        this.props.displayError('Максимальное значение RPM для правил отклонений для Alert Manager не задано или задано некорректно');
                        return;
                      } else if (
                        this.state.osirisTrafficQuota.max === undefined ||
                        isNaN(this.state.osirisTrafficQuota.max) ||
                        this.state.osirisTrafficQuota.max < 0
                      ) {
                        this.props.displayError('Максимальный трафик в секунду для Osiris не задан или задан некорректно');
                        return;
                      } else if (
                        this.state.osirisTrafficQuota.over === undefined ||
                        isNaN(this.state.osirisTrafficQuota.over) ||
                        this.state.osirisTrafficQuota.over < 0
                      ) {
                        this.props.displayError('Максимальный процент овердрафта для Osiris не задан или задан некорректно');
                        return;
                      } else if (
                        this.state.osirisTrafficQuota.maxSecondsInOver === undefined ||
                        isNaN(this.state.osirisTrafficQuota.maxSecondsInOver) ||
                        this.state.osirisTrafficQuota.maxSecondsInOver < 0
                      ) {
                        this.props.displayError('Максимальное время нахождения в овердрафте для Osiris не задано или задано некорректно');
                        return;
                      } else if (
                        this.state.osirisCheckQuota.max === undefined ||
                        isNaN(this.state.osirisCheckQuota.max) ||
                        this.state.osirisCheckQuota.max < 0
                      ) {
                        this.props.displayError('Максимальное количество проверок для Osiris не задано или задано некорректно');
                        return;
                      } else if (!ClusterUtils.validateClusters(this.state.clustersInfo).isValid) {
                        const errorsMsg = ClusterUtils.validateClusters(this.state.clustersInfo).errorMsg;
                        if (errorsMsg) {
                          this.props.displayError(`Ошибка валидации настроек кластеров для проекта Abyss. ${errorsMsg}`);
                        } else {
                          this.props.displayError(`Ошибка валидации настроек кластеров для проекта Abyss`);
                        }
                        return;
                      }

                      const getConvertedValue = (value: number, multiplier: number) => +(value * multiplier).toFixed();

                      this.props.updateProject(
                        this.state.projectName,
                        this.state.maxKafkaPartitions,
                        this.state.maxDruidTaskCount,
                        this.state.maxQuotaSize,
                        getConvertedValue(this.state.maxVolume, multipliers[this.state.volumeMeasurementUnit as string]),
                        getConvertedValue(this.state.maxRate, multipliers[this.state.speedMeasurementUnit as string]),
                        getConvertedValue(this.state.maxArchVolume, multipliers[this.state.volumeArchMeasurementUnit as string]),
                        getConvertedValue(this.state.maxArchRate, multipliers[this.state.speedArchMeasurementUnit as string]),
                        getConvertedValue(this.state.maxSizeDictionary, multipliers[this.state.maxSizeDictionaryMeasurementUnit as string]),
                        this.state.maxCountLookup,
                        this.state.unimonQuota,
                        this.state.almgrQuota,
                        this.state.osirisCheckQuota,
                        this.state.osirisTrafficQuota,
                        this.state.collectorQuota,
                        !this.state.clustersInfo.length ? undefined : this.state.clustersInfo,
                      );
                      this.props.navigate('/settings/projects');
                    }}
                  >
                    {' '}
                    Сохранить{' '}
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        </Grid>

        {this.state.confirmDeleteOpen && (
          <ConfirmProjectDeleteDialog
            currentFlowQuotaSize={this.state.currentQuotaSize}
            currentKafkaPartitions={this.state.currentKafkaPartitions}
            currentMonitoringTaskCount={this.state.currentDruidTaskCount}
            currentRate={this.props.currentRate}
            currentVolume={this.props.currentVolume}
            currentArchiveRate={this.props.currentArchRate}
            currentArchiveVolume={this.props.currentArchVolume}
            displayError={this.props.displayError}
            projectName={this.props.projectName}
            close={(value) => this.setState({ confirmDeleteOpen: value })}
            onClose={(value, data) => {
              if (value === 'Ok') {
                if (data === this.state.projectName) {
                  this.props.removeCurrentProject();
                  this.props.navigate('/settings/projects');
                } else {
                  this.props.displayError(
                    'Введенное Вами имя проекта не совпадает с именем проекта, который Вы пытаетесь удалить. ' + 'Повторите еще раз.',
                  );
                  return;
                }
              }
            }}
          />
        )}
      </div>
    );
  }
}

export default withNavigation(ProjectInfoForm);
