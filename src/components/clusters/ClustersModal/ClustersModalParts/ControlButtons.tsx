import { Button, Grid } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/styles';
import { validateJmx } from '@src/components/utils/validateJmx';
import * as React from 'react';

interface IControlButtons {
  testDisabled: boolean;
  classes: ClassNameMap;
  saveHandler(): void;
  closeHandler(): void;
  testHandler(): void;
  bootstrapJmx: string | null;
}

const ControlButtons: React.FC<IControlButtons> = ({
  testDisabled,
  classes,
  bootstrapJmx,
  saveHandler,
  closeHandler,
  testHandler,
}: IControlButtons) => {
  return (
    <Grid container justifyContent="space-between">
      <Grid item>
        <Button variant="outlined" color="primary" onClick={() => closeHandler()}>
          Закрыть
        </Button>
      </Grid>
      <Grid item>
        <Button disabled={testDisabled} className={classes.button} onClick={() => testHandler()}>
          Проверить подключение
        </Button>
        <Button disabled={Boolean(validateJmx(bootstrapJmx))} variant="outlined" color="primary" onClick={() => saveHandler()}>
          Сохранить
        </Button>
      </Grid>
    </Grid>
  );
};

export default ControlButtons;
