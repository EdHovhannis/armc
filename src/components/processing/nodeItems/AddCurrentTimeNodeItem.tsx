import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  withStyles,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { ProcessingNode } from '../../../store/flow/Types';

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

export interface AddCurrentTimeNodeItemProps {
  timezones: Array<string>;
  timeFormats: Array<string>;
  currentNode?: ProcessingNode;
  canEdit: boolean;

  displayError(msg: string): any;

  onClose(value: string, data?: any): any;

  close(value: boolean): any;
}

export interface AddCurrentTimeNodeItemState {
  toField: string;
  timeFormat: string;
  timezone: string;
  currentNode?: ProcessingNode;
}

class AddCurrentTimeNodeItem extends React.Component<AddCurrentTimeNodeItemProps, AddCurrentTimeNodeItemState> {
  constructor(props) {
    super(props);
    this.state = {
      toField: this.props.currentNode ? this.props.currentNode.node.toField : '',
      timeFormat: this.props.currentNode ? this.props.currentNode.node.timeFormat : '',
      timezone: this.props.currentNode ? this.props.currentNode.node.timezone : '',
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.currentNode !== state.currentNode) {
      return {
        toField: props.currentNode ? props.currentNode.node.toField : '',
        timeFormat: props.currentNode ? props.currentNode.node.timeFormat : '',
        timezone: props.currentNode ? props.currentNode.node.timezone : '',
        currentNode: props.currentNode,
      };
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Dialog
          open={true}
          onClose={(e) => {
            this.props.close(false);
          }}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
        >
          <ResizableBox height={'calc(200px + 150 * ${this.state.numArgs})'} width={750} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              Добавление текущего времени.
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Укажите название поля, в которое будет записываться время записи, а также выберите формат времени и временную зону, в которой Вы
                хотите хранить время.
              </DialogContentText>
              <TextField
                margin="dense"
                id="toField"
                disabled={!this.props.canEdit}
                label="Название поля времени"
                error={this.state.toField === ''}
                onChange={(e) => {
                  this.setState({ toField: e.target.value });
                }}
                defaultValue={this.state.toField}
                type="toField"
                fullWidth
              />
              <Autocomplete
                options={this.props.timeFormats.filter((format) => {
                  return format !== 'UNIX_TIMESTAMP_MILLIS';
                })}
                disabled={!this.props.canEdit}
                renderOption={(option) => {
                  return option;
                }}
                getOptionLabel={(option) => {
                  return option;
                }}
                defaultValue={this.state.timeFormat}
                onChange={(event, newValue: string) => {
                  this.setState({ timeFormat: newValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    error={this.state.timeFormat === ''}
                    label="Формат времени"
                    placeholder="Выберите формат времени"
                    margin="normal"
                    fullWidth
                  />
                )}
              />
              <Autocomplete
                options={this.props.timezones}
                renderOption={(option) => {
                  return option;
                }}
                getOptionLabel={(option) => {
                  return option;
                }}
                disabled={!this.props.canEdit}
                defaultValue={this.state.timezone}
                onChange={(event, newValue: string) => {
                  this.setState({ timezone: newValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    error={this.state.timezone === ''}
                    label="Временная зона"
                    placeholder="Выберите временную зону"
                    margin="normal"
                    fullWidth
                  />
                )}
              />
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button
                onClick={(e) => {
                  this.props.onClose('Cancel');
                  this.props.close(false);
                }}
                color="primary"
              >
                {this.props.canEdit ? 'Отменить' : 'Закрыть'}
              </Button>
              {this.props.canEdit && (
                <Button
                  onClick={(e) => {
                    if (this.state.toField == '' || this.state.toField == null) {
                      this.props.displayError('Нужно ввести название поля!');
                      return;
                    }
                    if (this.state.timeFormat == '' || this.state.timeFormat == null) {
                      this.props.displayError('Нужно указать формат времени!');
                      return;
                    }
                    if (this.state.timezone == '' || this.state.timezone == null) {
                      this.props.displayError('Нужно указать временную зону!');
                      return;
                    }
                    this.props.onClose('Ok', this.state);
                    this.props.close(false);
                  }}
                  color="primary"
                >
                  Сохранить
                </Button>
              )}
            </DialogActions>
          </ResizableBox>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(AddCurrentTimeNodeItem);
