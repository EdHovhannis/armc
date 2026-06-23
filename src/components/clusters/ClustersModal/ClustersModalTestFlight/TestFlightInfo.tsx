import { Box, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ClassNameMap } from '@material-ui/styles';
import * as React from 'react';

import { TestConnection, TestConnectionResult } from '../../types';

interface ITestFlightInfo {
  classes: ClassNameMap;
}

const TestFlightInfo: React.FC<ITestFlightInfo & TestConnection> = ({
  classes,
  bootstrap,
  executor,
  result,
  error,
  warnings,
}: ITestFlightInfo & TestConnection) => {
  return (
    <>
      <Typography variant="overline" className={classes[result.toLowerCase()]}>
        {TestConnectionResult[result]}
      </Typography>
      <Typography>Запрос выполнен с</Typography>
      <Typography variant="subtitle2">{executor}</Typography>
      {warnings && (
        <Box>
          {warnings.map((row) => (
            <Alert key={row} icon={false} severity="warning" className={classes.alert}>
              {row}
            </Alert>
          ))}
        </Box>
      )}
      {error && (
        <Alert icon={false} severity="error" className={classes.alert}>
          {error}
        </Alert>
      )}
      {bootstrap && (
        <>
          <Typography className={classes.message}>Полный список брокеров</Typography>
          <Typography variant="subtitle2">{bootstrap}</Typography>
        </>
      )}
    </>
  );
};

export default TestFlightInfo;
