import { Accordion, AccordionDetails, AccordionSummary, ThemeProvider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { createStyles, withStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { SupervisorDruidConfigurationInfo } from '../../store/monitoring/Types';
import { JsonPathUtils, themeJsonColor } from '../../utils/JsonPathUtils';

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
  });

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-info-index" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface DruidSpecTaskConfigurationDialogProps {
  indexConfiguration?: SupervisorDruidConfigurationInfo;
  error?: string;
  detailError?: any;

  zoneId?: string;
  id: number;

  instanceName: string;
  isCreation: boolean;

  close(): any;
}

export interface DruidSpecTaskConfigurationDialogState {
  openDiffDialog: boolean;
}

class DruidSpecTaskConfigurationDialog extends React.Component<DruidSpecTaskConfigurationDialogProps, DruidSpecTaskConfigurationDialogState> {
  constructor(props) {
    super(props);
    this.state = {
      openDiffDialog: false,
    };
  }

  render() {
    const { classes } = this.props;
    if (!this.props.indexConfiguration) {
      return (
        <React.Fragment>
          <Dialog
            open={true}
            onClose={() => this.props.close()}
            maxWidth={false}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
          >
            <ResizableBox width={910} height={956} className={classes.resizable}>
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
            </ResizableBox>
          </Dialog>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <Dialog
          open={true}
          onClose={() => this.props.close()}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
        >
          <ResizableBox width={960} height={956} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              {this.props.isCreation ? 'С' : ' Текущая с'}пецификация Druid Supervisor для экземпляра <b>{this.props.instanceName}</b>
            </DialogTitle>
            <DialogContent>
              <Grid direction={'column'} style={{ paddingLeft: 16, width: '100%' }}>
                <Grid item direction={'column'} style={{ width: '100%' }}>
                  <Typography variant="body2" display="block" style={{ width: '100%', fontSize: '15px' }}>
                    Версия глобальной конфигурации, с которой {this.props.isCreation ? 'будет ' : ''} запущен экземпляр:{' '}
                    {this.props.indexConfiguration.globalConfigurationVersion}
                  </Typography>
                  <Typography variant="body2" display="block" style={{ marginTop: 10, width: '100%', fontSize: '15px' }}>
                    Версия конфигурации, на которой {this.props.isCreation ? 'будет ' : ''} запущен экземпляр:{' '}
                    {this.props.indexConfiguration.configurationVersion}
                  </Typography>
                </Grid>
                <Grid item direction={'column'} style={{ width: '100%', marginTop: 4 }}>
                  <Paper style={{ padding: 4 }}>
                    <ThemeProvider theme={themeJsonColor}>
                      <Typography
                        variant="body2"
                        display="block"
                        style={{ marginTop: 6, marginLeft: 6, marginRight: 6, width: '100%', fontSize: '12px' }}
                      >
                        Параметры спецификации, которые берутся из значений по умолчанию Druid
                      </Typography>
                      <Typography
                        variant="body2"
                        display="block"
                        color={'primary'}
                        style={{ marginTop: 4, marginLeft: 6, marginRight: 6, width: '100%', fontSize: '12px' }}
                      >
                        Параметры спецификации, которые берутся из глобальной конфигурации
                      </Typography>
                      <Typography
                        variant="body2"
                        display="block"
                        color={'secondary'}
                        style={{ margin: 6, marginTop: 4, width: '100%', fontSize: '12px' }}
                      >
                        Параметры спецификации, которые берутся из конфигурации {this.props.isCreation ? 'индекса' : 'экземпляра'}
                      </Typography>
                    </ThemeProvider>
                  </Paper>
                </Grid>

                <Paper style={{ padding: 12, marginTop: 10 }}>{JsonPathUtils.createJsonWithColoredInfo(this.props.indexConfiguration)}</Paper>
              </Grid>
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button variant={'contained'} onClick={() => this.props.close()} color="primary">
                Закрыть
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(DruidSpecTaskConfigurationDialog);
