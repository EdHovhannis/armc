import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import * as React from 'react';

export interface CreateOrgDialogProps {
  open: boolean;
  handleClose();
  handleOrgCreate(orgName: string, projectId: string);
}

export interface CreateOrgDialogState {
  orgName: string;
  projectId: string;
}

export default class CreateOrgDialog extends React.Component<CreateOrgDialogProps, CreateOrgDialogState> {
  state = {
    orgName: '',
    projectId: '',
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={() => {
          this.setState({
            orgName: '',
            projectId: '',
          });
          this.props.handleClose();
        }}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Имя организации</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="orgName"
            label="Имя организации"
            fullWidth
            value={this.state.orgName}
            onChange={(event) => this.setState({ orgName: event.target.value })}
          />
          <TextField
            autoFocus
            margin="dense"
            id="projectId"
            label="projectId"
            fullWidth
            value={this.state.projectId}
            onChange={(event) => this.setState({ projectId: event.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              this.props.handleOrgCreate(this.state.orgName.trim(), this.state.projectId.trim());
              this.setState({
                orgName: '',
                projectId: '',
              });
            }}
            disabled={this.state.orgName.trim().length === 0}
            color="primary"
          >
            Создать
          </Button>
          <Button
            onClick={() => {
              this.setState({
                orgName: '',
                projectId: '',
              });
              this.props.handleClose();
            }}
            color="primary"
          >
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
