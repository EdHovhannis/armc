import { Button, Grid } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';

export interface ConfirmDialogProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
  okString: string;
  cancelString: string;

  needCustomButton: boolean;
  customButtonText: string;
  buttonEffect: () => void;
}

export enum DEFAULT_DECISION {
  OK = 'Ok',
}

export default function ConfirmDialog(props) {
  const { onClose, selectedValue, open, warningText } = props;
  const { needCustomButton, buttonEffect, customButtonText } = props;
  let { okString, cancelString } = props;

  if (okString === null) {
    okString = DEFAULT_DECISION.OK;
  }

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value: string) => {
    onClose(value);
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby={'confirm-dialog-title'}>
      <DialogTitle id={'confirm-dialog-title'}>{warningText}</DialogTitle>
      <Grid container direction={'row'} style={{ marginBottom: '3px' }}>
        <Grid justifyContent={'flex-start'} style={{ width: '50%' }}>
          {needCustomButton && (
            <Grid style={{ marginLeft: '16px', marginRight: '5px' }}>
              <Button variant={'outlined'} color={'primary'} onClick={buttonEffect}>
                {customButtonText}
              </Button>
            </Grid>
          )}
        </Grid>
        <Grid container direction={'row'} justifyContent={'flex-end'} style={{ width: needCustomButton ? '50%' : '100%' }}>
          <Button variant={'contained'} color={'primary'} onClick={() => handleListItemClick('Ok')}>
            {okString}
          </Button>
          <Grid style={{ marginLeft: '5px', marginRight: '5px' }}>
            {Boolean(cancelString) && (
              <Button variant={'contained'} color={'primary'} onClick={() => handleListItemClick('Cancel')}>
                {cancelString}
              </Button>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Dialog>
  );
}
