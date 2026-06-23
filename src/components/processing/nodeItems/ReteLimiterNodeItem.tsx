import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Grid,
  withStyles,
  Select,
  MenuItem,
  TextField,
} from '@material-ui/core';
import IndexProvider from '@src/containers/index/IndexProvider';
import * as React from 'react';
import { FC, useState } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { ProcessingNode } from '../../../store/flow/Types';

const styles = () =>
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

export interface ReteLimiterNodeItemProps {
  displayError(msg: string): any;

  onClose(value: string, data?: any): any;

  close(value: boolean): any;

  currentNode?: ProcessingNode;
  schemaNames: string[];
  canEdit: boolean;
  classes: {
    resizable: any;
  };
}

const PaperComponent = (props: any) => {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
};

const Units = ['MB/s', 'KB/s', 'B/s'];

const ReteLimiterNodeItem: FC<ReteLimiterNodeItemProps> = (props) => {
  const { close, onClose, displayError, canEdit, classes } = props;
  const [messagesPerSecondValue, setMessagesPerSecondValue] = useState(0);
  const [messagesPerSecondUnit, setUnits] = useState('B/s');
  const [bytesPerSecond, setBytesPerSecond] = useState(0);

  const onSpeedTextChange = (e: { target: { value: string } }) => {
    const converted = IndexProvider.calculateBytesByDelimeter(parseInt(e.target.value), messagesPerSecondUnit.split('/')[0] as string);
    setMessagesPerSecondValue(parseInt(e.target.value));
    setBytesPerSecond(converted);
  };

  const onSpeedUnitChange = (e: any) => {
    const converted = IndexProvider.calculateBytesByDelimeter(messagesPerSecondValue, e.target.value.split('/')[0] as string);
    setUnits(e.target.value);
    setBytesPerSecond(converted);
  };

  return (
    <React.Fragment>
      <Dialog
        open={true}
        onClose={(e) => {
          close(false);
        }}
        maxWidth={false}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <ResizableBox width={750} className={classes.resizable}>
          <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
            Конфигурация RateLimiter
          </DialogTitle>
          <DialogContent>
            <DialogContentText>Укажите максимальную скорость обработки данных</DialogContentText>
            <Grid
              container
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                overflow: 'auto',
                padding: '8px',
              }}
            >
              <TextField
                style={{ flex: '0.7' }}
                required
                value={messagesPerSecondValue}
                onChange={onSpeedTextChange}
                label="Максимальная скорость записи"
                variant="outlined"
                type="number"
              />
              <Select style={{ flex: '0.2' }} value={messagesPerSecondUnit} variant="outlined" onChange={onSpeedUnitChange}>
                {Units.map((unit) => (
                  <MenuItem value={unit} key={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </DialogContent>
          <DialogActions style={{ marginTop: 6 }}>
            <Button
              onClick={(e) => {
                onClose('Cancel');
                close(false);
              }}
              color="primary"
            >
              {canEdit ? 'Отменить' : 'Закрыть'}
            </Button>
            {canEdit && (
              <Button
                onClick={(e) => {
                  if (bytesPerSecond <= 0) {
                    displayError('Unit не может быть 0 или ниже 0');
                    return;
                  }
                  onClose('Ok', {
                    type: 'rateLimiter',
                    messagesPerSecond: 0,
                    bytesPerSecond,
                    limitBy: 'BYTES',
                  });
                  close(false);
                }}
                color="primary"
              >
                Сохранить
              </Button>
            )}
          </DialogActions>
        </ResizableBox>
      </Dialog>
    </React.Fragment>
  );
};

export default withStyles(styles)(ReteLimiterNodeItem);
