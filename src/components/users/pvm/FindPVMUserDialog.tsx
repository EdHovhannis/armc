import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { createStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import FindUserContentContainer from '../../../containers/users/pvm/FindUserContentContainer';
import { User } from '../../../store/auth/Types';
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
    <Draggable handle="#draggable-dialog-find-pvm-user" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface FindPVMUserDialogProps {
  close: () => void;
  onChange: (user: User) => void;
  displayError: (errorMessage: string) => void;

  fetchUser: (user_id: number, okCallback?, errorCallback?) => void;
  minCountMask: number;
}

export interface FindPVMUserDialogStat {
  confirmClose: boolean;
  user?: User;
}

class FindPVMUserDialog extends React.Component<FindPVMUserDialogProps, FindPVMUserDialogStat> {
  constructor(props) {
    super(props);
    this.state = {
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
          onClose={(e) => {
            this.setState({ confirmClose: true });
          }}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-find-pvm-user"
        >
          <ResizableBox width={900} height={'ss'} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-find-pvm-user">
              Поиск пользователя по маске
            </DialogTitle>
            <DialogContent>
              <FindUserContentContainer
                choseUser={(user) => {
                  this.setState({ user: user });
                }}
              />
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button
                onClick={(e) => {
                  this.setState({ confirmClose: true });
                }}
                color="primary"
              >
                Закрыть
              </Button>
              <Button
                disabled={!this.state.user}
                onClick={(e) => {
                  if (this.state.user == null) {
                    this.props.displayError('Пользователь не выбран');
                    return;
                  }
                  this.props.onChange(this.state.user);
                  this.props.close();
                }}
                variant="contained"
                color="primary"
              >
                Готово
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

export default withStyles(styles)(FindPVMUserDialog);
