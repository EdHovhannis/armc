import {
  Button,
  Checkbox,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Paper,
  TextField,
  withStyles,
} from '@material-ui/core';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import IndexProvider from '../../containers/index/IndexProvider';
import SizeConverter from '../../utils/SizeConverter';

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

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface ConfirmProjectDeleteDialogProps {
  currentKafkaPartitions: number;
  currentMonitoringTaskCount: number;
  currentFlowQuotaSize: number;
  currentArchiveVolume: number;
  currentArchiveRate: number;
  currentVolume: number;
  currentRate: number;
  projectName: string;

  onClose(value: string, data?: string): any;

  displayError(msg: string): any;

  close(value: boolean): any;
}

export interface ConfirmProjectDeleteDialogState {
  projectName: string;
  currentKafkaPartitions: number;
  currentMonitoringTaskCount: number;
  currentFlowQuotaSize: number;
  currentVolume: number;
  currentRate: number;
  currentArchiveVolume: number;
  currentArchiveRate: number;
  numQuotas: number;
  hardDelete: boolean;
}

class ConfirmProjectDeleteDialog extends React.Component<ConfirmProjectDeleteDialogProps, ConfirmProjectDeleteDialogState> {
  constructor(props) {
    super(props);
    this.state = {
      projectName: '',
      numQuotas: this.getInfoString(
        this.props.currentKafkaPartitions,
        this.props.currentFlowQuotaSize,
        this.props.currentMonitoringTaskCount,
        this.props.currentVolume,
        this.props.currentRate,
        this.props.currentArchiveVolume,
        this.props.currentArchiveRate,
      ).numQuotas,
      currentKafkaPartitions: this.props.currentKafkaPartitions,
      currentMonitoringTaskCount: this.props.currentMonitoringTaskCount,
      currentArchiveRate: this.props.currentArchiveRate,
      currentArchiveVolume: this.props.currentArchiveVolume,
      currentFlowQuotaSize: this.props.currentFlowQuotaSize,
      currentVolume: this.props.currentVolume ? this.props.currentVolume : 0,
      currentRate: this.props.currentRate ? this.props.currentRate : 0,
      hardDelete: false,
    };
    this.getInfoString = this.getInfoString.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.currentRate !== state.currentRate ||
      props.currentVolume !== state.currentVolume ||
      props.currentArchiveRate !== state.currentArchiveRate ||
      props.currentArchiveVolume !== state.currentArchiveVolume
    ) {
      return {
        currentVolume: props.currentVolume ? props.currentVolume : 0,
        currentRate: props.currentRate ? props.currentRate : 0,
        currentArchiveVolume: props.currentArchiveVolume ? props.currentArchiveVolume : 0,
        currentArchiveRate: props.currentArchiveRate ? props.currentArchiveRate : 0,
      };
    }
  }

  getInfoString(
    kafkaQuota: number,
    flowQuota: number,
    monitoringQuota: number,
    indexVolumeQuota: number,
    indexRateQuota: number,
    archiveVolumeQuota: number,
    archiveRateQuota: number,
  ) {
    let res = '';
    let kafkaQuotaString = '';
    let monitoringQuotaString = '';
    let flowQuotaString = '';
    let indexQuotaString = '';
    let archiveQuotaString = '';
    if (
      kafkaQuota === 0 &&
      flowQuota === 0 &&
      monitoringQuota === 0 &&
      indexRateQuota === 0 &&
      indexVolumeQuota === 0 &&
      archiveRateQuota === 0 &&
      archiveVolumeQuota === 0
    ) {
      res = 'Для подтверждения удаления введите в окно ниже имя проекта, который хотите удалить: ';
      return { str: res, numQuotas: 0 };
    }
    let countQuotas = 0;
    if (kafkaQuota !== 0) {
      kafkaQuotaString = kafkaQuota + ' ' + IndexProvider.getNounDay(kafkaQuota, 'партиция', 'партиции', 'партиций') + ' Kafka';
      res = kafkaQuotaString;
      countQuotas++;
    }
    if (flowQuota !== 0) {
      flowQuotaString = flowQuota + ' ' + IndexProvider.getNounDay(flowQuota, 'поток', 'потока', 'потоков') + ' процессинга';
      if (countQuotas === 1) {
        res = res + ' и ' + flowQuotaString;
      } else {
        res = flowQuotaString;
      }
      countQuotas++;
    }
    if (monitoringQuota !== 0) {
      monitoringQuotaString =
        monitoringQuota + ' ' + IndexProvider.getNounDay(monitoringQuota, 'задача', 'задачи', 'задач') + ' аналитического индекса';
      if (countQuotas === 1) {
        res = res + ' и ' + monitoringQuotaString;
      } else if (countQuotas > 1) {
        res = monitoringQuotaString + ', ' + res;
      } else if (countQuotas === 0) {
        res = monitoringQuotaString;
      }
      countQuotas++;
    }
    if (indexVolumeQuota !== 0 || indexRateQuota !== 0) {
      indexQuotaString =
        SizeConverter.makeSizeString(SizeConverter.convertBytes(indexVolumeQuota), false) +
        ' полнотекстового индекса при скорости ' +
        SizeConverter.makeSizeString(SizeConverter.convertBytes(indexRateQuota), true);
      if (countQuotas === 1) {
        res = res + ' и ' + indexQuotaString;
      } else if (countQuotas > 1) {
        res = indexQuotaString + ', ' + res;
      } else if (countQuotas === 0) {
        res = indexQuotaString;
      }
      countQuotas++;
    }
    if (archiveVolumeQuota !== 0 || archiveRateQuota !== 0) {
      archiveQuotaString =
        SizeConverter.makeSizeString(SizeConverter.convertBytes(archiveVolumeQuota), false) +
        ' архивного индекса при скорости ' +
        SizeConverter.makeSizeString(SizeConverter.convertBytes(archiveRateQuota), true);
      if (countQuotas === 1) {
        res = res + ' и ' + archiveQuotaString;
      } else if (countQuotas > 1) {
        res = archiveQuotaString + ', ' + res;
      } else if (countQuotas === 0) {
        res = archiveQuotaString;
      }
      countQuotas++;
    }
    const res2 = (
      <React.Fragment>
        Обратите внимание, что у данного проекта есть занятые квоты: <div style={{ color: 'red' }}> {res}.</div>
        <b>Удаление проекта с занятыми квотами недопустимо.</b>
      </React.Fragment>
    );
    return { str: res2, numQuotas: countQuotas };
  }

  render(): React.ReactNode {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Dialog
          open={true}
          onClose={(e) => this.props.close(false)}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
        >
          <ResizableBox width={600} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              Вы уверены, что хотите удалить проект?
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                {
                  this.getInfoString(
                    this.state.currentKafkaPartitions,
                    this.state.currentFlowQuotaSize,
                    this.state.currentMonitoringTaskCount,
                    this.state.currentVolume,
                    this.state.currentRate,
                    this.state.currentArchiveVolume,
                    this.state.currentArchiveRate,
                  ).str
                }
              </DialogContentText>
              {this.state.numQuotas > 0 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      color={'primary'}
                      name="hardDelete"
                      defaultChecked={this.state.hardDelete}
                      checked={this.state.hardDelete}
                      onChange={(e) => {
                        this.setState({ hardDelete: e.target.checked });
                      }}
                    />
                  }
                  label="Принудительное удаление"
                />
              )}
              <TextField
                variant={'outlined'}
                margin="dense"
                id="projectName"
                disabled={this.state.numQuotas > 0 && !this.state.hardDelete}
                label="Имя проекта"
                defaultValue={this.state.projectName}
                onChange={(e) => {
                  this.setState({ projectName: e.target.value });
                }}
                type="projectname"
                fullWidth
              />
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button
                onClick={(e) => {
                  this.props.onClose('Cancel');
                  this.props.close(false);
                }}
                color="primary"
              >
                Отменить
              </Button>
              <Button
                disabled={this.state.numQuotas > 0 && !this.state.hardDelete}
                onClick={(e) => {
                  if (this.state.projectName !== this.props.projectName) {
                    this.props.displayError(
                      'Введенное Вами имя проекта не совпадает с именем проекта, который Вы пытаетесь удалить. ' + 'Повторите еще раз.',
                    );
                    return;
                  }
                  this.props.onClose('Ok', this.state.projectName);
                  this.props.close(false);
                }}
                color="primary"
              >
                Удалить
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(ConfirmProjectDeleteDialog);
