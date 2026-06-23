import { Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import { createStyles, withStyles } from '@material-ui/core/styles';
import { DiffEditor } from '@monaco-editor/react';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

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
    accordion: {
      padding: 0,
      boxShadow: 'none',
      '&:before': {
        display: 'none',
      },
    },
    block: {
      display: 'block',
      padding: 0,
    },
    ace: {
      '.codeMarker': {
        background: ' #fff677',
        position: 'absolute',
        zIndex: 20,
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

interface DruidSpecDiffDialogProps {
  expectedSupervisorSpec: string;
  currentSupervisorSpec: string;

  close: () => void;
}

interface DruidSpecDiffDialogState {}

class DruidSpecDiffDialog extends React.Component<DruidSpecDiffDialogProps, DruidSpecDiffDialogState> {
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
          aria-labelledby="draggable-dialog-title"
        >
          <ResizableBox width={1000} height={1200} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              Разница между текущей и отредактированной спецификацией для индекса
            </DialogTitle>
            <DialogContent>
              <Grid container direction={'row'} alignContent={'center'}>
                <Grid item style={{ width: '50%' }}>
                  <Typography variant={'body1'} style={{ paddingLeft: '25%' }}>
                    <b>Текущая спецификация</b>
                  </Typography>
                </Grid>
                <Grid item style={{ width: '50%' }}>
                  <Typography variant={'body1'} style={{ paddingLeft: '20%' }}>
                    <b>Предполагаемая спецификация</b>
                  </Typography>
                </Grid>
              </Grid>
              <DiffEditor
                height="1000px"
                language="json"
                original={this.props.currentSupervisorSpec}
                modified={this.props.expectedSupervisorSpec}
                options={{ readOnly: true }}
              />
            </DialogContent>
          </ResizableBox>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(DruidSpecDiffDialog);
