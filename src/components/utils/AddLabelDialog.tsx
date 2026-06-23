import { Chip, Grid, IconButton, Tooltip, FormControl, FormHelperText, InputLabel, Input, alpha } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { green } from '@material-ui/core/colors';
import { createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { Clear } from '@material-ui/icons';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { ERROR_NAME_REGEXP_STRING, NAME_REGEXP } from '../../utils/Utils';

function round(value) {
  return Math.round(value * 1e5) / 1e5;
}

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
    labelInputHelper: {
      backgroundColor: alpha(theme.palette.grey[700], 0.9),
      borderRadius: theme.shape.borderRadius,
      color: `${theme.palette.common.white} !important`,
      fontFamily: theme.typography.fontFamily,
      padding: '4px 8px',
      fontSize: theme.typography.pxToRem(10),
      lineHeight: `${round(14 / 10)}em`,
      maxWidth: 300,
      wordWrap: 'break-word',
      fontWeight: theme.typography.fontWeightMedium,
      position: 'absolute',
      top: '52px',
    },
    dialogContent: {
      overflowY: 'visible',
    },
  });

function PaperComponent(props) {
  return (
    <Draggable handle="#add-label-dialog" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface AddLabelDialogProps {
  labels: string[];
  projectShortName: string;
  name: string;
  canEdit: boolean;

  displayError: (msg: string) => void;
  addLabel: (label: string) => void;
  deleteLabel: (label: string) => void;
  close: () => void;
}

export interface AddLabelDialogStat {
  labels: string;
  label?: string;
}

class AddLabelDialog extends React.Component<AddLabelDialogProps & WithStyles<typeof styles>, AddLabelDialogStat> {
  constructor(props) {
    super(props);
    this.state = {
      labels: this.props.labels,
    };
  }

  render() {
    const { classes } = this.props;

    const chips: Array<any> = [];
    this.state.labels.map((label, ind) => {
      chips.push(
        <Chip
          id={'label' + ind}
          label={label}
          onDelete={() => {
            this.props.deleteLabel(label);
          }}
          style={{ backgroundColor: green[300], color: 'white', marginRight: 4, marginBottom: 4, maxWidth: '100%' }}
          variant={'outlined'}
        />,
      );
    });

    const isLabelInvalid = this.state.label?.length > 0 && !NAME_REGEXP.exec(this.state.label);
    return (
      <React.Fragment>
        <Dialog
          open={true}
          onClose={() => {
            this.props.close();
          }}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="add-label-dialog"
        >
          <ResizableBox height={'350ss'} width={'600ss'} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="add-label-dialog">
              <Grid container direction="row" justifyContent="space-between" alignItems="flex-start" style={{ margin: 10, width: '100%' }}>
                <Grid style={{ width: '95%' }}>
                  Список меток на индекс {this.props.projectShortName}/{this.props.name}
                </Grid>
                <Grid item style={{ width: '5%' }}>
                  <IconButton
                    onClick={() => {
                      this.props.close();
                    }}
                    color="primary"
                    size={'small'}
                  >
                    <Clear />
                  </IconButton>
                </Grid>
              </Grid>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
              {chips}
              {this.props.canEdit && (
                <React.Fragment>
                  <FormControl error={isLabelInvalid} fullWidth>
                    <InputLabel htmlFor="label-input">Метка</InputLabel>
                    <Input
                      onChange={(e) => {
                        if (e.target.value === '') {
                          this.setState({ label: undefined });
                        } else {
                          this.setState({ label: e.target.value.trim() });
                        }
                      }}
                      value={this.state.label}
                      fullWidth
                      id="label-input"
                    />
                    {isLabelInvalid && <FormHelperText className={classes.labelInputHelper}>{ERROR_NAME_REGEXP_STRING}</FormHelperText>}
                  </FormControl>
                </React.Fragment>
              )}
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              {this.props.canEdit && (
                <Button
                  onClick={(e) => {
                    if (this.state.label === '' || !this.state.label) {
                      this.props.displayError('Новая метка не введена');
                      return;
                    }
                    if (!NAME_REGEXP.exec(this.state.label)) {
                      this.props.displayError('Введеная метка не валидна. Вы ввели недопустимые символы. ');
                      return;
                    }
                    this.props.addLabel(this.state.label);
                  }}
                  color="primary"
                >
                  Добавить метку
                </Button>
              )}
            </DialogActions>
          </ResizableBox>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(AddLabelDialog);
