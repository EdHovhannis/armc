import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import * as React from 'react';

import PipelineService from '../../services/PipelineService';
import { OverdraftConfig } from '../../store/overdraft/Types';
import SizeConverter from '../../utils/SizeConverter';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';

export interface OverdraftDialogProps {
  open: boolean;
  overdraftValue: number;
  project?: string;
  name?: string;
  zoneId?: string;
  fulltextOverdraftConfig?: OverdraftConfig;
  maxAvailableOverdraft?: number;
  handleClose: () => void;
  displayError: (error) => void;
  refetchPipelines: () => void;
  changeInstanceOverdraft: (
    project: string,
    name: string,
    zoneId: string,
    value: number,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resetInstanceOverdraft: (
    project: string,
    name: string,
    zoneId: string,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
}

export interface OverdraftDialogState {
  overdraftValueNew: number | string;
  confirmChangeOverdraft: boolean;
  confirmResetOverdraft: boolean;
  waitForChangeInstance: boolean;
  waitForResetInstance: boolean;
  completeInstance: boolean;
  successInstance: boolean;
  errorMessage: string;
  errorDetails?: string;
  maxDataRateBytesPerSec: number;
}

export default class OverdraftDialog extends React.Component<OverdraftDialogProps, OverdraftDialogState> {
  constructor(props) {
    super(props);
    this.state = {
      overdraftValueNew: this.props.overdraftValue,
      confirmChangeOverdraft: false,
      confirmResetOverdraft: false,
      waitForChangeInstance: false,
      waitForResetInstance: false,
      completeInstance: false,
      successInstance: false,
      errorMessage: '',
      maxDataRateBytesPerSec: 0,
    };
  }

  componentDidMount() {
    if (this.props.project && this.props.name) {
      PipelineService.getPipelineInfo(this.props.project, this.props.name, (config) => {
        if (config && config.quota) {
          this.setState({ maxDataRateBytesPerSec: config.quota.maxDataRateBytesPerSec });
        }
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.overdraftValue !== prevProps.overdraftValue || this.props.project !== prevProps.project || this.props.name !== prevProps.name) {
      this.setState({ overdraftValueNew: this.props.overdraftValue });

      if (this.props.project && this.props.name) {
        PipelineService.getPipelineInfo(this.props.project, this.props.name, (config) => {
          if (config && config.quota) {
            this.setState({ maxDataRateBytesPerSec: config.quota.maxDataRateBytesPerSec });
          }
        });
      }
    }
  }

  handleConfirmChangeOverdraft = (value) => {
    this.setState({ confirmChangeOverdraft: false });
    if (value === 'Ok' && this.props.project && this.props.name && this.props.zoneId) {
      this.setState({
        waitForChangeInstance: true,
        completeInstance: false,
        successInstance: false,
      });
      this.props.changeInstanceOverdraft(
        this.props.project,
        this.props.name,
        this.props.zoneId,
        this.state.overdraftValueNew,
        () => {
          this.setState({
            completeInstance: true,
            successInstance: true,
          });
          this.props.handleClose();
        },
        (errorMsg: any) => {
          // Почему-то вместо error.message как строка может прийти объект, внутри которого будет еще message и details
          const message = typeof errorMsg.message === 'string' ? errorMsg.message : (errorMsg?.message?.message as string);
          this.setState({
            completeInstance: true,
            successInstance: false,
            errorMessage: `При изменении скорости произошла ошибка: ${message}`,
            errorDetails: errorMsg.details,
          });
        },
      );
    }
  };

  handleConfirmResetOverdraft = (value) => {
    this.setState({ confirmResetOverdraft: false });
    if (value === 'Ok' && this.props.project && this.props.name && this.props.zoneId) {
      this.setState({
        waitForResetInstance: true,
        completeInstance: false,
        successInstance: false,
      });
      this.props.resetInstanceOverdraft(
        this.props.project,
        this.props.name,
        this.props.zoneId,
        () => {
          this.setState({
            completeInstance: true,
            successInstance: true,
          });
          this.props.handleClose();
        },
        (errorMsg: { message: string; details?: string }) => {
          this.setState({
            completeInstance: true,
            successInstance: false,
            errorMessage: 'При сбросе скорости произошла ошибка: ' + errorMsg.message,
            errorDetails: errorMsg.details,
          });
        },
      );
    }
  };

  render() {
    const maxOverdraft =
      this.props.fulltextOverdraftConfig && (this.props.maxAvailableOverdraft || this.props.maxAvailableOverdraft == 0)
        ? this.props.fulltextOverdraftConfig?.maxOverdraftPercent <= this.props.maxAvailableOverdraft
          ? this.props.fulltextOverdraftConfig?.maxOverdraftPercent
          : this.props.maxAvailableOverdraft
        : 0;

    return (
      <React.Fragment>
        <Dialog open={this.props.open} onClose={this.props.handleClose} aria-labelledby="form-dialog-title" maxWidth="lg">
          <DialogTitle id="form-dialog-title">Изменение скорости обработки экземпляра</DialogTitle>
          <DialogContent>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div>
                <TextField
                  autoFocus
                  margin="dense"
                  id="instace"
                  label="Экземпляр задачи"
                  fullWidth
                  value={this.props.project + ' / ' + this.props.name + ' / ' + this.props.zoneId}
                  disabled={true}
                />
              </div>
              <div>
                <TextField
                  autoFocus
                  margin="dense"
                  id="overdraftValueNew"
                  label="Процент увеличения скорости обработки"
                  error={this.state.overdraftValueNew === '' || this.state.overdraftValueNew > maxOverdraft || isNaN(this.state.overdraftValueNew)}
                  helperText={'Максимальный процент увеличения скорости: ' + maxOverdraft + '%'}
                  fullWidth
                  // defaultValue={this.props.overdraftValue}
                  value={this.state.overdraftValueNew}
                  onChange={(event) => {
                    const overdraftValueNew = event.target.value;
                    if (/^\d*$/.test(overdraftValueNew)) {
                      this.setState({
                        overdraftValueNew,
                      });
                    }
                  }}
                />
                <TextField
                  autoFocus
                  margin="dense"
                  id="maxOverdraft"
                  label="Максимальная скорость обработки"
                  fullWidth
                  value={
                    this.state.overdraftValueNew
                      ? SizeConverter.makeSizeString(
                          SizeConverter.convertBytes(this.state.maxDataRateBytesPerSec * (1 + 0.01 * this.state.overdraftValueNew)),
                          true,
                        )
                      : SizeConverter.makeSizeString(SizeConverter.convertBytes(this.state.maxDataRateBytesPerSec), true)
                  }
                  disabled={true}
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.handleClose} color="primary">
              Отмена
            </Button>
            <Button
              onClick={() => {
                this.setState({ confirmResetOverdraft: true });
              }}
              color="primary"
            >
              Сбросить овердрафт
            </Button>
            <Button
              onClick={() => {
                if (this.state.overdraftValueNew < 0 || this.state.overdraftValueNew > maxOverdraft || isNaN(this.state.overdraftValueNew)) {
                  this.props.displayError('Процент увеличения скорости введен некорректно');
                  return;
                }
                this.setState({ confirmChangeOverdraft: true });
              }}
              color="primary"
            >
              Подтвердить
            </Button>
          </DialogActions>
        </Dialog>

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите изменить скорость обработки экземпляра ' +
            this.props.project +
            ' / ' +
            this.props.name +
            ' (' +
            this.props.zoneId +
            ')?'
          }
          open={this.state.confirmChangeOverdraft}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmChangeOverdraft}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите сбросить скорость обработки экземпляра ' +
            this.props.project +
            ' / ' +
            this.props.name +
            ' (' +
            this.props.zoneId +
            ') до значения по умолчанию?'
          }
          open={this.state.confirmResetOverdraft}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmResetOverdraft}
        />

        <WaitingDialog
          customFormat={true}
          title={`Изменение скорости обработки`}
          open={this.state.waitForChangeInstance || this.state.waitForResetInstance}
          onClose={() => {
            this.setState({
              waitForChangeInstance: false,
              waitForResetInstance: false,
              errorMessage: '',
            });
            if (this.state.successInstance) {
              this.props.refetchPipelines();
            }
          }}
          complete={this.state.completeInstance}
          success={this.state.successInstance}
          successMessage={'Скорость обработки изменена'}
          errorMessage={this.state.errorMessage}
          needDetailedInfo={true}
          details={this.state.errorDetails}
        />
      </React.Fragment>
    );
  }
}
