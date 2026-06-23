import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import * as React from 'react';

export interface CreateTeamDialogProps {
  open: boolean;

  handleClose();
  handleProjectCreate(team_name: string, short_name: string);
  displayError(msg);
}

export interface CreateTeamDialogState {
  projectName: string;
  shortName: string;
}

export default class CreateProjectForm extends React.Component<CreateTeamDialogProps, CreateTeamDialogState> {
  state = {
    projectName: '',
    shortName: '',
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Dialog open={this.props.open} onClose={this.props.handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Создание проекта</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="project-full-name"
            label="Имя проекта"
            fullWidth
            onChange={(event) => this.setState({ projectName: event.target.value })}
          />
        </DialogContent>
        <DialogContent>
          <TextField
            helperText="Будет использоваться при создании всех остальных ресурсов"
            margin="dense"
            id="project-short"
            label="Ключ проекта"
            fullWidth
            onChange={(event) => this.setState({ shortName: event.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (this.state.shortName == '') {
                this.props.displayError('Ключ проекта не может быть пустым!');
                return;
              }
              if (this.state.projectName == '') {
                this.props.displayError('Имя проекта не может быть пустым!');
                return;
              }
              this.props.handleProjectCreate(this.state.projectName, this.state.shortName);
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
