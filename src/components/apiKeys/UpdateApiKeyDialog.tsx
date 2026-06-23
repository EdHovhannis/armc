import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Input, InputLabel, TextField, Typography } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import { createStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { TimeToLive } from '../../store/apiKeys/Types';
import SizeConverter from '../../utils/SizeConverter';
import { Utils } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import { Loader } from '../utils/Loader';

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
    <Draggable handle="#draggable-dialog-admins-create" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface UpdateApiKeyDialogProps {
  close: () => void;
  onChange: (needTimeToLive: boolean, timeToLive: TimeToLive, description: string) => void;
  displayError: (errorMessage: string) => void;

  isTimeUnitsLoading: boolean;
  timeUnits: string[];
  description: string;
  user: string;
}

export interface UpdateApiKeyDialogStat {
  confirmClose: boolean;
  description: string;
  needAnotherTimeToLive: boolean;
  timeValue?: number;
  timeUnit?: string;
}

class UpdateApiKeyDialog extends React.Component<UpdateApiKeyDialogProps, UpdateApiKeyDialogStat> {
  constructor(props) {
    super(props);
    this.state = {
      confirmClose: false,
      description: this.props.description,
      needAnotherTimeToLive: false,
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
          onClose={(e) => {
            this.setState({ confirmClose: true });
          }}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-admins-create"
        >
          <ResizableBox width={900} height={'ss'} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-admins-create">
              Обновление API ключа для пользователя {this.props.user}
            </DialogTitle>
            <DialogContent>
              <Typography color="inherit" display="block" variant="subtitle1">
                Для обновления API ключа на тот же срок жизни, что и при создании нажмите "Подтвердить". Если Вы хотите изменить срок жизни или
                описание, укажите это ниже.
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.needAnotherTimeToLive}
                    onChange={(event) => {
                      this.setState({
                        needAnotherTimeToLive: event.target.checked,
                        timeValue: undefined,
                        timeUnit: undefined,
                      });
                    }}
                    color={'primary'}
                  />
                }
                label={'Задать новый параметры для ключа'}
              />
              {this.state.needAnotherTimeToLive && (
                <TextField
                  label="Описание"
                  margin="normal"
                  variant="standard"
                  fullWidth
                  multiline
                  helperText="Описание не может содержать более 100 символов"
                  value={this.state.description}
                  error={!this.state.description || this.state.description === '' || this.state.description?.length > 100}
                  defaultValue={this.props.description}
                  onChange={(e) => {
                    this.setState({ description: e.target.value });
                  }}
                />
              )}
              {this.state.needAnotherTimeToLive && (
                <React.Fragment>
                  {this.props.isTimeUnitsLoading ? (
                    <Loader style={{}} />
                  ) : (
                    <Grid direction={'row'} style={{ marginBottom: 10 }}>
                      <TextField
                        fullWidth
                        error={!Utils.isInputNumberPositiveInteger(this.state.timeValue)}
                        value={this.state.timeValue}
                        style={{ width: '80%' }}
                        variant="standard"
                        label="Время жизни ключа"
                        defaultValue={''}
                        onChange={(e) => {
                          this.setState({ timeValue: e.target.value });
                        }}
                      />
                      <FormControl style={{ marginLeft: '2%', width: '18%' }}>
                        <InputLabel id="select-time-unit"> </InputLabel>
                        <Select
                          labelId="select-time-unit"
                          value={this.state.timeUnit}
                          defaultValue={this.props.timeUnits[0]}
                          fullWidth
                          onChange={(e: any) => {
                            this.setState({ timeUnit: e.target.value });
                          }}
                          input={<Input />}
                        >
                          {this.props.timeUnits.map((unit, ind) => {
                            return (
                              <MenuItem value={unit} key={ind}>
                                {SizeConverter.mapToTimeUnits(unit)}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </React.Fragment>
              )}
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button
                onClick={(e) => {
                  this.setState({ confirmClose: true });
                }}
                color="primary"
              >
                Закрыть
              </Button>
              <Button
                disabled={
                  (this.state.needAnotherTimeToLive && !this.state.timeValue) ||
                  (this.state.needAnotherTimeToLive && !this.state.description) ||
                  (this.state.needAnotherTimeToLive && this.state.description === '')
                }
                onClick={(e) => {
                  if (this.state.needAnotherTimeToLive) {
                    if (!this.state.timeValue || !Utils.isInputNumberPositiveInteger(this.state.timeValue)) {
                      this.props.displayError('Время жизни ключа введено не верно');
                      return;
                    }
                    if (!this.state.description || this.state.description === '' || this.state.description?.length > 100) {
                      this.props.displayError('Описание не валидно');
                      return;
                    }
                  }
                  const timeToLive: TimeToLive = {
                    value: this.state.timeValue,
                    unit: this.state.timeUnit ? this.state.timeUnit : this.props.timeUnits[0],
                  };
                  this.props.onChange(this.state.needAnotherTimeToLive, timeToLive, this.state.description);
                  this.props.close();
                }}
                variant="contained"
                color="primary"
              >
                Подтвердить
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

export default withStyles(styles)(UpdateApiKeyDialog);
