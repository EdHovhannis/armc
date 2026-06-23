import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import * as React from 'react';

import ArchiveService from '../../services/ArchiveService';
import { ArchiveTask, ArchiveTaskInstance } from '../../store/archive/Types';
import { OverdraftConfig } from '../../store/overdraft/Types';
import SizeConverter from '../../utils/SizeConverter';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';
import { Loader } from '../utils/Loader';

export interface OverdraftDialogProps {
  isAdmin: boolean;
  open: any;
  archiveOverdraftConfig?: OverdraftConfig;
  handleClose: () => void;
  changeInstanceOverdraft: (
    archiveTaskInstanceId: string,
    value: number,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resetInstanceOverdraft: (
    archiveTaskInstanceId: string,
    okCallback?: () => void,
    errorCallback?: (errors: { msg: { message: string; details?: string }; archiveTaskInstanceId: string }[]) => void,
  ) => void;
  displayError: (error) => void;
  refetchArchiveTasks: () => void;
  archiveTaskConfig?: ArchiveTask | null;
  fetchArchiveTaskConfig: (project: string, name: string) => void;
  instance?: ArchiveTaskInstance;
}

export interface OverdraftDialogState {
  overdraftValueNew: number;
  confirmChangeOverdraft: boolean;
  confirmResetOverdraft: boolean;
  waitForChangeInstance: boolean;
  waitForResetInstance: boolean;
  completeInstance: boolean;
  successInstance: boolean;
  errorMessage: string;
  detailsMessage?: string;
}

export default class OverdraftDialog extends React.PureComponent<OverdraftDialogProps, OverdraftDialogState> {
  constructor(props) {
    super(props);
    this.state = {
      overdraftValueNew: 0,
      confirmChangeOverdraft: false,
      confirmResetOverdraft: false,
      waitForChangeInstance: false,
      waitForResetInstance: false,
      completeInstance: false,
      successInstance: false,
      errorMessage: '',
    };

    this.onClose = this.onClose.bind(this);
  }

  onClose() {
    this.setState({ overdraftValueNew: 0 });
    this.props.handleClose();
  }

  componentDidUpdate(prevProps) {
    const { instance, open } = this.props;
    if (!instance) {
      return;
    }
    const { project, name, overdraftPercent } = instance;
    if (prevProps.open === false && open) {
      if (typeof this.props.archiveTaskConfig === 'undefined') {
        this.props.fetchArchiveTaskConfig(project, name);
      }
    }
    if (instance.archiveTaskInstanceId !== prevProps.instance?.archiveTaskInstanceId) {
      this.setState({
        overdraftValueNew: overdraftPercent,
      });
    }
  }

  handleConfirmChangeOverdraft = (value) => {
    const { instance } = this.props;
    if (!instance) {
      return;
    }
    this.setState({ confirmChangeOverdraft: false });
    if (value !== 'Ok') {
      return;
    }

    this.setState({
      waitForChangeInstance: true,
      completeInstance: false,
      successInstance: false,
    });

    this.props.changeInstanceOverdraft(
      instance.archiveTaskInstanceId,
      parseInt(this.state.overdraftValueNew, 10),
      () => {
        this.setState({
          completeInstance: true,
          successInstance: true,
        });
      },
      (error: any) => {
        // Почему-то вместо error.message как строка может прийти объект, внутри которого будет еще message и details
        const message = typeof error.message === 'string' ? error.message : (error?.message?.message as string);
        this.setState({
          completeInstance: true,
          successInstance: false,
          errorMessage: `При изменении скорости произошла ошибка: ${message}`,
          detailsMessage: error.details,
        });
      },
    );
  };

  handleConfirmResetOverdraft = (value) => {
    const { instance } = this.props;
    if (!instance) {
      return;
    }
    this.setState({ confirmResetOverdraft: false });
    if (value !== 'Ok') {
      return;
    }

    this.props.resetInstanceOverdraft(instance.archiveTaskInstanceId);
    this.onClose();
  };

