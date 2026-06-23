import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { BlockingDataDescription, ConstraintType } from '../../store/constraint/Types';

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
    <Draggable handle="#draggable-dialog-info-index" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface BlocksInfoDialogProps {
  type: ConstraintType;
  title: any;
  description: BlockingDataDescription;

  close(): any;
}

export interface BlocksInfoDialogStat {}

class BlocksInfoDialog extends React.Component<BlocksInfoDialogProps, BlocksInfoDialogStat> {
  constructor(props) {
    super(props);
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
          aria-labelledby="draggable-dialog-blocks-info-title"
        >
          <ResizableBox width={920} height={165} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-blocks-info-title">
              {this.props.title}
            </DialogTitle>
            <DialogContent>
              <Typography>{this.props.description.description}</Typography>
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button onClick={() => this.props.close()} color="primary">
                Закрыть
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(BlocksInfoDialog);
