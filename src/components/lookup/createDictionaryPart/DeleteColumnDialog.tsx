import { DialogActions } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { createStyles, withStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { COLUMN_PREFIX } from '../../../utils/LookupUtils';

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

export interface DeleteColumnDialogProps {
  columns: any[];

  close(): any;

  changeColumn(column: any): any;

  displayError(msg: string): any;
  displaySuccess(msg: string): any;
}

export interface DeleteColumnDialogStat {
  column?: any;
}

class DeleteColumnDialog extends React.Component<DeleteColumnDialogProps, DeleteColumnDialogStat> {
  constructor(props) {
    super(props);
    this.state = {
      column: {
        headerName: '',
        field: '',
        editable: true,
      },
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
          <ResizableBox width={230} height={210} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              Удаление столбца
            </DialogTitle>
            <DialogContent>
              <Autocomplete
                options={this.props.columns}
                renderOption={(option: any) => {
                  return option.field.split(COLUMN_PREFIX)[1];
                }}
                getOptionLabel={(option) => {
                  return option.field.split(COLUMN_PREFIX)[1];
                }}
                defaultValue={this.state.column}
                onChange={(event, newValue) => {
                  this.setState({ column: newValue });
                }}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Столбец" placeholder="Выберите столбец" margin="normal" fullWidth />
                )}
              />
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button onClick={() => this.props.close()} color="primary">
                Отменить
              </Button>
              <Button
                onClick={(e) => {
                  if (this.state.column.field === '') {
                    this.props.displayError('Столбец не выбран.');
                    return;
                  }
                  this.props.close();
                  this.props.changeColumn(this.state.column);
                  this.props.displaySuccess('Столбец был успешно удален');
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

export default withStyles(styles)(DeleteColumnDialog);
