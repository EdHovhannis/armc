import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import ConfirmDialog from '../../ConfirmDialog';

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

export interface AddLocalUserDialogProps {
  displayError: (msg: string) => void;
  close: () => void;
  addLocalUser: (userName: string) => void;
}

export interface AddLocalUserDialogState {
  userName?: string;
  confirmClose: boolean;
}

class AddLocalUserDialog extends React.Component<AddLocalUserDialogProps, AddLocalUserDialogState> {
  constructor(props) {
    super(props);
    this.state = {
      userName: undefined,
      confirmClose: false,
    };
    this.handleConfirmCloseDialogClose = this.handleConfirmCloseDialogClose.bind(this);
  }

  handleConfirmCloseDialogClose(value) {
    this.setState({ confirmClose: false });
    if (value === 'Ok') {
      this.props.close();
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Dialog
          open={true}
          onClose={() => {
            this.setState({ confirmClose: true });
          }}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
        >
          <ResizableBox className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              Добавление нового локального пользователя
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                error={this.state.userName === ''}
                margin="dense"
                label="Логин пользователя"
                onChange={(e) => {
                  this.setState({ userName: e.target.value });
                }}
                value={this.state.userName}
                fullWidth
              />
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button
                onClick={() => {
                  this.setState({ confirmClose: true });
                }}
                color="primary"
              >
                Отменить
              </Button>
              <Button
                onClick={(e) => {
                  if (this.state.userName === '' || !this.state.userName) {
                    this.props.displayError('Логин пользователя не введен или введен некорректно');
                    return;
                  }
                  this.props.addLocalUser(this.state.userName);
                  this.props.close();
                }}
                color="primary"
              >
                Добавить
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>

        <ConfirmDialog
          warningText={'Вы уверены, что хотите закрыть окно?'}
          open={this.state.confirmClose}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmCloseDialogClose}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(AddLocalUserDialog);
