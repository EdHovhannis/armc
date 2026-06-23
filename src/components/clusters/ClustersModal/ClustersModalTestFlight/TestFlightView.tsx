import { Dialog, DialogContent, DialogTitle, Typography, Grid, Button, CircularProgress } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ClassNameMap } from '@material-ui/styles';
import * as React from 'react';

import { TestConnection } from '../../types';

import TestFlightInfo from './TestFlightInfo';

interface ITestFlightView {
  result: TestConnection | null;
  error: string | null;
  loading: boolean;
  visible: boolean;
  isEdit: boolean;
  classes: ClassNameMap;
  visibleHandler(): void;
  bootstrapServersHandler(servers: string | undefined): void;
}

const TestFlightView: React.FC<ITestFlightView> = ({
  result,
  error,
  loading,
  visible,
  isEdit,
  classes,
  visibleHandler,
  bootstrapServersHandler,
}: ITestFlightView) => {
  return (
    <Dialog fullWidth maxWidth="xs" open={visible}>
      <DialogTitle className={classes.title}>Проверка подключения</DialogTitle>
      <DialogContent>
        <>
          {loading && <CircularProgress size={20} />}
          {!loading && result && <TestFlightInfo classes={classes} {...result} />}
          {error && (
            <Alert icon={false} severity="error" className={classes.alert}>
              {error}
            </Alert>
          )}
        </>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Button disabled={isEdit || result === null || result.result === 'FAILED'} onClick={() => bootstrapServersHandler(result?.bootstrap)}>
              Подставить брокеры
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={() => visibleHandler()}>
              Закрыть
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default TestFlightView;
