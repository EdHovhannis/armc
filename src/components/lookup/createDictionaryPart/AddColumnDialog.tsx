import { DialogActions, Grid, Tooltip } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { ERROR_NAME_REGEXP_STRING, NAME_REGEXP } from '../../../utils/Utils';

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

export interface AddColumnDialogProps {
  close(): any;

  changeColumnName(columnName: string): any;

  displayError(msg: string): any;
  displaySuccess(msg: string): any;
}

export interface AddColumnDialogStat {
  columnName: string;
}

class AddColumnDialog extends React.Component<AddColumnDialogProps, AddColumnDialogStat> {
  constructor(props) {
    super(props);
    this.state = {
      columnName: undefined,
    };
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Dialog
          open={true}
          onClose={() => this.props.close()}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
        >
          <ResizableBox width={450} height={186} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              Добавление нового cтолбца
            </DialogTitle>
            <DialogContent>
              {!NAME_REGEXP.exec(this.state.columnName) ? (
                <Tooltip placement="bottom-start" title={ERROR_NAME_REGEXP_STRING}>
                  <TextField
                    autoFocus
                    fullWidth
                    error={!NAME_REGEXP.exec(this.state.columnName)}
                    label="Имя столбца"
                    placeholder={'Введите имя нового столбца'}
                    onChange={(e) => {
                      this.setState({ columnName: e.target.value });
                    }}
                    value={this.state.columnName}
                  />
                </Tooltip>
              ) : (
                <TextField
                  autoFocus
                  fullWidth
                  error={!NAME_REGEXP.exec(this.state.columnName)}
                  label="Имя столбца"
                  placeholder={'Введите имя нового столбца'}
                  onChange={(e) => {
                    this.setState({ columnName: e.target.value });
                  }}
                  value={this.state.columnName}
                />
              )}
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button onClick={() => this.props.close()} color="primary">
                Отменить
              </Button>
              <Button
                onClick={(e) => {
                  if (this.state.columnName === '' || this.state.columnName == null) {
                    this.props.displayError('Имя столбца не может быть пустым.');
                    return;
                  } else if (!NAME_REGEXP.exec(this.state.columnName)) {
                    this.props.displayError('В имени столбца присутствуют недопустимые символы.');
                    return;
                  } else {
                    this.props.close();
                    this.props.changeColumnName(this.state.columnName);
                    this.props.displaySuccess('Cтолбец успешно добавлен');
                  }
                }}
                color="primary"
              >
                Добавить
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(AddColumnDialog);
