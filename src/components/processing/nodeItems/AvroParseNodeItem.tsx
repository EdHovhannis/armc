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
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { ProcessingNode } from '../../../store/flow/Types';
import { CustomAutocomplete as FlowSchemaNames } from '../../utils/CustomAutocomplete';

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

export interface AvroParseItemProps {
  displayError(msg: string): any;

  onClose(value: string, data?: any): any;

  close(value: boolean): any;

  currentNode?: ProcessingNode;
  schemaNames: string[];
  canEdit: boolean;
}

export interface AvroParseNodeItemState {
  schemaName: string;
  currentNode?: ProcessingNode;
}

class AvroParseNodeItem extends React.Component<AvroParseItemProps, AvroParseNodeItemState> {
  constructor(props) {
    super(props);

    this.state = {
      schemaName: this.props.currentNode ? this.props.currentNode.node.schemaName : '',
    };
  }

  // static getDerivedStateFromProps(props, state) {
  //     if (props.currentNode !== state.currentNode) {
  //         return {
  //             schemaName: props.currentNode ? props.currentNode.node.schemaName : "",
  //             currentNode: props.currentNode
  //         };
  //     }
  // }

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
              Конфигурация Схемы AVRO.
            </DialogTitle>
            <DialogContent>
              <DialogContentText>Выберите схему авро</DialogContentText>
              <FlowSchemaNames
                style={{ marginTop: '16px', width: '100%' }}
                value={this.state.schemaName}
                options={this.props.schemaNames}
                id={'archiveFormatData'}
                onChange={(schemaName) => this.setState({ schemaName })}
                label={'Схема'}
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
                    if (this.state.schemaName == '' || this.state.schemaName == null) {
                      this.props.displayError('Схема не выбрана!');
                      return;
                    }
                    this.props.onClose('Ok', {
                      schemaName: this.state.schemaName,
                      node: this.props.currentNode,
                    } as AvroParseNodeItemState);
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

export default withStyles(styles)(AvroParseNodeItem);
