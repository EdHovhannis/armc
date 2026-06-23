import { InputAdornment, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { OverdraftConfig } from '../../store/overdraft/Types';
import { OverdraftTableInfo } from '../../utils/OverdraftUtils';
import ConfirmDialog from '../ConfirmDialog';

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
    <Draggable handle="#draggable-dialog-edit-overdraft-config" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface EditOverdraftConfigProps {
  close: () => void;
  editConfig: (overdraft: OverdraftConfig) => void;
  displayError: (error: string) => void;

  defaultOverdraft: OverdraftTableInfo;
  indexType: string;
}

export interface EditOverdraftConfigStat {
  maxOverdraftedTasks: number;
  maxOverdraftPercent: number;
  confirmClose: boolean;
}

class EditOverdraftConfig extends React.Component<EditOverdraftConfigProps, EditOverdraftConfigStat> {
  constructor(props) {
    super(props);
    this.state = {
      maxOverdraftedTasks: this.props.defaultOverdraft.maxOverdraftedTasks,
      maxOverdraftPercent: this.props.defaultOverdraft.maxOverdraftPercent,
      confirmClose: false,
    };
    this.handleConfirmCloseDialogClose = this.handleConfirmCloseDialogClose.bind(this);
  }

  handleConfirmCloseDialogClose(value) {
    this.setState({ confirmClose: false });
    if (value === 'Ok') {
      this.props.close();
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Dialog
          open={true}
          onClose={() => {
            this.setState({ confirmClose: true });
          }}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-edit-overdraft-config"
        >
          <ResizableBox width={600} height={300} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-edit-overdraft-config">
              Настройки увеличения скорости
            </DialogTitle>
            <DialogContent>
              <Grid direction={'column'} style={{ width: '100%' }}>
                <Grid item>
                  <TextField fullWidth variant={'standard'} defaultValue={this.props.indexType} label="Тип экземпляра" disabled={true} />
                </Grid>
                <Grid item>
                  <TextField
                    fullWidth
                    variant={'standard'}
                    error={
                      this.state.maxOverdraftedTasks < 0 ||
                      this.state.maxOverdraftedTasks > 10000 ||
                      isNaN(this.state.maxOverdraftedTasks) ||
                      this.state.maxOverdraftedTasks == ''
                    }
                    value={this.state.maxOverdraftedTasks}
                    defaultValue={this.props.defaultOverdraft.maxOverdraftedTasks}
                    onChange={(e) => {
                      this.setState({
                        maxOverdraftedTasks: e.target.value,
                      });
                    }}
                    label="Макс. количество экземпляров"
                    disabled={false}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    fullWidth
                    variant={'standard'}
                    error={
                      this.state.maxOverdraftPercent < 0 ||
                      this.state.maxOverdraftPercent > 10000 ||
                      isNaN(this.state.maxOverdraftPercent) ||
                      this.state.maxOverdraftPercent == ''
                    }
                    value={this.state.maxOverdraftPercent}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    defaultValue={this.props.defaultOverdraft.maxOverdraftPercent}
                    onChange={(e) => {
                      this.setState({
                        maxOverdraftPercent: e.target.value,
                      });
                    }}
                    label="Макс. процент увеличения скорости"
                    disabled
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button
                onClick={() => {
                  this.setState({ confirmClose: true });
                }}
                color="primary"
              >
                Закрыть
              </Button>
              <Button
                onClick={() => {
                  if (this.state.maxOverdraftedTasks < 0 || isNaN(this.state.maxOverdraftedTasks) || this.state.maxOverdraftedTasks == '') {
                    this.props.displayError('Максимальное количество экземпляров не введено или введено некорректно');
                    return;
                  }
                  if (this.state.maxOverdraftPercent > 10000 || this.state.maxOverdraftedTasks > 10000) {
                    this.props.displayError('Максимально доступное значение для ввода: 10 000');
                    return;
                  }
                  const config: OverdraftConfig = {
                    maxOverdraftPercent: parseInt(this.state.maxOverdraftPercent),
                    maxOverdraftedTasks: parseInt(this.state.maxOverdraftedTasks),
                  };
                  this.props.editConfig(config);
                  this.props.close();
                }}
                variant={'contained'}
                color="primary"
              >
                Сохранить
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>

        <ConfirmDialog
          warningText={'Вы уверены, что хотите закрыть окно?'}
          open={this.state.confirmClose}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmCloseDialogClose}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(EditOverdraftConfig);
