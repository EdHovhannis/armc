import { createStyles, Grid, IconButton } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { Clear } from '@material-ui/icons';
import * as React from 'react';
import { Doughnut } from 'react-chartjs-2';

import { PipelineMeta } from '../../store/pipeline/Types';
import { IndexOverviewDataNew } from '../../utils/IndexUtils';
import SizeConverter from '../../utils/SizeConverter';
import { Loader } from '../utils/Loader';

import BackupCountView from './BackupCountView';

export interface IndexStatisticViewProps {
  pipelineName: string;
  meta: PipelineMeta;
  zoneId: string;
  isLoading: boolean;
  data: IndexOverviewDataNew[];
  shortNameProject: string;
  backupCount: number | null;
  savepointCount: number | null;
  close(): any;
}

export interface IndexStatisticViewStat {}

export class IndexStatisticView extends React.Component<IndexStatisticViewProps, IndexStatisticViewStat> {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.isLoading) {
      return (
        <Grid container direction="row" justifyContent="space-between" alignItems="flex-start" style={{ paddingLeft: 16, margin: 10, width: '100%' }}>
          <Grid item style={{ width: '95%' }}>
            <Loader style={{}} />
          </Grid>
          <Grid item style={{ width: '5%' }}>
            <IconButton
              onClick={() => {
                this.props.close();
              }}
              color="primary"
              size={'small'}
            >
              <Clear />
            </IconButton>
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container direction="row" justifyContent="space-between" alignItems="flex-start" style={{ paddingLeft: 16, margin: 10, width: '100%' }}>
        <Grid item direction={'column'} style={{ width: '95%' }}>
          <Typography variant="body2" display="block" style={{ marginTop: 10, width: '100%', fontSize: '15px' }}>
            <b>{this.props.pipelineName}</b>
          </Typography>
          <Typography variant="body2" display="block" style={{ marginTop: 10, width: '100%', fontSize: '15px' }}>
            <b>Зона</b>: {this.props.zoneId}
          </Typography>
          <Typography variant="body2" display="block" style={{ marginTop: 10, width: '100%', fontSize: '15px' }}>
            <b>Статус</b>: {this.props.meta.indexing.status}
          </Typography>
          <Typography variant="body2" display="block" style={{ marginTop: 10, width: '100%', fontSize: '15px' }}>
            <b>Количество документов</b>: {this.props.meta.storage.docNum}
          </Typography>
          <Typography variant="body2" display="block" style={{ marginTop: 10, width: '100%', fontSize: '15px' }}>
            <b>Последняя ротация:</b> {new Date(this.props.meta.lastRotationTime).toLocaleString()}
          </Typography>
          <Typography variant="body2" display="block" style={{ marginTop: 10, width: '100%', fontSize: '15px' }}>
            <b>Общая статистика памяти:</b>
          </Typography>
          <Typography
            variant="body2"
            display="block"
            style={{
              marginTop: 10,
              marginBottom: 10,
              width: '100%',
              fontSize: '15px',
            }}
          >
            занято {SizeConverter.makeSizeString(SizeConverter.convertBytes(this.props.meta.storage.currentSizeBytes), false)}
          </Typography>
          <Typography variant="body2" display="block" style={{ marginBottom: 10, width: '100%', fontSize: '15px' }}>
            выделено {SizeConverter.makeSizeString(SizeConverter.convertBytes(this.props.meta.storage.maxSizeBytes), false)}
          </Typography>
          <div style={{ width: '80%' }}>
            {/*@ts-ignore*/}
            <Doughnut
              data={{
                labels: ['Доступно', 'Занято'],
                datasets: [
                  {
                    data: [
                      (this.props.meta.storage === null ? 0 : this.props.meta.storage.maxSizeBytes) -
                        (this.props.meta.storage === null ? 0 : this.props.meta.storage.currentSizeBytes),
                      this.props.meta.storage === null ? 0 : this.props.meta.storage.currentSizeBytes,
                    ],
                    backgroundColor: ['#C7CEDB', '#00B74A'],
                    hoverBackgroundColor: ['#C7CEDB', '#00B74A'],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                legend: {
                  display: false,
                },
                tooltips: {
                  enabled: false,
                },
              }}
              height={'100%'}
              width={'100%'}
            />
          </div>
          <BackupCountView
            name={this.props.pipelineName}
            project={this.props.shortNameProject}
            zone={this.props.zoneId}
            backupCount={this.props.backupCount ?? 0}
            savepointCount={this.props.savepointCount ?? 0}
          />
        </Grid>
        <Grid item style={{ width: '5%' }}>
          <IconButton
            onClick={() => {
              this.props.close();
            }}
            color="primary"
            size={'small'}
            // style={{marginRight: 20}}
          >
            <Clear />
          </IconButton>
        </Grid>
      </Grid>
    );
  }
}
