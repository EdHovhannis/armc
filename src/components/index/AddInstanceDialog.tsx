import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, withStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
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
  });

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-info-index" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface AddInstanceDialogProps {
  close: () => void;
  onAddZone: (zone: string) => void;
  displayError: (error: string) => void;

  fullName: string;
  checkedZones?: string[];
  zones: string[];
}

export interface AddInstanceDialogState {
  zone?: string;
}

class AddInstanceDialog extends React.Component<AddInstanceDialogProps, AddInstanceDialogState> {
  constructor(props) {
    super(props);
    this.state = {
      zone: undefined,
    };
  }

  render() {
    // @ts-ignore
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
          <ResizableBox width={550} height={270} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              Добавление экземпляра задачи в зону
            </DialogTitle>
            <DialogContent>
              <Grid direction={'column'} style={{ width: '100%' }}>
                <Grid item>
                  <TextField fullWidth variant={'standard'} defaultValue={this.props.fullName} label="Название конфигурации" disabled={true} />
                </Grid>
                <Grid item style={{ paddingTop: 12 }}>
                  <Autocomplete
                    id="choose-zone-for-instance"
                    fullWidth
                    noOptionsText={'Зоны не найдены'}
                    getOptionDisabled={(option) =>
                      this.props.checkedZones?.length ? this.props.checkedZones?.some((inst) => inst === option) : false
                    }
                    getOptionLabel={(option) => option}
                    renderOption={(option) => option}
                    options={this.props.zones}
                    onChange={(event, value) => {
                      if (value != null && value && value !== '') {
                        this.setState({ zone: value });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        // label={'Зона'}
                        helperText={'Конфигурация будет размещена в выбранной Вами зоне'}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button onClick={() => this.props.close()} color="primary">
                Закрыть
              </Button>
              <Button
                onClick={() => {
                  if (this.state.zone === '' || !this.state.zone) {
                    this.props.displayError('Зона для размещения экземпляра задачи не выбрана');
                    return;
                  }
                  this.props.onAddZone(this.state.zone);
                  this.props.close();
                }}
                variant={'contained'}
                color="primary"
              >
                Добавить
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(AddInstanceDialog);
