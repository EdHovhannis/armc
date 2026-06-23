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

export interface FlattenNodeItemProps {
  displayError(msg: string): any;

  onClose(value: string, data?: any): any;

  close(value: boolean): any;

  currentNode?: ProcessingNode;
  canEdit: boolean;
}

export interface FlattenNodeItemState {
  excludedFromFlatteningFields: Array<string>;
  numArgs: number;
  currentNode?: ProcessingNode;
}

class FlattenNodeItem extends React.Component<FlattenNodeItemProps, FlattenNodeItemState> {
  constructor(props) {
    super(props);

    this.state = {
      excludedFromFlatteningFields: this.props.currentNode
        ? this.props.currentNode.node?.excludedFromFlatteningFields.length > 0
          ? this.props.currentNode.node?.excludedFromFlatteningFields
          : ['']
        : [''],
      numArgs: this.props.currentNode
        ? this.props.currentNode.node?.excludedFromFlatteningFields.length === 0
          ? 1
          : this.props.currentNode.node?.excludedFromFlatteningFields.length
        : 1,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.currentNode !== state.currentNode) {
      return {
        excludedFromFlatteningFields: props.currentNode
          ? props.currentNode.node?.excludedFromFlatteningFields.length > 0
            ? props.currentNode.node?.excludedFromFlatteningFields
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
              Разложение вложенного JSON в плоский.
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Эта нода раскладывает вложенный JSON в плоский. По умолчанию, все вложенные поля будут разложены. Но Вы можете указать поля, которые
                не хотите раскладывать.
              </DialogContentText>
              {this.state.excludedFromFlatteningFields.map((value, ind) => {
                return (
                  <Grid container direction={'row'} alignItems={'center'}>
                    <TextField
                      // error={this.state.excludedFromFlatteningFields[ind] === ''}
                      value={this.state.excludedFromFlatteningFields[ind]}
                      disabled={!this.props.canEdit}
                      variant={'standard'}
                      placeholder={'Поле не введено'}
                      label={'Поле, которое не нужно раскладывать'}
                      style={{
                        width:
                          ind === this.state.excludedFromFlatteningFields.length - 1 && this.state.excludedFromFlatteningFields.length !== 1
                            ? 'calc(100% - 132px)'
                            : 'calc(100% - 66px)',
                        marginTop: 10,
                      }}
                      onChange={(event) => {
                        const tmp = this.state.excludedFromFlatteningFields;
                        tmp[ind] = event.target.value;
                        this.setState({ excludedFromFlatteningFields: tmp, numArgs: tmp.length });
                      }}
                    ></TextField>
                    {this.state.excludedFromFlatteningFields.length !== 1 && (
                      <Button
                        // variant={"standard"}
                        color={'primary'}
                        style={{
                          height: '56px',
                          marginTop: '8px',
                          marginLeft: 2,
                        }}
                        disabled={!this.props.canEdit}
                        onClick={() => {
                          const tmp = this.state.excludedFromFlatteningFields;
                          tmp.splice(ind, 1);
                          this.setState({ excludedFromFlatteningFields: tmp, numArgs: tmp.length });
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    )}
                    {ind === this.state.excludedFromFlatteningFields.length - 1 && (
                      <Button
                        disabled={!this.props.canEdit}
                        // variant={"standard"}
                        color={'primary'}
                        style={{
                          height: '56px',
                          marginTop: '8px',
                          marginLeft: 2,
                        }}
                        onClick={() => {
                          const numArgs = this.state.numArgs + 1;
                          if (this.state.excludedFromFlatteningFields[this.state.excludedFromFlatteningFields.length - 1] !== '')
                            this.setState({
                              excludedFromFlatteningFields: [...this.state.excludedFromFlatteningFields, ''],
                              numArgs: numArgs,
                            });
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

export default withStyles(styles)(FlattenNodeItem);
