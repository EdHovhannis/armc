import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Paper from '@material-ui/core/Paper';
import { createStyles } from '@material-ui/core/styles';
import withStyles from '@material-ui/core/styles/withStyles';
import { Component } from 'react';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import ConfirmDialog from '../ConfirmDialog';

import AddMessageForm from './AddMessageForm';

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
    createContainer: {
      display: 'flex',
      flexDirection: 'column' as any,
      width: 600,
      height: 620,
      justifyContent: 'space-between',
      padding: 16,
    },
    paramContainer: {
      display: 'flex',
      flexDirection: 'row' as any,
      justifyContent: 'space-between',
      marginTop: 8,
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'row' as any,
      alignContent: 'flex-end',
    },
  });

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface KafkaAddRecordDialogProps {}

export interface KafkaAddRecordDialogDispatchProps {
  onAddRecordToTopic: (topicId: number, key: any, record: any, successCallback: () => void) => void;
}

export interface KafkaAddRecordDialogParentProps {
  isOpen: boolean;
  onAddDialogClose: () => void;
  topicId: number;

  continueAdd(isContinue: boolean);

  onAddCreateSuccess: () => void;
}

interface KafkaAddRecordDialogState {
  confirmDialogOpen: boolean;
  key: string;
  value: string;
  topicId: number;
}

class KafkaAddRecordDialog extends Component<
  KafkaAddRecordDialogParentProps & KafkaAddRecordDialogDispatchProps & KafkaAddRecordDialogProps & any,
  KafkaAddRecordDialogState
> {
  constructor(props) {
    super(props);
    this.state = {
      confirmDialogOpen: false,
      key: '',
      value: '',
      topicId: this.props.topicId != null ? this.props.topicId : -1,
    };

    this.handleConfirmDialogOpen = this.handleConfirmDialogOpen.bind(this);
    this.handleConfirmDialogClose = this.handleConfirmDialogClose.bind(this);
  }

  handleConfirmDialogOpen() {
    this.setState({
      confirmDialogOpen: true,
      key: '',
      value: '',
    });
  }

  handleConfirmDialogClose(value) {
    this.setState({ confirmDialogOpen: false });
    if (value === 'Ok') {
      this.props.continueAdd(true);
    }
  }

  render(): React.ReactNode {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Dialog
          open={this.props.isOpen}
          onClose={(e) => {
            this.props.onAddDialogClose();
          }}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
        >
          <ResizableBox height={620} width={600} className={classes.resizable}>
            {/*<Dialog open={this.props.isOpen} onClose={this.props.onDialogClose}>*/}
            <div className={classes.createContainer}>
              <div style={{ paddingBottom: 4 }}>
                <Typography variant="h6" style={{ width: '100%' }}>
                  Введите свое сообщение:
                </Typography>
                <AddMessageForm
                  addRecord={(record) => {
                    this.setState({ value: record });
                  }}
                  addKey={(key) => {
                    this.setState({ key: key });
                  }}
                />
              </div>
              <div>
                <Button
                  variant={'outlined'}
                  color={'primary'}
                  onClick={() => {
                    const state: KafkaAddRecordDialogState = this.state;
                    state.topicId = this.props.topicId;
                    this.props.onAddRecordToTopic(state.topicId, state.key, state.value, () => {
                      this.handleConfirmDialogOpen();
                      this.props.onAddCreateSuccess();
                    });
                  }}
                >
                  Добавить
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  variant={'outlined'}
                  color={'primary'}
                  onClick={(e) => {
                    this.props.onAddDialogClose();
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </ResizableBox>
        </Dialog>
        <ConfirmDialog
          warningText={'Вы хотите добавить еще одно сообщение?'}
          open={this.state.confirmDialogOpen}
          okString={'Добавить'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialogClose}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(KafkaAddRecordDialog);
