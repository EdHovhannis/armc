import { createStyles, makeStyles, Theme } from '@material-ui/core';
import * as React from 'react';
import { useEffect, useState } from 'react';

import ClusterService from '../../../../services/ClusterService';
import { Connection, TestConnection } from '../../types';

import TestFlightView from './TestFlightView';

interface ITestFlightContainer {
  visible: boolean;
  connection: Connection;
  isEdit: boolean;
  visibleHandler(): void;
  bootstrapServersHandler(servers: string | undefined): void;
}

export const TestFlightContainer: React.FC<ITestFlightContainer> = ({
  visible,
  connection,
  isEdit,
  visibleHandler,
  bootstrapServersHandler,
}: ITestFlightContainer) => {
  const [result, setResult] = useState<TestConnection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      ClusterService.testKafkaConnection(
        connection,
        (result) => setResult(result),
        (error) => setError(error),
      ).finally(() => setLoading(false));
    }
  }, [visible]);

  const classes = makeStyles((theme: Theme) =>
    createStyles({
      title: {
        marginBottom: -25,
      },
      alert: {
        marginTop: 5,
        marginBottom: 5,
      },
      message: {
        marginTop: 10,
      },
      success: {
        color: theme.palette.success.dark,
      },
      failed: {
        color: theme.palette.error.main,
      },
    }),
  )();

  return (
    <TestFlightView
      result={result}
      error={error}
      loading={loading}
      visible={visible}
      isEdit={isEdit}
      classes={classes}
      visibleHandler={visibleHandler}
      bootstrapServersHandler={bootstrapServersHandler}
    />
  );
};
