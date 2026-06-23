import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';

import ConfirmDialog from '../ConfirmDialog';

export interface ResetOverdraftDialogProps {
  open: boolean;
  zones: string[];
  handleClose();
  handleResetOverdraft(zone: string);
  displayError(error: string);
}

export interface ResetOverdraftDialogState {
  zone: string;
  openDialogReset: boolean;
}

export default class ResetOverdraftDialog extends React.Component<ResetOverdraftDialogProps, ResetOverdraftDialogState> {
  constructor(props) {
    super(props);

    this.state = {
      zone: '',
      openDialogReset: false,
    };
  }

  handleConfirmAllResetClose = (value) => {
    this.setState({ openDialogReset: false });
    if (value === 'Ok') {
      this.props.handleResetOverdraft(this.state.zone);
    }
  };

  render() {
    return (
      <>
        <Dialog open={this.props.open} onClose={this.props.handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Сбросить овердрафт скорости по зоне</DialogTitle>
          <DialogContent>
            <Autocomplete
              id="choose-zone-for-reset"
              fullWidth
              noOptionsText={'Зоны не найдены'}
              getOptionLabel={(option) => option}
              renderOption={(option) => option}
              options={this.props.zones}
              disableClearable={true}
              onChange={(event, value) => {
                if (value != null && value && value !== '') {
                  this.setState({ zone: value });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  helperText={'Овердрафт скорости будет сброшен до значений по умолчанию для всех экземпляров выбранной зоны'}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.handleClose} color="primary">
              Отменить
            </Button>
            <Button
              onClick={() => {
                if (this.state.zone === '') {
                  this.props.displayError('Не выбрана конкретная зона');
                  return;
                }
                this.setState({ openDialogReset: true });
              }}
              color="primary"
            >
              Выбрать
            </Button>
          </DialogActions>
        </Dialog>

        <ConfirmDialog
          warningText={'Вы уверены, что хотите сбросить скорость обработки для всех экземпляров до значений по умолчанию?'}
          open={this.state.openDialogReset}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmAllResetClose}
        />
      </>
    );
  }
}