  render() {
    const { open, archiveTaskConfig, archiveOverdraftConfig, instance } = this.props;
    if (!instance) {
      return null;
    }
    const { project, name, zoneId } = instance;
    const maxAvailableOverdraft = instance?.metadata?.maxAvailableOverdraft;
    const maxDataRateBytesPerSec = archiveTaskConfig?.quota.maxDataRateBytesPerSec;
    const maxOverdraft =
      archiveOverdraftConfig && (maxAvailableOverdraft || maxAvailableOverdraft == 0)
        ? archiveOverdraftConfig?.maxOverdraftPercent <= maxAvailableOverdraft
          ? archiveOverdraftConfig?.maxOverdraftPercent
          : maxAvailableOverdraft
        : 0;
    if (!maxDataRateBytesPerSec) {
      return null;
    }
    if (open && !archiveTaskConfig) {
      return (
        <React.Fragment>
          <Dialog open={this.props.open} onClose={this.onClose} aria-labelledby="form-dialog-title" maxWidth="lg">
            <Loader style={{ position: 'relative', width: '40vw', height: '30vh' }} />
          </Dialog>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <Dialog open={this.props.open} onClose={this.onClose} aria-labelledby="form-dialog-title" maxWidth="lg">
          <DialogTitle id="form-dialog-title">
            {this.props.isAdmin ? 'Изменение скорости обработки экземпляра' : 'Просмотр скорости обработки экземпляра'}
          </DialogTitle>
          <DialogContent>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div>
                <TextField
                  autoFocus
                  margin="dense"
                  id="instace"
                  label="Экземпляр задачи"
                  fullWidth
                  value={project + ' / ' + name + ' / ' + zoneId}
                  disabled={true}
                />
              </div>
              <div>
                <TextField
                  autoFocus
                  margin="dense"
                  id="overdraftValueNew"
                  label="Процент увеличения скорости обработки"
                  disabled={!this.props.isAdmin}
                  error={
                    this.props.isAdmin &&
                    (this.state.overdraftValueNew < 0 ||
                      this.state.overdraftValueNew > maxOverdraft ||
                      isNaN(this.state.overdraftValueNew) ||
                      this.state.overdraftValueNew === '')
                  }
                  helperText={this.props.isAdmin ? 'Максимальный процент увеличения скорости: ' + maxOverdraft + '%' : ''}
                  fullWidth
                  // defaultValue={this.props.overdraftValue}
                  value={this.state.overdraftValueNew}
                  onChange={(event) => {
                    this.setState({
                      overdraftValueNew: event.target.value,
                    });
                  }}
                />
                <TextField
                  autoFocus
                  margin="dense"
                  id="maxOverdraft"
                  label="Максимальная скорость обработки"
                  fullWidth
                  value={SizeConverter.makeSizeString(
                    SizeConverter.convertBytes(maxDataRateBytesPerSec * (1 + 0.01 * this.state.overdraftValueNew)),
                    true,
                  )}
                  disabled={true}
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onClose} color="primary">
              Отмена
            </Button>
            {this.props.isAdmin && (
              <Button
                onClick={() => {
                  this.setState({ confirmResetOverdraft: true });
                }}
                color="primary"
              >
                Сбросить овердрафт
              </Button>
            )}
            {this.props.isAdmin && (
              <Button
                onClick={() => {
                  if (
                    this.state.overdraftValueNew < 0 ||
                    this.state.overdraftValueNew > maxOverdraft ||
                    isNaN(this.state.overdraftValueNew) ||
                    this.state.overdraftValueNew === ''
                  ) {
                    this.props.displayError('Процент увеличения скорости введен некорректно');
                    return;
                  }
                  this.setState({ confirmChangeOverdraft: true });
                }}
                color="primary"
              >
                Подтвердить
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <ConfirmDialog
          warningText={'Вы уверены, что хотите изменить скорость обработки экземпляра ' + project + ' / ' + name + ' (' + zoneId + ')?'}
          open={this.state.confirmChangeOverdraft}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmChangeOverdraft}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите сбросить скорость обработки экземпляра ' + project + ' / ' + name + ' (' + zoneId + ') до значения по умолчанию?'
          }
          open={this.state.confirmResetOverdraft}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmResetOverdraft}
        />

        <WaitingDialog
          customFormat={true}
          title={`Изменение скорости обработки`}
          open={this.state.waitForChangeInstance}
          onClose={() => {
            this.setState({
              waitForChangeInstance: false,
              errorMessage: '',
              detailsMessage: undefined,
            });
            this.onClose();
          }}
          complete={this.state.completeInstance}
          success={this.state.successInstance}
          successMessage={'Скорость обработки изменена'}
          errorMessage={this.state.errorMessage}
          needDetailedInfo={true}
          details={this.state.detailsMessage}
        />
      </React.Fragment>
    );
  }
}
