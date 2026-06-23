import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  createStyles,
  Grid,
  makeStyles,
  TextField,
  Theme,
  Typography,
  Button,
} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useState } from 'react';
import * as React from 'react';

export interface WaitingDialogProps {
  open: boolean;
  selectedValue?: string;
  onClose: (value?: string) => void;
  complete: boolean;
  success: boolean;
  successMessage: string;
  errorMessage: string;
  customFormat?: boolean;
  customSuccessMessage?: boolean;
  needDetailedInfo?: boolean;
  details?: JSX.Element;
  title: string;
}

const useStyles = makeStyles(() =>
  createStyles({
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
  }),
);

export default function WaitingDialog(props: WaitingDialogProps) {
  const { onClose, selectedValue, open, complete, success, successMessage, errorMessage, customFormat } = props;
  const { needDetailedInfo, details } = props;
  const classes = useStyles();
  const [title, setTitle] = useState(props.title);

  const handleClose = () => {
    if (complete) {
      onClose(selectedValue);
    } else {
      return;
    }
  };

  const el = !complete ? (
    <CircularProgress color={'primary'} style={{ marginBottom: '5px' }} />
  ) : success ? (
    <Grid container direction={'column'} justifyContent={'center'}>
      {props.customSuccessMessage ? successMessage : <h4>{successMessage}</h4>}
      <Grid container direction={'row'} justifyContent={'flex-end'}>
        <Button variant={'contained'} color={'primary'} onClick={handleClose}>
          Ok
        </Button>
      </Grid>
    </Grid>
  ) : (
    <Grid container direction={'column'} justifyContent={'center'}>
      {customFormat ? errorMessage : <h4 style={{ margin: needDetailedInfo ? 0 : 2 }}>{errorMessage}</h4>}
      {needDetailedInfo && (
        <Accordion square className={classes.accordion} expanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ padding: 0 }}>
            <Typography>Подробнее</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.block}>
            <Typography variant="body2" gutterBottom color={'error'}>
              {details}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}
      <Grid container direction={'row'} justifyContent={'flex-end'}>
        <Button variant={'contained'} color={'primary'} onClick={handleClose}>
          Ok
        </Button>
      </Grid>
    </Grid>
  );

  const fin_el = !complete ? (
    <DialogTitle id={'waiting-dialog-title'}>
      {title}
      <Grid container style={{ display: 'flex' }} justifyContent={'center'}>
        {el}
      </Grid>
    </DialogTitle>
  ) : (
    <DialogTitle>
      <Grid container style={{ display: 'flex' }} justifyContent={'center'}>
        {el}
      </Grid>
    </DialogTitle>
  );

  return (
    <Dialog maxWidth={false} onClose={handleClose} aria-labelledby={'waiting-dialog-title'} open={open}>
      {fin_el}
    </Dialog>
  );
}
