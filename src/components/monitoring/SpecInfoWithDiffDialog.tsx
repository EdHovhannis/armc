import { Accordion, AccordionDetails, AccordionSummary, Grid, IconButton, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, withStyles } from '@material-ui/core/styles';
import { FileCopy } from '@material-ui/icons';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiffEditor } from '@monaco-editor/react';
import * as React from 'react';

import { DruidConfigurationInfo, SupervisorDruidConfigurationInfo } from '../../store/monitoring/Types';
import { JsonPathUtils } from '../../utils/JsonPathUtils';

const styles = (theme) =>
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
  });

interface SpecInfoWithDiffProps {
  close: () => void;
  displayInfo: (info: string) => void;
  currentSupervisorSpec?: DruidConfigurationInfo;
  instanceName: string;

  indexConfiguration?: SupervisorDruidConfigurationInfo;
  error?: string;
  detailError?: any;
}

interface SpecInfoWithDiffState {}

class SpecInfoWithDiffDialog extends React.Component<SpecInfoWithDiffProps, SpecInfoWithDiffState> {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    if (!this.props.indexConfiguration) {
      return (
        <React.Fragment>
          <Dialog open={true} onClose={() => this.props.close()} fullWidth maxWidth={'xl'}>
            <DialogTitle color={'primary'} style={{ cursor: 'move' }} id="draggable-dialog-title">
              При получении спецификации Druid Supervisor произошла ошибка.
            </DialogTitle>
            <Typography variant="body1">{this.props.error}</Typography>
            {this.props.detailError && (
              <Accordion square className={classes.accordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ padding: 0 }}>
                  <Typography>Подробнее</Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.block}>
                  <Typography variant="body2" gutterBottom color={'error'}>
                    {this.props.detailError}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}
          </Dialog>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Dialog open={true} onClose={() => this.props.close()} fullWidth maxWidth={'xl'}>
          <DialogTitle style={{ cursor: 'move' }}>Информация о спецификации индекса {this.props.instanceName}</DialogTitle>
          <DialogContent>
            <Grid container direction={'column'} style={{ width: '100%', paddingLeft: 10, paddingRight: 15 }}>
              <Grid container direction={'row'} alignContent={'center'}>
                <Grid container direction={'row'} style={{ width: '50%' }}>
                  <Typography variant={'body1'} style={{ paddingLeft: '25%' }}>
                    <b>Текущая спецификация</b>
                  </Typography>
                  <IconButton
                    size={'small'}
                    onClick={() => {
                      navigator.clipboard.writeText(this.props.currentSupervisorSpec?.supervisorSpec || '');
                      this.props.displayInfo('Текущая спецификация скопирована в буфер обмена');
                    }}
                  >
                    <FileCopy color={'primary'} />
                  </IconButton>
                </Grid>
                <Grid container direction={'row'} style={{ width: '50%' }}>
                  <Typography variant={'body1'} style={{ paddingLeft: '20%' }}>
                    <b>Предполагаемая спецификация</b>
                  </Typography>
                  <IconButton
                    size={'small'}
                    onClick={() => {
                      navigator.clipboard.writeText(this.props.indexConfiguration?.supervisorSpec || '');
                      this.props.displayInfo('Предполагаемая спецификация скопирована в буфер обмена');
                    }}
                  >
                    <FileCopy color={'primary'} />
                  </IconButton>
                </Grid>
                <DiffEditor
                  className={'editor'}
                  height={'800px'}
                  language="json"
                  original={JsonPathUtils.createJsonWithCommentInfo(this.props.currentSupervisorSpec)}
                  modified={JsonPathUtils.createJsonWithCommentInfo(this.props.indexConfiguration)}
                  options={{ readOnly: true, selectionClipboard: false }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions style={{ marginTop: 6 }}>
            <Button variant={'contained'} onClick={() => this.props.close()} color="primary">
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(SpecInfoWithDiffDialog);
