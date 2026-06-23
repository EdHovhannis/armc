import { TextField } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/styles';
import * as React from 'react';

import { Cluster, Connection } from '../../types';

import TlsFields from './TlsFields';

interface IConnectionFields {
  connection: Connection;
  valid: boolean;
  disabled: boolean;
  classes: ClassNameMap;
  changeHandler<T extends keyof Cluster>(property: T, value: Cluster[T]): void;
}

const ConnectionFields: React.FC<IConnectionFields> = ({ connection, valid, disabled, classes, changeHandler }: IConnectionFields) => {
  const connectionHandler = <T extends keyof Connection>(property: T, value: Connection[T]) => {
    const newConnection: Connection = connection;
    newConnection[property] = value;
    changeHandler('connection', newConnection);
  };

  return (
    <>
      <TextField
        multiline
        rows={2}
        label="Подключение"
        disabled={disabled}
        error={!valid}
        value={connection.bootstrapServers}
        helperText={!valid && 'Подключение обязательно для заполнения'}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => connectionHandler('bootstrapServers', e.target.value)}
      />
      <TlsFields tls={connection.tls} classes={classes} connectionHandler={connectionHandler} />
    </>
  );
};

export default ConnectionFields;
