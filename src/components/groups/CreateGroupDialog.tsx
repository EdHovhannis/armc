import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import * as React from 'react';

import { NAME_REGEXP } from '../../utils/Utils';

export interface CreateGroupDialogProps {
  open: boolean;
  handleClose();
  handleGroupCreate(team_name: string);
  displayError(msg: string);
}

export interface CreateGroupDialogState {
  groupName: string;
}

export default class CreateGroupDialog extends React.Component<CreateGroupDialogProps, CreateGroupDialogState> {
  state = {
    groupName: '',
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Dialog open={this.props.open} onClose={this.props.handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Имя группы</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="topic"
            label="Имя группы"
            fullWidth
            onChange={(event) => this.setState({ groupName: event.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (this.state.groupName.trim().length === 0) {
                this.props.displayError('Имя группы не может быть пустым');
                return;
              }
              if (this.state.groupName.length > 255) {
                this.props.displayError('Имя группы не должно превышать 255 символов');
                return;
              }
              if (!NAME_REGEXP.test(this.state.groupName)) {
                this.props?.displayError('Имя группы содержит недопустимые символы');
                return;
              }

              this.props.handleGroupCreate(this.state.groupName);
            }}
            color="primary"
          >
            Создать
          </Button>
          <Button onClick={this.props.handleClose} color="primary">
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
