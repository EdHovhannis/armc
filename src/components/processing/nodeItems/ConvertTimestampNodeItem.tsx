import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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

export interface ConvertTimestampNodeItemProps {
  timezones: Array<string>;
  timeFormats: Array<string>;
  currentNode?: ProcessingNode;
  canEdit: boolean;

  displayError(msg: string): any;

  onClose(value: string, data?: any): any;

  close(value: boolean): any;
}

export interface ConvertTimestampNodeItemState {
  field: string;
  inputTimezone: string;
  outputTimezone: string;
  inputFormats: Array<string>;
  outputFormat: string;
  currentNode?: ProcessingNode;
}

class ConvertTimestampNodeItem extends React.Component<ConvertTimestampNodeItemProps, ConvertTimestampNodeItemState> {
  constructor(props) {
    super(props);
    this.state = {
      field: this.props.currentNode ? this.props.currentNode.node.field : '',
      inputTimezone: this.props.currentNode ? this.props.currentNode.node.inputTimezone : '',
      outputTimezone: this.props.currentNode ? this.props.currentNode.node.outputTimezone : '',
      outputFormat: this.props.currentNode ? this.props.currentNode.node.outputFormat : '',
      inputFormats: this.props.currentNode
        ? this.props.currentNode.node.inputFormats.length > 0
          ? this.props.currentNode.node.inputFormats
          : []
        : [],
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.currentNode !== state.currentNode) {
      return {
        field: props.currentNode ? props.currentNode.node.field : '',
        inputTimezone: props.currentNode ? props.currentNode.node.inputTimezone : '',
        outputTimezone: props.currentNode ? props.currentNode.node.outputTimezone : '',
        outputFormat: props.currentNode ? props.currentNode.node.outputFormat : '',
        inputFormats: props.currentNode ? (props.currentNode.node.inputFormats.length > 0 ? props.currentNode.node.inputFormats : []) : [],
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
          <ResizableBox width={750} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              Конвертация времени.
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Укажите название поля времени, которое нужно конвертировать, а также выберите входные формат времени и временную зону и те, в которые
                Вы хотите конвертировать время.
              </DialogContentText>
              <TextField
                margin="dense"
                id="toField"
                disabled={!this.props.canEdit}
                label="Название поля времени"
                error={this.state.field === ''}
                onChange={(e) => {
                  this.setState({ field: e.target.value });
                }}
                defaultValue={this.state.field}
                type="toField"
                fullWidth
              />
              <Autocomplete
                multiple
                disabled={!this.props.canEdit}
                options={this.props.timeFormats}
                getOptionLabel={(option) => option}
                defaultValue={this.state.inputFormats}
                onChange={(event, values) => {
                  this.setState({ inputFormats: values });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    error={this.state.inputFormats.length < 1}
                    label="Исходный формат времени"
                    placeholder="Выбрать формат(ы)"
                    margin="normal"
                    fullWidth
                  />
                )}
              />
              <Autocomplete
                options={this.props.timezones}
                disabled={!this.props.canEdit}
                renderOption={(option) => {
                  return option;
                }}
                getOptionLabel={(option) => {
                  return option;
                }}
                defaultValue={this.state.inputTimezone}
                onChange={(event, newValue) => {
                  this.setState({ inputTimezone: newValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    error={this.state.inputTimezone === ''}
                    label="Входящая временная зона"
                    placeholder="Выберите временную зону"
                    margin="normal"
                    fullWidth
                  />
                )}
              />
              <Autocomplete
                options={this.props.timeFormats}
                disabled={!this.props.canEdit}
                renderOption={(option) => {
                  return option;
                }}
                getOptionLabel={(option) => {
                  return option;
                }}
                defaultValue={this.state.outputFormat}
                onChange={(event, newValue) => {
                  this.setState({ outputFormat: newValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    error={this.state.outputFormat === ''}
                    label="Требуемый формат времени"
                    placeholder="Выберите формат времени"
                    margin="normal"
                    fullWidth
                  />
                )}
              />
              <Autocomplete
                options={this.props.timezones}
                disabled={!this.props.canEdit}
                renderOption={(option) => {
                  return option;
                }}
                getOptionLabel={(option) => {
                  return option;
                }}
                defaultValue={this.state.outputTimezone}
                onChange={(event, newValue) => {
                  this.setState({ outputTimezone: newValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    error={this.state.outputTimezone === ''}
                    label="Требуемая ременная зона"
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
                    if (this.state.field == '' || this.state.field == null) {
                      this.props.displayError('Нужно ввести название поля!');
                      return;
                    }
                    if (this.state.inputFormats.length < 1) {
                      this.props.displayError('Нужно указать хотя бы один входной формат!');
                      return;
                    }
                    if (this.state.inputTimezone == '' || this.state.inputTimezone == null) {
                      this.props.displayError('Нужно указать входную временную зону!');
                      return;
                    }
                    if (this.state.outputFormat == '' || this.state.outputFormat == null) {
                      this.props.displayError('Нужно указать требуемый формат времени!');
                      return;
                    }
                    if (this.state.outputTimezone == '' || this.state.outputTimezone == null) {
                      this.props.displayError('Нужно указать требуемую временную зону!');
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

export default withStyles(styles)(ConvertTimestampNodeItem);
