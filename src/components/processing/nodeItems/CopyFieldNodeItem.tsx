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
import Grid from '@material-ui/core/Grid';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
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

export interface CopyFieldNodeItemProps {
  displayError(msg: string): any;

  onClose(value: string, data?: any): any;

  close(value: boolean): any;

  currentNode?: ProcessingNode;
  canEdit: boolean;
}

export interface CopyFieldNodeItemState {
  fromField: string;
  toFields: Array<string>;
  numArgs: number;
  currentNode?: ProcessingNode;
}

class CopyFieldNodeItem extends React.Component<CopyFieldNodeItemProps, CopyFieldNodeItemState> {
  constructor(props) {
    super(props);
    this.state = {
      fromField: this.props.currentNode
        ? this.props.currentNode.node?.copyParametersList.length > 0
          ? this.props.currentNode.node?.copyParametersList[0].fromField
          : ''
        : '',
      toFields: this.props.currentNode
        ? this.props.currentNode.node?.copyParametersList.length > 0
          ? this.props.currentNode.node?.copyParametersList[0]?.toFields
          : ['']
        : [''],
      numArgs: this.props.currentNode
        ? this.props.currentNode.node?.copyParametersList.length > 0
          ? this.props.currentNode.node?.copyParametersList[0]?.toFields.length
          : 1
        : 1,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.currentNode !== state.currentNode) {
      return {
        fromField: props.currentNode
          ? props.currentNode.node?.copyParametersList.length > 0
            ? props.currentNode.node?.copyParametersList[0].fromField
            : ''
          : '',
        toFields: props.currentNode
          ? props.currentNode.node?.copyParametersList.length > 0
            ? props.currentNode.node?.copyParametersList[0]?.toFields
            : ['']
          : [''],
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
              Копирование информации из одного поля в другое(-ие) поле(-я)
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Укажите название поля, из которого нужно будет копировать информацию, а также поле или поля, в которое(-ые) эта информация будет
                копироваться.
              </DialogContentText>
              <TextField
                disabled={!this.props.canEdit}
                margin="dense"
                id="toField"
                label="Источник"
                error={this.state.fromField === ''}
                onChange={(e) => {
                  this.setState({ fromField: e.target.value });
                }}
                defaultValue={this.state.fromField}
                type="toField"
                fullWidth
              />
              {this.state.toFields.map((value, ind) => {
                return (
                  <Grid container direction={'row'} alignItems={'center'}>
                    <TextField
                      disabled={!this.props.canEdit}
                      error={this.state.toFields[ind] === ''}
                      value={this.state.toFields[ind]}
                      variant={'standard'}
                      placeholder={'Поле назначения не введено'}
                      label={'Поле назначения'}
                      style={{
                        width:
                          ind === this.state.toFields.length - 1 && this.state.toFields.length !== 1 ? 'calc(100% - 132px)' : 'calc(100% - 66px)',
                        marginTop: 10,
                      }}
                      onChange={(event) => {
                        const tmp = this.state.toFields;
                        tmp[ind] = event.target.value;
                        this.setState({ toFields: tmp, numArgs: tmp.length });
                      }}
                    ></TextField>
                    {this.state.toFields.length !== 1 && (
                      <Button
                        disabled={!this.props.canEdit}
                        color={'primary'}
                        style={{
                          height: '56px',
                          marginTop: '8px',
                          marginLeft: 2,
                        }}
                        onClick={() => {
                          const tmp = this.state.toFields;
                          tmp.splice(ind, 1);
                          this.setState({ toFields: tmp, numArgs: tmp.length });
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    )}
                    {ind === this.state.toFields.length - 1 && (
                      <Button
                        disabled={!this.props.canEdit}
                        color={'primary'}
                        style={{
                          height: '56px',
                          marginTop: '8px',
                          marginLeft: 2,
                        }}
                        onClick={() => {
                          const numArgs = this.state.numArgs + 1;
                          if (this.state.toFields[this.state.toFields.length - 1] !== '')
                            this.setState({ toFields: [...this.state.toFields, ''], numArgs: numArgs });
                        }}
                      >
                        <AddIcon />
                      </Button>
                    )}
                  </Grid>
                );
              })}
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
                    if (this.state.toFields.length < 1 || (this.state.toFields.length === 1 && this.state.toFields[0] === '')) {
                      this.props.displayError('Нужно указать хотя бы одно итоговое поле!');
                      return;
                    }
                    if (this.state.fromField == '' || this.state.fromField == null) {
                      this.props.displayError('Нужно указать поле-источник!');
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

export default withStyles(styles)(CopyFieldNodeItem);
