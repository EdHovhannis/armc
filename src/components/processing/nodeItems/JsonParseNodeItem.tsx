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

export interface JsonParseNodeItemProps {
  close(value: boolean): any;
}

export interface JsonParseNodeItemState {}

class JsonParseNodeItem extends React.Component<JsonParseNodeItemProps, JsonParseNodeItemState> {
  constructor(props) {
    super(props);
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
              Нода парсинга JSON-сообщений.
            </DialogTitle>
            <DialogContent>
              <DialogContentText>Парсит входящий поток данных в формате JSON.</DialogContentText>
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button
                onClick={(e) => {
                  this.props.close(false);
                }}
                color="primary"
              >
                Закрыть
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(JsonParseNodeItem);
