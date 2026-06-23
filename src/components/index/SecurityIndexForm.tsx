import { Button, createStyles, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, withStyles } from '@material-ui/core';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import PermissionUserView from '../../containers/permissions/PermissionUserView';
import { Resource, Role } from '../../store/role/Types';

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

export interface SecurityIndexFormProps {
  close(open: boolean): any;

  indexId: boolean;
  indexProject: string;
  indexName: string;
}

export interface SecurityIndexFormState {}

class SecurityIndexForm extends React.Component<SecurityIndexFormProps, SecurityIndexFormState> {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Dialog
          open={true}
          onClose={(e) => this.props.close(false)}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
        >
          <ResizableBox className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              Настройки приватности индекса {this.props.indexProject}/{this.props.indexName}.
            </DialogTitle>
            <DialogContent>
              <Grid item xs={12}>
                <div style={{ padding: 12 }}>
                  <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
                    <PermissionUserView
                      canEditAccess={true}
                      roles={[
                        Role.FULL_TEXT_INDEX_EXPORT,
                        Role.FULL_TEXT_INDEX_VIEWER,
                        Role.AUDIT_EVENTS_EXPORT,
                        Role.DATA_VIEW_EDITOR,
                        Role.INDEX_DATA_VIEW_PERMISSION_MANAGER,
                      ]}
                      resourceId={this.props.indexId}
                      resource={Resource.FULL_TEXT_INDEX}
                      showSharedToggle={false}
                    />
                  </Grid>
                </div>
              </Grid>
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

export default withStyles(styles)(SecurityIndexForm);
